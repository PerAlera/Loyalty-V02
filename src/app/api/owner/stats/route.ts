import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const store = await prisma.store.findUnique({
      where: { ownerId: session.user.id },
      include: {
        _count: {
          select: { cashiers: true }
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });
    }

    // --- SUMMARY STATS ---
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" }
    });

    const totalRewardsData = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "REDEEM_REWARD" }
    });

    const totalBeansData = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "EARN_BEAN" }
    });

    // --- DEMOGRAPHICS ---
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { gender: true }
    });

    let maleCount = 0;
    let femaleCount = 0;
    let otherCount = 0;
    let unknownCount = 0;

    users.forEach(u => {
      if (u.gender === "MALE") maleCount++;
      else if (u.gender === "FEMALE") femaleCount++;
      else if (u.gender === "OTHER") otherCount++;
      else unknownCount++;
    });

    const demographics = [
      { name: "Erkek", value: maleCount },
      { name: "Kadın", value: femaleCount },
      { name: "Diğer", value: otherCount },
      { name: "Belirtilmemiş", value: unknownCount }
    ].filter(d => d.value > 0);

    // --- RECENT ACTIVITIES ---
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, surname: true }
        }
      }
    });

    const activities = recentTransactions.map(t => {
      const timeStr = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(t.createdAt);
      if (t.type === "EARN_BEAN") {
        return `${t.user.name} ${t.user.surname} ${t.amount} Puan Kazandı (${timeStr})`;
      } else if (t.type === "REDEEM_REWARD") {
        return `${t.user.name} ${t.user.surname} Ödül Kahvesini Kullandı (${timeStr})`;
      }
      return `${t.user.name} ${t.user.surname} işlem yaptı (${timeStr})`;
    });

    // --- 7 DAYS CHART & BUSIEST TIMES ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const allTransactions = await prisma.transaction.findMany({
      where: { 
        createdAt: { gte: sevenDaysAgo },
        type: { in: ["EARN_BEAN", "REDEEM_REWARD"] }
      },
      select: { type: true, amount: true, createdAt: true }
    });

    // Generate last 7 days array
    const chartDataMap: Record<string, { date: string, bean: number, reward: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
      chartDataMap[dateStr] = { date: dateStr, bean: 0, reward: 0 };
    }

    const dayCounts: Record<string, number> = {
      "Pazartesi": 0, "Salı": 0, "Çarşamba": 0, "Perşembe": 0, "Cuma": 0, "Cumartesi": 0, "Pazar": 0
    };
    const hourCounts: Record<string, number> = {};

    allTransactions.forEach(t => {
      // For Chart
      const dateStr = t.createdAt.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
      if (chartDataMap[dateStr]) {
        if (t.type === "EARN_BEAN") chartDataMap[dateStr].bean += t.amount;
        if (t.type === "REDEEM_REWARD") chartDataMap[dateStr].reward += t.amount;
      }

      // For Busiest Day
      const dayName = t.createdAt.toLocaleDateString("tr-TR", { weekday: "long" });
      if (dayCounts[dayName] !== undefined) {
        dayCounts[dayName] += 1;
      }

      // For Busiest Hour
      const hour = t.createdAt.getHours();
      const hourStr = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
      hourCounts[hourStr] = (hourCounts[hourStr] || 0) + 1;
    });

    const chartData = Object.values(chartDataMap);

    // Calculate Busiest Day
    let busiestDay = "Veri Yok";
    let maxDayCount = 0;
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        busiestDay = day;
      }
    });

    // Calculate Busiest Hour
    let busiestHour = "Veri Yok";
    let maxHourCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        busiestHour = hour;
      }
    });

    return NextResponse.json({
      storeName: store.name,
      cashierCount: store._count.cashiers,
      totalCustomers,
      totalRewards: totalRewardsData._sum.amount || 0,
      totalBeans: totalBeansData._sum.amount || 0,
      demographics,
      recentActivities: activities,
      chartData,
      busiestDay,
      busiestHour
    });

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
