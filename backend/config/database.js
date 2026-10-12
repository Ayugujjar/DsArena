const mongoose = require('mongoose');
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (connectionPromise) {
    return connectionPromise;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGO_URI || (!isProduction ? 'mongodb://127.0.0.1:27017/dsa_tracker' : null);
  if (!uri) {
    throw new Error('MONGO_URI must be configured');
  }

  const maxPoolSize = Number(process.env.MONGO_MAX_POOL_SIZE || 10);
  if (!Number.isSafeInteger(maxPoolSize) || maxPoolSize < 1 || maxPoolSize > 100) {
    throw new Error('MONGO_MAX_POOL_SIZE must be an integer between 1 and 100');
  }

  connectionPromise = mongoose.connect(uri, {
    autoIndex: !isProduction,
    maxPoolSize,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10_000,
    ...(isProduction ? { tls: true } : {}),
  });
  try {
    const conn = await connectionPromise;
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } finally {
    connectionPromise = null;
  }
};

module.exports = connectDB;
