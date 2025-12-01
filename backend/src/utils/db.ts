import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskapp';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Timeout after 3s instead of 30s
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
