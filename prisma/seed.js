import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Add this missing import

const prisma = new PrismaClient();

async function main() {
  try {
    // Clean the database
    await prisma.user.deleteMany();
    await prisma.session.deleteMany(); // Also clean sessions
  } catch (error) {
    console.error("Error cleaning database:", error);
  }

  const userPassword = await bcrypt.hash("test1234", 10);
  const User = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@yopmail.com",
      password: userPassword,
      phone: "123456789",
      role: "ADMIN",
      isActive: true,
      isVerify: true,
    },
  });

  const token = jwt.sign({ id: User.id }, process.env.JWT_SECRET, { 
    expiresIn: "24h" // Use string format for better clarity
  });
  
  await prisma.session.create({
    data: {
      userId: User.id,
      sessionToken: token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  });

  console.log("Seed completed successfully!");
  console.log("Admin user created:", User.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });