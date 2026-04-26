import mongoose from 'mongoose';

const connectDB = async (retryCount = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying database connection... (${retryCount} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return connectDB(retryCount - 1);
    }
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
