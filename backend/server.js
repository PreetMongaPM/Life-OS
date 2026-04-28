const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/academics', require('./routes/academics'));
app.use('/api/health', require('./routes/health'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/dashboard', require('./routes/dashboard'));

// LifeOS Routes
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/transactions', require('./routes/transactions'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lifeos';
const { MongoMemoryServer } = require('mongodb-memory-server');

const startServer = async () => {
  try {
    let finalMongoUri = MONGO_URI;
    if (finalMongoUri.includes('localhost') || finalMongoUri.includes('127.0.0.1')) {
        const mongoServer = await MongoMemoryServer.create();
        finalMongoUri = mongoServer.getUri();
    }
    await mongoose.connect(finalMongoUri);
    console.log('✅ MongoDB Connected Successfully to ' + finalMongoUri);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

startServer();
