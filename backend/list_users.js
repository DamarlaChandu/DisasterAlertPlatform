import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const listUsers = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({});
  console.log('Users:', users.map(u => ({ name: u.name, email: u.email, role: u.role })));
  process.exit(0);
};

listUsers();
