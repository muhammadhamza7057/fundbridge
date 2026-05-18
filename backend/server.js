const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const startupRoutes = require('./routes/startupRoutes');
const investorRoutes = require('./routes/investorRoutes');
const trustRoutes = require('./routes/trustRoutes');
const chatRoutes = require('./routes/chatRoutes');
const dealRoutes = require('./routes/dealRoutes');
const usersRoutes = require('./routes/usersRoutes');
const chatSocket = require('./sockets/chatSocket');
const { connectMongo } = require('./utils/mongoConnection');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');

app.set('trust proxy', 1);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const corsOptions = {
  origin: ['https://fundbridge-ten.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = new Server(server, {
  cors: {
    origin: ['https://fundbridge-ten.vercel.app', 'http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/startup', startupRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/deal', dealRoutes);
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'FundBridge backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FundBridge backend' });
});

// Initialize chat socket handlers
chatSocket(io);

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

function listenOnPort() {
  server.listen(PORT, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  });
}

async function connectToMongoWithRetry(maxAttempts = 5) {
  return connectMongo(mongoose, {
    label: 'MongoDB',
    retryCount: maxAttempts,
    retryDelayMs: 2000,
  });
}

async function startServer() {
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
  console.error('Server error:', error.message);
  process.exit(1);
});