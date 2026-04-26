import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(err);
    process.exit(1);
  }
};

testConnection();
