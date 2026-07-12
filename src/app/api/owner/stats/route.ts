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

    // --- NEW: TODAY STATS ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await prisma.transaction.findMany({
      where: { 
        createdAt: { gte: today },
      },
      select: { type: true, amount: true, userId: true, createdAt: true }
    });

    let todayBeans = 0;
    const uniqueUserIds = new Set<string>();

    // Map for today's hourly data (09:00 to 22:00)
    const todayHourlyMap: Record<string, number> = {};
    for(let i=9; i<=22; i++) {
      todayHourlyMap[`${i.toString().padStart(2, '0')}:00`] = 0;
    }

    todayTransactions.forEach(t => {
      if (t.type === "EARN_BEAN") {
        todayBeans += t.amount;
      }
      uniqueUserIds.add(t.userId);

      const hour = t.createdAt.getHours();
      if(hour >= 9 && hour <= 22) {
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
        todayHourlyMap[hourStr] += 1;
      }
    });

    const todayUniqueCustomers = uniqueUserIds.size;
    const todayHourlyData = Object.keys(todayHourlyMap).map(key => ({
      hour: key,
      islem: todayHourlyMap[key]
    }));

    // --- 7 DAYS CHART & WEEKLY DISTRIBUTION ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const allTransactions = await prisma.transaction.findMany({
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
      // Last 7 days chart
      if (t.createdAt >= sevenDaysAgo) {
        const dateStr = t.createdAt.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
        if (chartDataMap[dateStr]) {
          if (t.type === "EARN_BEAN") chartDataMap[dateStr].bean += t.amount;
          if (t.type === "REDEEM_REWARD") chartDataMap[dateStr].reward += t.amount;
        }
      }

      // Weekly Day Distribution
      const dayName = t.createdAt.toLocaleDateString("tr-TR", { weekday: "long" });
      // Map en-US or native names to TR just in case, but formatting with tr-TR should yield TR names.
      // Standardize the day name manually if needed, but tr-TR should be fine.
      let normalizedDay = dayName;
      if(dayName.toLowerCase().includes("monday")) normalizedDay = "Pazartesi";
      if(dayName.toLowerCase().includes("tuesday")) normalizedDay = "Salı";
      if(dayName.toLowerCase().includes("wednesday")) normalizedDay = "Çarşamba";
      if(dayName.toLowerCase().includes("thursday")) normalizedDay = "Perşembe";
      if(dayName.toLowerCase().includes("friday")) normalizedDay = "Cuma";
      if(dayName.toLowerCase().includes("saturday")) normalizedDay = "Cumartesi";
      if(dayName.toLowerCase().includes("sunday")) normalizedDay = "Pazar";

      if (dayCounts[normalizedDay] !== undefined) {
        dayCounts[normalizedDay] += 1;
      }

      // Busiest Hour (overall)
      const hour = t.createdAt.getHours();
      const hourStr = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
      hourCounts[hourStr] = (hourCounts[hourStr] || 0) + 1;
    });

    const chartData = Object.values(chartDataMap);
    
    // Format Weekly Data for BarChart
    const daysOrder = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    const weeklyDayData = daysOrder.map(day => ({
      day: day.slice(0,3), // Shorten: Paz, Sal, Çar vs.
      islem: dayCounts[day]
    }));

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
      busiestHour,
      todayBeans,
      todayUniqueCustomers,
      todayHourlyData,
      weeklyDayData
    });

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
