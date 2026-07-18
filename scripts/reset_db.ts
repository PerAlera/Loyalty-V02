const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database reset...');

  // 1. Delete transactions, tokens, wallets, settings, announcements
  await prisma.transaction.deleteMany();
  await prisma.qrToken.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.storeSettings.deleteMany();
  await prisma.announcement.deleteMany();

  // 2. Unlink all users from stores to allow Store deletion
  await prisma.user.updateMany({ data: { storeId: null } });

  // 3. Delete all stores
  await prisma.store.deleteMany();

  // 4. Find Ceyhun
  const ceyhun = await prisma.user.findFirst({
    where: { name: { contains: 'ceyhun', mode: 'insensitive' } }
  });

  const keepUserIds = ceyhun ? [ceyhun.id] : [];

  // 5. Delete all other users
  const deletedUsers = await prisma.user.deleteMany({
    where: { NOT: { id: { in: keepUserIds } } }
  });
  console.log(`Deleted ${deletedUsers.count} users. Retained Ceyhun.`);

  // 6. Generate Admin
  const generatePhone = () => {
    return '5' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  };
  const newAdminPhone = generatePhone();
  const hashedPassword = await bcrypt.hash('admin', 10);

  const newOwner = await prisma.user.create({
    data: {
      name: 'Admin',
      surname: 'Yönetici',
      phone: newAdminPhone,
      passwordHash: hashedPassword,
      role: 'OWNER'
    }
  });

  // 7. Create Jay's Cafe Store
  const store = await prisma.store.create({
    data: {
      name: "Jay's Cafe",
      ownerId: newOwner.id,
      settings: {
        create: {
          requiredCoffees: 10,
          requiredFoods: 10,
          profileRewardEnabled: true,
          profileRewardAmount: 1
        }
      }
    }
  });

  // 8. Make Ceyhun a Cashier of this store
  if (ceyhun) {
    await prisma.user.update({
      where: { id: ceyhun.id },
      data: {
        role: 'CASHIER',
        storeId: store.id
      }
    });
  }

  console.log('=========================================');
  console.log('VERİTABANI SIFIRLANDI!');
  console.log('Yeni Yönetici (Owner) Telefon No:', newAdminPhone);
  console.log('Yeni Yönetici Şifresi:', 'admin');
  console.log('=========================================');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
