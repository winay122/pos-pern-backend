import { PrismaClient, ShopCategory, UnitType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Admin
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@pos.com';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@123';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Platform Administrator',
      email: adminEmail,
      passwordHash: adminPasswordHash,
    },
  });

  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Create Sample Demo Shop
  const demoPhone = '9876543210';
  const demoPasswordHash = await bcrypt.hash('Shop@1234', 10);

  const shop = await prisma.shop.upsert({
    where: { phoneNumber: demoPhone },
    update: {},
    create: {
      ownerName: 'Ramesh Kumar',
      shopName: 'Shree Laxmi Kirana Store',
      phoneNumber: demoPhone,
      passwordHash: demoPasswordHash,
      shopCategory: ShopCategory.GENERAL_STORE,
      address: 'Main Market, Rampur Village',
    },
  });

  console.log(`✅ Demo Shop seeded: ${shop.shopName} (${shop.phoneNumber})`);

  // 3. Create Sample Products & Stocks
  const sampleProducts = [
    {
      name: 'Fortune Mustard Oil (फॉर्च्यून सरसों तेल)',
      category: 'Oil & Ghee',
      unitType: UnitType.LITER,
      pricePerUnit: 165,
      barcodeValue: '890123456789',
      stockQty: 50,
      threshold: 10,
    },
    {
      name: 'Aashirvaad Shudh Chakki Atta (आशीर्वाद आटा)',
      category: 'Flour & Grains',
      unitType: UnitType.BAG,
      pricePerUnit: 420,
      barcodeValue: '890123456790',
      stockQty: 25,
      threshold: 5,
    },
    {
      name: 'Parle-G Gold Biscuit Pack (पारले-जी बिस्कुट)',
      category: 'Biscuits & Snacks',
      unitType: UnitType.TEN_PIECE,
      pricePerUnit: 95,
      barcodeValue: '890123456791',
      stockQty: 100,
      threshold: 15,
    },
    {
      name: 'Tata Salt / नमक 1kg',
      category: 'Spices & Salt',
      unitType: UnitType.KG,
      pricePerUnit: 28,
      barcodeValue: '890123456792',
      stockQty: 80,
      threshold: 20,
    },
    {
      name: 'Amul Taaza Milk 500ml (अमूल दूध)',
      category: 'Dairy',
      unitType: UnitType.ML,
      pricePerUnit: 27,
      barcodeValue: '890123456793',
      stockQty: 40,
      threshold: 8,
    },
  ];

  for (const item of sampleProducts) {
    const product = await prisma.product.upsert({
      where: {
        shopId_barcodeValue: {
          shopId: shop.id,
          barcodeValue: item.barcodeValue,
        },
      },
      update: {},
      create: {
        shopId: shop.id,
        name: item.name,
        category: item.category,
        unitType: item.unitType,
        pricePerUnit: item.pricePerUnit,
        barcodeValue: item.barcodeValue,
        stock: {
          create: {
            quantity: item.stockQty,
            lowStockThreshold: item.threshold,
          },
        },
      },
    });
    console.log(`   📦 Product: ${product.name} (Barcode: ${product.barcodeValue})`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
