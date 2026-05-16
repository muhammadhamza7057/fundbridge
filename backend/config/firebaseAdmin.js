const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);
  }

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || path.join(__dirname, '..', 'serviceAccountKey.json');
  if (fs.existsSync(keyPath)) {
    return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  }

  throw new Error('Missing Firebase service account. Set FIREBASE_SERVICE_ACCOUNT_KEY_PATH or FIREBASE_SERVICE_ACCOUNT_KEY_JSON.');
}

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = loadServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin;
}

module.exports = getFirebaseAdmin;
