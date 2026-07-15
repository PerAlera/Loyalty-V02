const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDB() {
  try {
    console.log("Starting database reset...");
    
    // Clear all generated records
    await prisma.qrToken.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.announcement.deleteMany({});
    
    // Delete all users except OWNERs
    const deleteUsers = await prisma.user.deleteMany({
      where: {
        role: { not: "OWNER" }
      }
    });

    console.log(`Deleted ${deleteUsers.count} test users (Cashiers & Customers).`);
    console.log("Database reset complete. Only Owners and Store Settings remain.");

  } catch (error) {
    console.error("Error resetting database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDB();
