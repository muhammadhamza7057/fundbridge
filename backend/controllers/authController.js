const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const getFirebaseAdmin = require('../firebaseAdmin');
const { recalculateTrustFields } = require('../utils/trust');

const allowedRoles = ['founder', 'investor', 'startup_rep', 'guest'];
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || 'fundbridge-55b5e';
let firebaseCertCache = { fetchedAt: 0, certs: null };

function base64UrlToBuffer(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  return Buffer.from(padded, 'base64');
}

async function fetchFirebaseCerts() {
  const now = Date.now();
  const isFresh = firebaseCertCache.certs && now - firebaseCertCache.fetchedAt < 60 * 60 * 1000;
  if (isFresh) {
    return firebaseCertCache.certs;
  }

  const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!response.ok) {
    throw new Error(`Unable to fetch Firebase certs: ${response.status}`);
  }

  const certs = await response.json();
  firebaseCertCache = { fetchedAt: now, certs };
  return certs;
}

async function verifyFirebaseIdToken(idToken) {
  try {
    const admin = getFirebaseAdmin();
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    if (!String(error.message || '').includes('Missing Firebase service account')) {
      throw error;
    }
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid Firebase token format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = JSON.parse(base64UrlToBuffer(encodedHeader).toString('utf8'));
  const payload = JSON.parse(base64UrlToBuffer(encodedPayload).toString('utf8'));

  const certs = await fetchFirebaseCerts();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error('Unable to find Firebase signing certificate');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const signature = base64UrlToBuffer(encodedSignature);
  const isValid = verifier.verify(cert, signature);
  if (!isValid) {
    throw new Error('Invalid Firebase token signature');
  }

  if (payload.aud !== firebaseProjectId) {
    throw new Error('Firebase token audience does not match this project');
  }

  if (payload.iss !== `https://securetoken.google.com/${firebaseProjectId}`) {
    throw new Error('Firebase token issuer is invalid');
  }

  if (!payload.sub) {
    throw new Error('Firebase token subject is missing');
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error('Firebase token has expired');
  }

  return payload;
}

function isDuplicateKeyError(error) {
  return error?.code === 11000 || /duplicate key/i.test(error?.message || '');
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const {
      name,
      username,
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      avatar,
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const fullName = name || [firstName, lastName].filter(Boolean).join(' ').trim() || username || normalizedEmail.split('@')[0];

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      name: fullName,
      firstName: firstName || '',
      lastName: lastName || '',
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone: phone || '',
      avatar: avatar || '',
      authProvider: 'local',
    });

    const trust = recalculateTrustFields(user);
    user.profileCompleteness = trust.profileCompleteness;
    user.trustScore = trust.trustScore;
    await user.save();

    const token = signToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        authProvider: user.authProvider,
        trustScore: user.trustScore,
        profileCompleteness: user.profileCompleteness,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        adminApproved: user.adminApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.authProvider === 'firebase' && !user.password) {
      return res.status(401).json({ message: 'Use Google sign-in for this account' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const trust = recalculateTrustFields(user);
    user.profileCompleteness = trust.profileCompleteness;
    user.trustScore = trust.trustScore;
    await user.save();

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        authProvider: user.authProvider,
        trustScore: user.trustScore,
        profileCompleteness: user.profileCompleteness,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        adminApproved: user.adminApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.firebaseAuth = async (req, res) => {
  try {
    const {
      idToken,
      role,
      username,
      name,
      firstName,
      lastName,
      phone,
    } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase idToken is required' });
    }

    const decoded = await verifyFirebaseIdToken(idToken);

    const email = (decoded.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: 'Firebase account must include an email address' });
    }

    const existingUser = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email }],
    });

    const effectiveRole = role || existingUser?.role;
    if (!effectiveRole) {
      return res.status(400).json({ message: 'Please select a role before continuing with Google' });
    }

    if (!allowedRoles.includes(effectiveRole)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const resolvedName = name || decoded.name || [firstName, lastName].filter(Boolean).join(' ').trim() || email.split('@')[0];
    const resolvedFirstName = firstName || decoded.name?.split(' ')?.[0] || '';
    const resolvedLastName = lastName || decoded.name?.split(' ')?.slice(1).join(' ') || '';

    const updates = {
      firebaseUid: decoded.uid,
      authProvider: 'firebase',
      username: username || existingUser?.username || email.split('@')[0],
      name: resolvedName,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email,
      role: effectiveRole,
      phone: phone || existingUser?.phone || '',
      avatar: decoded.picture || existingUser?.avatar || '',
      emailVerified: Boolean(decoded.email_verified),
    };

    const user = existingUser
      ? await User.findByIdAndUpdate(existingUser._id, updates, { new: true, runValidators: true })
      : await User.create({ ...updates, password: null });

    const trust = recalculateTrustFields(user);
    user.profileCompleteness = trust.profileCompleteness;
    user.trustScore = trust.trustScore;
    await user.save();

    const token = signToken(user);

    return res.status(200).json({
      message: existingUser ? 'Firebase login successful' : 'Firebase account created',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        authProvider: user.authProvider,
        trustScore: user.trustScore,
        profileCompleteness: user.profileCompleteness,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        adminApproved: user.adminApproved,
      },
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const field = Object.keys(error.keyValue || {})[0];
      return res.status(409).json({
        message: 'A user with this Google account or role/profile field already exists',
        error: error.message,
        field: field || null,
      });
    }

    const statusCode = /token|certificate|issuer|audience|expired|service account|signature/i.test(error.message)
      ? 401
      : 500;

    return res.status(statusCode).json({
      message: statusCode === 401 ? 'Firebase authentication failed' : 'Firebase authentication failed',
      error: error.message,
    });
  }
};

exports.me = async (req, res) => {
  return res.status(200).json({
    message: 'Token verified',
    user: req.user,
  });
};