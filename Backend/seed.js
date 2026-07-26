require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const prisma = require('./src/config/db');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pkbszygtgdiuvpouiwyz.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrYnN6eWd0Z2RpdXZwb3Vpd3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NTQ1MzUsImV4cCI6MjA5MjUzMDUzNX0.flq6wtkatGzTXFskgzTyDomtDUmtEMJwAyrveT46WFA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  const phone = '+918421358609';
  const password = 'Password@123';

  console.log(`Seeding user: ${phone}`);

  try {
    // 1. Seed Supabase Auth
    console.log('Registering with Supabase...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone: phone,
      password: password,
      options: {
        data: {
          name: 'Seeded User',
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.status === 400) {
         console.log('User already exists in Supabase, continuing...');
      } else {
         console.error('Supabase error:', authError);
      }
    } else {
      console.log('Successfully registered in Supabase:', authData.user?.id);
    }

    // 2. Seed Prisma Database
    console.log('Registering in Prisma...');
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name: 'Seeded User',
          phone: phone,
          password: hashedPassword,
          role: 'FARMER',
        }
      });
      console.log('Successfully inserted into Prisma:', user.id);
    } else {
      // Update password just in case
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { phone },
        data: { password: hashedPassword }
      });
      console.log('User already exists in Prisma, updated password.');
    }

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
