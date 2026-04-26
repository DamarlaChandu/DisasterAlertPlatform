import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkDemoUsers = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const emails = ['citizen@example.com', 'volunteer@example.com', 'admin@example.com'];
  const users = await User.find({ email: { $in: emails } });
  console.log('Demo Users found:', users.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
};

checkDemoUsers();
