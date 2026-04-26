import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const demoUsers = [
      {
        name: 'Demo Citizen',
        email: 'citizen@example.com',
        password: 'password123',
        role: 'citizen',
        address: 'Citizen Street, Demo City'
      },
      {
        name: 'Demo Volunteer',
        email: 'volunteer@example.com',
        password: 'password123',
        role: 'volunteer',
        address: 'Volunteer Ave, Demo City'
      },
      {
        name: 'Demo Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        address: 'Admin HQ, Demo City'
      }
    ];

    for (const userData of demoUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        // We use the model save method so the password hash middleware runs
        const user = new User(userData);
        await user.save();
        console.log(`Created ${userData.role}: ${userData.email}`);
      } else {
        console.log(`${userData.role} already exists: ${userData.email}`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDemoUsers();
