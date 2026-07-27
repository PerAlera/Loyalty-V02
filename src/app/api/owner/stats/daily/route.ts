import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const offsetStr = searchParams.get("offset");
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;

    // --- HELPER FOR TR TIME ---
    const TR_OFFSET = 3 * 60 * 60 * 1000; // UTC+3
    const getTRDate = (d: Date) => new Date(d.getTime() + TR_OFFSET);

    const now = new Date();
    const nowTR = getTRDate(now);
    
    // Shift the date by offset
    nowTR.setUTCDate(nowTR.getUTCDate() + offset);
    nowTR.setUTCHours(0, 0, 0, 0); // Start of day in TR time

    const todayUTCStart = new Date(nowTR.getTime() - TR_OFFSET);
    
    const endTR = new Date(nowTR);
    endTR.setUTCHours(23, 59, 59, 999);
    const todayUTCEnd = new Date(endTR.getTime() - TR_OFFSET);

    // Formating dayLabel
    let dayLabel = "";
    if (offset === 0) {
      dayLabel = "Bugün";
    } else if (offset === -1) {
      dayLabel = "Dün";
    } else {
      const monthsTR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      dayLabel = `${nowTR.getUTCDate()} ${monthsTR[nowTR.getUTCMonth()]}`;
    }

    const todayTransactions = await prisma.transaction.findMany({
      where: { 
        user: { storeId: session.user.storeId as string },
        createdAt: { 
          gte: todayUTCStart,
          lte: todayUTCEnd
        },
      },
      select: { type: true, amount: true, userId: true, createdAt: true }
    });

    let beans = 0;
    let foodPoints = 0;
    const uniqueUserIds = new Set<string>();

    // Map for today's hourly data (09:00 to 22:00) using Sets to count unique users per hour
    const todayHourlyUserMap: Record<string, Set<string>> = {};
    for(let i=9; i<=22; i++) {
      todayHourlyUserMap[`${i.toString().padStart(2, '0')}:00`] = new Set();
    }

    todayTransactions.forEach(t => {
      if (t.type === "EARN_BEAN") {
        beans += t.amount;
      }
      if (t.type === "EARN_FOOD") {
        foodPoints += t.amount;
      }
      
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

    return NextResponse.json({
      dayLabel,
      beans,
      foodPoints,
      uniqueCustomers,
      hourlyData
    });

  } catch (error) {
    console.error("Daily Stats API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
