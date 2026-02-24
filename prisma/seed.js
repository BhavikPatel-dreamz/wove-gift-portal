import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db.js";

const DEFAULT_PASSWORD = "test@123";

async function seedUsers(passwordHash) {
  const users = [
    {
      firstName: "Admin",
      lastName: "User",
      email: "admin@yopmail.com",
      password: passwordHash,
      role: "ADMIN",
      phone: "7878787878",
      isActive: true,
      isVerified: true,
    },
    {
      firstName: "Test",
      lastName: "Customer",
      email: "customer@yopmail.com",
      password: passwordHash,
      role: "CUSTOMER",
      phone: "9999999999",
      isActive: true,
      isVerified: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
      create: user,
    });
  }
}

async function seedOccasionCatalog() {
  const occasions = [
    {
      name: "Birthday Party",
      emoji: "🎂",
      description: "Birthday celebration with friends and family",
      image:
        "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=1600&auto=format&fit=crop",
      type: "Personal",
      isActive: true,
      displayOrder: 1,
    },
    {
      name: "Wedding Ceremony",
      emoji: "💍",
      description: "Wedding ceremony and reception",
      image:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop",
      type: "Personal",
      isActive: true,
      displayOrder: 2,
    },
    {
      name: "Wedding Anniversary",
      emoji: "❤️",
      description: "Anniversary celebration",
      image:
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1600&auto=format&fit=crop",
      type: "Personal",
      isActive: true,
      displayOrder: 3,
    },
    {
      name: "Christmas Day",
      emoji: "🎄",
      description: "Christmas holiday celebration",
      image:
        "https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=1600&auto=format&fit=crop",
      type: "Holiday",
      isActive: true,
      displayOrder: 6,
    },
    {
      name: "New Year's Eve",
      emoji: "🎆",
      description: "New Year countdown and party",
      image:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600&auto=format&fit=crop",
      type: "Holiday",
      isActive: true,
      displayOrder: 7,
    },
    {
      name: "Valentine's Day",
      emoji: "💘",
      description: "Romantic celebration of love",
      image:
        "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1600&auto=format&fit=crop",
      type: "Holiday",
      isActive: true,
      displayOrder: 8,
    }
  ];

  const upsertedOccasions = [];

  for (const occasion of occasions) {
    const upserted = await prisma.occasion.upsert({
      where: { name: occasion.name },
      update: {
        emoji: occasion.emoji,
        description: occasion.description,
        image: occasion.image,
        type: occasion.type,
        isActive: occasion.isActive,
        displayOrder: occasion.displayOrder,
      },
      create: occasion,
    });
    upsertedOccasions.push(upserted);
  }

  const categoryTemplates = [
    {
      name: "Gift Items",
      description: "Curated gift items",
      emoji: "🎁",
      category: "Gift",
      displayOrder: 1,
      image:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1600&auto=format&fit=crop",
    },
    {
      name: "Flower Bouquets",
      description: "Fresh flower bouquets",
      emoji: "💐",
      category: "Decoration",
      displayOrder: 2,
      image:
        "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1600&auto=format&fit=crop",
    },
    {
      name: "Celebration Cakes",
      description: "Custom cakes and desserts",
      emoji: "🍰",
      category: "Food",
      displayOrder: 3,
      image:
        "https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=1600&auto=format&fit=crop",
    },
    {
      name: "Chocolate Boxes",
      description: "Premium chocolate assortments",
      emoji: "🍫",
      category: "Food",
      displayOrder: 4,
      image:
        "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1600&auto=format&fit=crop",
    },
    {
      name: "Event Decorations",
      description: "Venue and table decorations",
      emoji: "🎈",
      category: "Decoration",
      displayOrder: 5,
      image:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600&auto=format&fit=crop",
    },
    {
      name: "Balloon Styling",
      description: "Balloon arches and styling",
      emoji: "🎈",
      category: "Decoration",
      displayOrder: 6,
      image:
        "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=1600&auto=format&fit=crop",
    },
    {
      name: "Greeting Cards",
      description: "Printed greeting cards",
      emoji: "💌",
      category: "Stationery",
      displayOrder: 7,
      image:
        "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=1600&auto=format&fit=crop",
    },
    {
      name: "Personalized Gifts",
      description: "Customized gifts",
      emoji: "🧸",
      category: "Gift",
      displayOrder: 8,
      image:
        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1600&auto=format&fit=crop",
    },
    {
      name: "Table Styling",
      description: "Table decor setup",
      emoji: "🍽️",
      category: "Decoration",
      displayOrder: 9,
      image:
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1600&auto=format&fit=crop",
    },
    {
      name: "Lighting Decor",
      description: "Ambient decorative lighting",
      emoji: "💡",
      category: "Decoration",
      displayOrder: 10,
      image:
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1600&auto=format&fit=crop",
    },
  ];

  for (const occasion of upsertedOccasions) {
    for (const template of categoryTemplates) {
      const categoryName = `${occasion.name} - ${template.name}`;
      const categoryDescription = `${template.description} for ${occasion.name}`;

      await prisma.occasionCategory.upsert({
        where: { name: categoryName },
        update: {
          description: categoryDescription,
          emoji: template.emoji,
          image: template.image,
          category: template.category,
          isActive: true,
          displayOrder: template.displayOrder,
          occasionId: occasion.id,
        },
        create: {
          name: categoryName,
          description: categoryDescription,
          emoji: template.emoji,
          image: template.image,
          category: template.category,
          isActive: true,
          displayOrder: template.displayOrder,
          occasionId: occasion.id,
        },
      });
    }
  }
}

async function seedBrandCatalog() {
  const brand = await prisma.brand.upsert({
    where: { slug: "wove-demo-brand" },
    update: {
      brandName: "Wove Demo Brand",
      currency: "ZAR",
      domain: "wove-demo-brand.myshopify.com",
      logo: "https://dummyimage.com/200x200/111111/ffffff&text=WOVE",
      description: "Seeded demo brand for local development",
      website: "https://wove-demo-brand.myshopify.com",
      contact: "support@wove-demo-brand.test",
      tagline: "Gift cards made simple",
      color: "#111111",
      categoryName: "Shopping",
      isPrimary: true,
      isActive: true,
      isFeature: true,
      notes: "Generated by prisma/seed.js",
    },
    create: {
      brandName: "Wove Demo Brand",
      currency: "ZAR",
      domain: "wove-demo-brand.myshopify.com",
      slug: "wove-demo-brand",
      logo: "https://dummyimage.com/200x200/111111/ffffff&text=WOVE",
      description: "Seeded demo brand for local development",
      website: "https://wove-demo-brand.myshopify.com",
      contact: "support@wove-demo-brand.test",
      tagline: "Gift cards made simple",
      color: "#111111",
      categoryName: "Shopping",
      isPrimary: true,
      isActive: true,
      isFeature: true,
      notes: "Generated by prisma/seed.js",
    },
  });

  await prisma.brandTerms.upsert({
    where: { brandId: brand.id },
    update: {
      settlementTrigger: "onRedemption",
      commissionType: "Percentage",
      commissionValue: 10,
      maxDiscount: 20,
      minOrderValue: 100,
      currency: "ZAR",
      breakagePolicy: "Retain",
      breakageShare: 0,
      renewContract: true,
      vatRate: 15,
      internalNotes: "Seed default terms",
    },
    create: {
      brandId: brand.id,
      settlementTrigger: "onRedemption",
      commissionType: "Percentage",
      commissionValue: 10,
      maxDiscount: 20,
      minOrderValue: 100,
      currency: "ZAR",
      breakagePolicy: "Retain",
      breakageShare: 0,
      renewContract: true,
      vatRate: 15,
      internalNotes: "Seed default terms",
    },
  });

  await prisma.brandBanking.upsert({
    where: { brandId: brand.id },
    update: {
      settlementFrequency: "monthly",
      dayOfMonth: 25,
      payoutMethod: "EFT",
      invoiceRequired: true,
      remittanceEmail: "finance@wove-demo-brand.test",
      accountHolder: "Wove Demo Brand",
      accountNumber: "1234567890",
      branchCode: "250655",
      bankName: "Demo Bank",
      swiftCode: "DEMOBANKXXX",
      country: "South Africa",
      accountVerification: true,
    },
    create: {
      brandId: brand.id,
      settlementFrequency: "monthly",
      dayOfMonth: 25,
      payoutMethod: "EFT",
      invoiceRequired: true,
      remittanceEmail: "finance@wove-demo-brand.test",
      accountHolder: "Wove Demo Brand",
      accountNumber: "1234567890",
      branchCode: "250655",
      bankName: "Demo Bank",
      swiftCode: "DEMOBANKXXX",
      country: "South Africa",
      accountVerification: true,
    },
  });

  const existingVoucher = await prisma.vouchers.findFirst({
    where: { brandId: brand.id },
    orderBy: { createdAt: "asc" },
  });

  const voucher = existingVoucher
    ? await prisma.vouchers.update({
        where: { id: existingVoucher.id },
        data: {
          denominationType: "fixed",
          denominationCurrency: "ZAR",
          denominationValue: 1000,
          isActive: true,
          isExpiry: true,
          expiryPolicy: "12 months from issue date",
          partialRedemption: true,
          stackable: false,
          maxUserPerDay: 5,
          termsConditionsURL: "https://wove-demo-brand.myshopify.com/policies/terms-of-service",
          productSku: "WOVE-DEMO-GIFTCARD",
        },
      })
    : await prisma.vouchers.create({
        data: {
          brandId: brand.id,
          denominationType: "fixed",
          denominationCurrency: "ZAR",
          denominationValue: 1000,
          isActive: true,
          isExpiry: true,
          expiryPolicy: "12 months from issue date",
          partialRedemption: true,
          stackable: false,
          maxUserPerDay: 5,
          termsConditionsURL: "https://wove-demo-brand.myshopify.com/policies/terms-of-service",
          productSku: "WOVE-DEMO-GIFTCARD",
        },
      });

  const desiredDenominations = [
    { value: 1000, currency: "ZAR", displayName: "R10", isExpiry: true },
    { value: 2500, currency: "ZAR", displayName: "R25", isExpiry: true },
    { value: 5000, currency: "ZAR", displayName: "R50", isExpiry: true },
  ];

  const existingDenominations = await prisma.denomination.findMany({
    where: { voucherId: voucher.id },
  });

  for (const denom of desiredDenominations) {
    const existing = existingDenominations.find(
      (item) => item.value === denom.value && item.currency === denom.currency,
    );

    if (existing) {
      await prisma.denomination.update({
        where: { id: existing.id },
        data: {
          displayName: denom.displayName,
          isExpiry: denom.isExpiry,
          isActive: true,
        },
      });
    } else {
      await prisma.denomination.create({
        data: {
          voucherId: voucher.id,
          value: denom.value,
          currency: denom.currency,
          displayName: denom.displayName,
          isExpiry: denom.isExpiry,
          isActive: true,
        },
      });
    }
  }
}

async function main() {
  const userPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await seedUsers(userPassword);
  await seedOccasionCatalog();
  // await seedBrandCatalog();
}

main()
  .then(() => {
    console.log("Seed completed successfully.");
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
