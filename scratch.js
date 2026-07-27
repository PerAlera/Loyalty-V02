const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const offset = -1;
  const TR_OFFSET = 3 * 60 * 60 * 1000;
  const getTRDate = (d) => new Date(d.getTime() + TR_OFFSET);

  const now = new Date();
  const nowTR = getTRDate(now);
  nowTR.setUTCDate(nowTR.getUTCDate() + offset);
  nowTR.setUTCHours(0, 0, 0, 0); 

  const todayUTCStart = new Date(nowTR.getTime() - TR_OFFSET);
  
  const endTR = new Date(nowTR);
  endTR.setUTCHours(23, 59, 59, 999);
  const todayUTCEnd = new Date(endTR.getTime() - TR_OFFSET);

  const todayTransactions = await prisma.transaction.findMany({
    where: { 
      createdAt: { 
        gte: todayUTCStart,
        lte: todayUTCEnd
      },
    },
    select: { type: true, amount: true, userId: true, createdAt: true }
  });

  let beans = 0;
  let foodPoints = 0;
  const uniqueUserIds = new Set();

  const todayHourlyUserMap = {};
  for(let i=9; i<=22; i++) {
    todayHourlyUserMap[`${i.toString().padStart(2, '0')}:00`] = new Set();
  }

  todayTransactions.forEach(t => {
    if (t.type === "EARN_BEAN") beans += t.amount;
    if (t.type === "EARN_FOOD") foodPoints += t.amount;
    uniqueUserIds.add(t.userId);

    const trDate = getTRDate(t.createdAt);
    const hour = trDate.getUTCHours();
    if(hour >= 9 && hour <= 22) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      todayHourlyUserMap[hourStr].add(t.userId);
    }
  });

  const uniqueCustomers = uniqueUserIds.size;
  const hourlyData = Object.keys(todayHourlyUserMap).map(key => ({
    hour: key,
    islem: todayHourlyUserMap[key].size
  }));

  console.log(JSON.stringify({
    beans,
    foodPoints,
    uniqueCustomers,
    hourlyData
  }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
