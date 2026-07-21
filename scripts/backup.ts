import { PrismaClient } from '@prisma/client';
import fs from 'fs';

process.env.DATABASE_URL = "postgresql://postgres.aloslrentbmekfuxrtpo:zQTsdmdjwDP%7D%2Cm%5EqzgW6%3F%3FBTe%2B4bxh@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true";

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to DB...');
  const storeCount = await prisma.store.count();
  console.log(`Store count: ${storeCount}`);
  
  console.log('Backing up data...');
  const users = await prisma.user.findMany();
  const stores = await prisma.store.findMany();
  const wallets = await prisma.wallet.findMany();
  const transactions = await prisma.transaction.findMany();
  
  const backup = {
    users, stores, wallets, transactions
  };
  
  fs.writeFileSync('backup.json', JSON.stringify(backup, null, 2));
  console.log('Backup saved to backup.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
