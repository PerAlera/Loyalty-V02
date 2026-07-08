import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const owner = await prisma.user.upsert({
    where: { phone: '5550000000' },
    update: {},
    create: {
      phone: '5550000000',
      name: 'Patron',
      surname: 'Kahveci',
      passwordHash,
      role: 'OWNER',
    },
  });

  const store = await prisma.store.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: 'Merkez Şube',
      ownerId: owner.id,
      settings: {
        create: {
          requiredCoffees: 10
        }
      }
    }
  });

  console.log('Owner and Store seeded successfully:');
  console.log('Phone: 5550000000');
  console.log('Password: admin123');
  console.log('Store:', store.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
