import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const deleteUser = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({ email: 'damarlachandu4@gmail.com' });
  console.log('User deleted');
  process.exit(0);
};

deleteUser();
