import mongoose from 'mongoose';

function getMongoUri() {
  if (!process.env.MONGO_URI) {
    throw new Error('Missing required environment variable: MONGO_URI');
  }

  return process.env.MONGO_URI;
}

export async function connectDatabase() {
  try {
    const serverSelectionTimeoutMS = Number(
      process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000,
    );

    await mongoose.connect(getMongoUri(), { serverSelectionTimeoutMS });
    console.info('MongoDB connection established');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}