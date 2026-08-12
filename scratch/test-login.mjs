import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

// Parse .env.local
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      envVars[trimmed.slice(0, idx)] = trimmed.slice(idx + 1).trim();
    }
  }
}

const MONGODB_URI = envVars.MONGODB_URI;
console.log('URI defined:', !!MONGODB_URI);

const UserSchema = new mongoose.Schema(
  { name: String, email: String, phone: String, password: { type: String, select: false } },
  { collection: 'users' }
);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function test() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB!');

  // Check all users
  const allUsers = await User.find({}).select('+password').limit(5);
  console.log('\nTotal users found:', allUsers.length);
  for (const u of allUsers) {
    console.log('---');
    console.log('  Name:', u.name);
    console.log('  Email:', u.email);
    console.log('  Phone:', u.phone);
    console.log('  Has password:', !!u.password);
  }

  // Test phone login
  const phone = '01700000001';
  console.log('\n\nTesting login with phone:', phone);
  const user = await User.findOne({ $or: [{ email: phone }, { phone: phone }] }).select('+password');
  console.log('User found by phone:', user ? 'YES' : 'NO');
  if (user) {
    const valid = await bcrypt.compare('12345678', user.password);
    console.log('Password valid:', valid);
  }

  // Test email login
  const email = 'premium@abs.com';
  console.log('\nTesting login with email:', email);
  const user2 = await User.findOne({ $or: [{ email }, { phone: email }] }).select('+password');
  console.log('User found by email:', user2 ? 'YES' : 'NO');
  if (user2) {
    const valid = await bcrypt.compare('12345678', user2.password);
    console.log('Password valid:', valid);
  }

  process.exit(0);
}

test().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
