import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = "postgresql://postgres.aloslrentbmekfuxrtpo:zQTsdmdjwDP%7D%2Cm%5EqzgW6%3F%3FBTe%2B4bxh@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true";

const prisma = new PrismaClient();

async function main() {
  const userId = 'cmrrt9zhs0000rlz1vcsi9j3b';
  
  console.log(`Checking user ${userId}...`);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    console.log('User not found!');
    return;
  }
  
  console.log(`User found: ${user.name} ${user.surname}. Proceeding with reset...`);
  
  // Delete transactions
  const deleteTx = await prisma.transaction.deleteMany({
    where: { userId }
  });
  console.log(`Deleted ${deleteTx.count} transactions.`);
  
  // Reset Wallet
  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      beans: 0,
      rewards: 0,
      foodPoints: 0,
      foodRewards: 0
    }
  });
  console.log('Wallet reset successfully.', updatedWallet);
}

main().catch(console.error).finally(() => prisma.$disconnect());
