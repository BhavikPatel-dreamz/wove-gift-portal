import prisma from '../src/lib/db'
import bcrypt from "bcryptjs";

async function main() {
  try {
    // Clean the database
    await prisma.user.deleteMany();
  } catch (error) {
    console.error("Error cleaning database:", error);
  }

  const userPassword = await bcrypt.hash("test@123", 10);
  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@yopmail.com",
      password: userPassword,
      role: "ADMIN",
      phone:"7878787878"
    },
  });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });