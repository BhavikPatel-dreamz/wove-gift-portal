// const { PrismaClient } = require('@prisma/client');
// const { faker } = require('@faker-js/faker');

// const prisma = new PrismaClient();

// async function main() {
//   console.log('Start seeding...');

//   // Delete existing data in correct order due to foreign key constraints
//   await prisma.integration.deleteMany({});
//   await prisma.brandBanking.deleteMany({});
//   await prisma.vouchers.deleteMany({});
//   await prisma.brandTerms.deleteMany({});
//   await prisma.brandContacts.deleteMany({});
//   await prisma.occasionCategory.deleteMany({});
//   await prisma.occasion.deleteMany({});
//   await prisma.brand.deleteMany({});
//   console.log('Existing data deleted.');

//   // Create Brands
//   const brands = [];
//   for (let i = 0; i < 15; i++) {
//     const brand = await prisma.brand.create({
//       data: {
//         brandName: faker.company.name() + ' ' + i, // Ensure unique names
//         logo: faker.image.urlLoremFlickr({ category: 'logo' }),
//         description: faker.company.catchPhrase(),
//         website: faker.internet.url(),
//         contact: faker.phone.number('###-###-####'),
//         tagline: faker.company.buzzPhrase(),
//         color: faker.color.rgb(),
//         categorieName: faker.commerce.department(),
//         isPrimary: faker.datatype.boolean(),
//         isActive: true,
//         isFeature: faker.datatype.boolean(),
//         notes: faker.lorem.sentence(),
//       },
//     });
//     brands.push(brand);

//     // Create related data for each brand

//     // BrandTerms
//     await prisma.brandTerms.create({
//       data: {
//         brandId: brand.id,
//         settelementTrigger: faker.helpers.arrayElement([
//           'onRedemption',
//           'onPurchase',
//         ]),
//         commissionType: faker.helpers.arrayElement(['Fixed', 'Percentage']),
//         commissionValue: faker.number.int({ min: 5, max: 20 }),
//         maxDiscount: faker.number.int({ min: 10, max: 50 }),
//         minOrderValue: faker.number.int({ min: 50, max: 200 }),
//         currency: faker.finance.currencyCode(),
//         brackingPolicy: faker.helpers.arrayElement(['Retain', 'Share']),
//         brackingShare: faker.number.int({ min: 1, max: 10 }),
//         contractStart: faker.date.past(),
//         contractEnd: faker.date.future(),
//         goLiveDate: faker.date.recent(),
//         renewContract: faker.datatype.boolean(),
//         vatRate: faker.number.int({ min: 0, max: 20 }),
//         internalNotes: faker.lorem.paragraph(),
//       },
//     });

//     // Vouchers
//     const denominationType = faker.helpers.arrayElement([
//       'staticDenominations',
//       'amountRange',
//     ]);
//     const expiryPolicy = faker.helpers.arrayElement(['fixed', 'relative']);

//     await prisma.vouchers.create({
//       data: {
//         brandId: brand.id,
//         denominationype: denominationType,
//         denominations: denominationType === 'staticDenominations' ? [10, 25, 50, 100] : undefined,
//         denominationCurrency: faker.finance.currencyCode(),
//         denominationValue: denominationType === 'amountRange' ? faker.number.int({ min: 5, max: 100 }) : undefined,
//         maxAmount: denominationType === 'amountRange' ? faker.number.int({ min: 100, max: 500 }) : undefined,
//         minAmount: denominationType === 'amountRange' ? faker.number.int({ min: 10, max: 50 }) : undefined,
//         expiryPolicy: expiryPolicy,
//         expiresAt: expiryPolicy === 'fixed' ? faker.date.future().toISOString() : undefined,
//         expiryValue: expiryPolicy === 'relative' ? faker.helpers.arrayElement(['1 year', '6 months', '3 months']) : undefined,
//         graceDays: faker.number.int({ min: 0, max: 30 }),
//         redemptionChannels: faker.helpers.arrayElements(['online', 'in-store', 'app'], { min: 1, max: 3 }),
//         partialRedemption: faker.datatype.boolean(),
//         Stackable: faker.datatype.boolean(),
//         maxUserPerDay: faker.number.int({ min: 1, max: 10 }),
//         termsConditionsURL: faker.internet.url(),
//       },
//     });

//     // BrandBanking
//     await prisma.brandBanking.create({
//       data: {
//         brandId: brand.id,
//         settlementFrequency: faker.helpers.arrayElement([
//           'daily',
//           'weekly',
//           'monthly',
//           'quarterly',
//         ]),
//         dayOfMonth: faker.number.int({ min: 1, max: 28 }),
//         payoutMethod: faker.helpers.arrayElement([
//           'EFT',
//           'wire_transfer',
//           'paypal',
//           'stripe',
//           'manual',
//         ]),
//         invoiceRequired: faker.datatype.boolean(),
//         remittanceEmail: faker.internet.email(),
//         accountHolder: faker.person.fullName(),
//         accountNumber: faker.finance.accountNumber(),
//         branchCode: faker.finance.routingNumber(),
//         bankName: faker.company.name() + ' Bank',
//         SWIFTCode: faker.finance.bic(), // Changed from swift() to bic()
//         country: faker.location.country(),
//         accountVerification: faker.datatype.boolean(),
//       },
//     });

//     // Integration
//     await prisma.integration.create({
//       data: {
//         brandId: brand.id,
//         platform: faker.helpers.arrayElement([
//           'shopify',
//           'woocommerce',
//           'magento',
//           'custom_api',
//           'other',
//         ]),
//         storeUrl: faker.internet.url(),
//         apiKey: faker.string.uuid(),
//         apiSecret: faker.string.uuid(),
//         accessToken: faker.string.uuid(),
//         consumerKey: faker.string.uuid(),
//         consumerSecret: faker.string.uuid(),
//         isActive: faker.datatype.boolean(),
//       },
//     });
//   }
//   console.log('Brands and related data created.');

//   // Create Occasions (keeping existing logic as it was fine)
//   const occasions = [];
//   const occasionNames = [
//     'Birthday',
//     'Anniversary',
//     'Thank You',
//     'Congratulations',
//     'Wedding',
//     'Graduation',
//     'New Baby',
//     'Housewarming',
//     'Get Well Soon',
//     'Just Because',
//   ];
//   for (const name of occasionNames) {
//     const occasion = await prisma.occasion.create({
//       data: {
//         name,
//         emoji: faker.internet.emoji(),
//         description: faker.lorem.sentence(),
//         image: faker.image.urlLoremFlickr({ category: 'gift' }),
//         isActive: true,
//       },
//     });
//     occasions.push(occasion);
//   }
//   console.log('Occasions created.');

//   // Create Occasion Categories (keeping existing logic as it was fine)
//   const occasionCategories = [];
//   for (const occasion of occasions) {
//     for (let i = 0; i < 3; i++) {
//       const occasionCategory = await prisma.occasionCategory.create({
//         data: {
//           name: occasion.name + ' - ' + faker.commerce.productAdjective() + ' ' + faker.commerce.product(),
//           description: faker.lorem.sentence(),
//           emoji: faker.internet.emoji(),
//           image: faker.image.urlLoremFlickr({ category: 'gift-category' }),
//           isActive: true,
//           occasionId: occasion.id,
//         },
//       });
//       occasionCategories.push(occasionCategory);
//     }
//   }
//   console.log('Occasion Categories created.');

//   console.log('Seeding finished.');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


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