const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const User = require('./models/User');
const Settings = require('./models/Settings');
const Material = require('./models/Material');
const Customer = require('./models/Customer');

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if unable to set custom DNS
}

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@company.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@company.com',
        password: 'password123',
        role: 'admin',
        phone: '+91 98765 43210',
        specialization: 'System Administrator'
      });
      console.log('✓ Default Admin created (admin@company.com / password123)');
    } else {
      console.log('Admin already exists.');
    }

    // Check default settings
    const admin = await User.findOne({ email: 'admin@company.com' });
    const settingsExists = await Settings.findOne();
    if (!settingsExists && admin) {
      await Settings.create({
        user: admin._id,
        companyName: 'ElectroTrack Solutions Pvt Ltd',
        email: 'info@electrotrack.com',
        phone: '+91 98765 43210',
        address: '101 Power Grid Road, Industrial Zone, Chennai, Tamil Nadu, 600032',
        gstin: '33AABCU9603R1ZM',
        currency: 'INR',
        taxRate: 18,
        bankDetails: {
          bankName: 'HDFC Bank',
          accountNumber: '50200012345678',
          ifscCode: 'HDFC0001234',
          branch: 'Chennai Main Branch',
          upiId: 'electrotrack@okaxis'
        }
      });
      console.log('✓ Default Company Settings created');
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
