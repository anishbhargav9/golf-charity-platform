const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User         = require('../models/User');
const Charity      = require('../models/Charity');
const Subscription = require('../models/Subscription');
const Score        = require('../models/Score');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/golf_charity_db');
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Charity.deleteMany({});
  await Subscription.deleteMany({});
  await Score.deleteMany({});

  // Charities
  const charities = await Charity.insertMany([
    { name: 'Golf For Good', description: 'Supporting disadvantaged youth through golf programmes across the UK.', featured: true, website: 'https://example.com' },
    { name: 'Green Hearts Foundation', description: 'Environmental charity planting trees on golf courses and beyond.', featured: true },
    { name: 'Veterans Golf Trust', description: 'Helping military veterans recover through therapeutic golf.', featured: false }
  ]);
  console.log('Charities seeded');

  // Admin
  const adminPass = await bcrypt.hash('admin123', 12);
  const admin = await User.create({
    name: 'Admin User', email: 'admin@golf.com',
    password: adminPass, role: 'admin',
    subscriptionStatus: 'active', subscriptionPlan: 'yearly',
    charityId: charities[0]._id, charityPercent: 10
  });

  // Test users
  const userPass = await bcrypt.hash('user123', 12);
  const users = await User.insertMany([
    { name: 'John Smith',  email: 'john@golf.com',  password: userPass, subscriptionStatus: 'active', subscriptionPlan: 'monthly', charityId: charities[0]._id, charityPercent: 15 },
    { name: 'Sarah Jones', email: 'sarah@golf.com', password: userPass, subscriptionStatus: 'active', subscriptionPlan: 'monthly', charityId: charities[1]._id, charityPercent: 10 },
    { name: 'Mike Brown',  email: 'mike@golf.com',  password: userPass, subscriptionStatus: 'active', subscriptionPlan: 'yearly',  charityId: charities[2]._id, charityPercent: 20 },
    { name: 'Lisa White',  email: 'lisa@golf.com',  password: userPass, subscriptionStatus: 'inactive', charityId: charities[0]._id, charityPercent: 10 }
  ]);
  console.log('Users seeded');

  // Subscriptions
  const now = new Date();
  const monthly = new Date(now); monthly.setMonth(monthly.getMonth() + 1);
  const yearly  = new Date(now); yearly.setFullYear(yearly.getFullYear() + 1);

  await Subscription.insertMany([
    { userId: admin._id,    plan: 'yearly',   status: 'active', amount: 100, renewalDate: yearly  },
    { userId: users[0]._id, plan: 'monthly',  status: 'active', amount: 10,  renewalDate: monthly },
    { userId: users[1]._id, plan: 'monthly',  status: 'active', amount: 10,  renewalDate: monthly },
    { userId: users[2]._id, plan: 'yearly',   status: 'active', amount: 100, renewalDate: yearly  },
  ]);
  console.log('Subscriptions seeded');

  // Scores
  await Score.insertMany([
    { userId: users[0]._id, scores: [{ value:32, date: new Date('2024-03-01') },{ value:28, date: new Date('2024-02-15') },{ value:35, date: new Date('2024-01-20') }] },
    { userId: users[1]._id, scores: [{ value:22, date: new Date('2024-03-05') },{ value:30, date: new Date('2024-02-10') }] },
    { userId: users[2]._id, scores: [{ value:40, date: new Date('2024-03-08') },{ value:38, date: new Date('2024-02-20') },{ value:35, date: new Date('2024-01-15') },{ value:32, date: new Date('2023-12-10') }] },
  ]);
  console.log('Scores seeded');

  console.log('\n✅ Seed complete!');
  console.log('Admin:    admin@golf.com  / admin123');
  console.log('User:     john@golf.com   / user123');
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });