import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cropcraft';

  try {
    await mongoose.connect(uri);
    console.log('[db] Connected to MongoDB');
  } catch (error) {
    console.error('[db] Connection failed:', error);
    throw error;
  }
}
