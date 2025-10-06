import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seed...');
    
    // Clean the database
    console.log('Cleaning existing users...');
    await prisma.user.deleteMany();
    
    // Hash password
    const userPassword = await bcrypt.hash("test@123", 10);
    
    // Create admin user
    console.log('Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@yopmail.com",
        password: userPassword,
        role: "ADMIN",
        phone: "7878787878",
        isActive: true,
        isVerified: true,
      },
    });
    
    console.log('Admin user created:', adminUser.email);
    
    // Optionally create a test customer user
    console.log('Creating customer user...');
    const customerUser = await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Customer",
        email: "customer@yopmail.com",
        password: userPassword,
        role: "CUSTOMER",
        phone: "9999999999",
        isActive: true,
        isVerified: true,
      },
    });
    
    console.log('Customer user created:', customerUser.email);
    console.log('Seeding completed successfully!');
    
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  });