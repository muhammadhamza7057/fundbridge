const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { execSync } = require('child_process');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const startupRoutes = require('./routes/startupRoutes');
const investorRoutes = require('./routes/investorRoutes');
const chatRoutes = require('./routes/chatRoutes');
const dealRoutes = require('./routes/dealRoutes');
const usersRoutes = require('./routes/usersRoutes');
const chatSocket = require('./sockets/chatSocket');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

const io = new Server(server, {
  cors: {
    ...corsOptions,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  },
});

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/startup', startupRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/deal', dealRoutes);
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'FundBridge backend is running' });
});

// Initialize chat socket handlers
chatSocket(io);

const PORT = process.env.PORT || 5000;
const CANONICAL_DB_NAME = 'FundBridge';

function normalizeMongoUri(uri) {
  if (!uri) return uri;

  return uri.replace(/\/(fundbridge)(?=\?|$)/i, `/${CANONICAL_DB_NAME}`);
}

const MONGO_URI = normalizeMongoUri(process.env.MONGO_URI || process.env.MONGODB_URI);
let recoveredFromPortConflict = false;

function getOwningProcessId(port) {
  try {
    const output = execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`,
      { encoding: 'utf8', windowsHide: true }
    );

    const pid = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => /^\d+$/.test(line));

    return pid ? Number(pid) : null;
  } catch (error) {
    return null;
  }
}

function killProcessById(pid) {
  if (!pid) return false;

  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore', windowsHide: true });
    console.log(`Stopped stale process ${pid} on port ${PORT}`);
    return true;
  } catch (error) {
    return false;
  }
}

function listenOnPort() {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectToMongoWithRetry(maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('Connected to MongoDB Atlas');
      return;
    } catch (error) {
      const transientDnsError = ['EAI_AGAIN', 'ESERVFAIL', 'ETIMEDOUT', 'ECONNRESET'].some((code) =>
        String(error?.message || '').includes(code) || String(error?.cause?.code || '') === code
      );

      if (attempt < maxAttempts && transientDnsError) {
        const waitMs = 2000 * attempt;
        console.warn(`MongoDB connection attempt ${attempt} failed (${error.message}). Retrying in ${waitMs}ms...`);
        await delay(waitMs);
        continue;
      }

      throw error;
    }
  }
}

async function startServer() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI or MONGODB_URI is not defined in the environment');
  }

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });

  await connectToMongoWithRetry();

  listenOnPort();
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    if (recoveredFromPortConflict) {
      console.error(`Port ${PORT} is still in use after recovery attempt.`);
      process.exit(1);
    }

    recoveredFromPortConflict = true;
    const pid = getOwningProcessId(PORT);
    if (killProcessById(pid)) {
      setTimeout(() => {
        listenOnPort();
      }, 500);
      return;
    }

    console.error(`Port ${PORT} is already in use. Stop the other backend process or change PORT in .env.`);
    process.exit(1);
  }
});