import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ log: ['warn', 'error'] })

async function main() {
  try {
  
    
    // Clean the database

    await prisma.user.deleteMany();
    
    // Hash password
    const userPassword = await bcrypt.hash("test@123", 10);
    
    // Create admin user

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
    

    
    // Optionally create a test customer user

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

  });