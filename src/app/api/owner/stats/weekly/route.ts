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

    // Calculate Monday of the targeted week
    const currentDay = nowTR.getUTCDay();
    const diffToMonday = currentDay === 0 ? -6 : -(currentDay - 1);

    const mondayTR = new Date(nowTR);
    mondayTR.setUTCDate(nowTR.getUTCDate() + diffToMonday + (offset * 7));
    mondayTR.setUTCHours(0, 0, 0, 0);

    const sundayTR = new Date(mondayTR);
    sundayTR.setUTCDate(mondayTR.getUTCDate() + 6);
    sundayTR.setUTCHours(23, 59, 59, 999);

    const startUTC = new Date(mondayTR.getTime() - TR_OFFSET);
    const endUTC = new Date(sundayTR.getTime() - TR_OFFSET);

    const monthsTR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const weekLabel = `${mondayTR.getUTCDate()} ${monthsTR[mondayTR.getUTCMonth()]} - ${sundayTR.getUTCDate()} ${monthsTR[sundayTR.getUTCMonth()]}`;

    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startUTC,
          lte: endUTC
        }
      },
      select: { createdAt: true }
    });

    const dayCounts: Record<string, number> = {
      "Pazartesi": 0, "Salı": 0, "Çarşamba": 0, "Perşembe": 0, "Cuma": 0, "Cumartesi": 0, "Pazar": 0
    };
    const trDays = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

    transactions.forEach(t => {
      const trDate = getTRDate(t.createdAt);
      const dayName = trDays[trDate.getUTCDay()];
      dayCounts[dayName] += 1;
    });

    const daysOrder = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    const dayLabels: Record<string, string> = {
      "Pazartesi": "Pzt",
      "Salı": "Sal",
      "Çarşamba": "Çar",
      "Perşembe": "Per",
      "Cuma": "Cum",
      "Cumartesi": "Cmt",
      "Pazar": "Paz"
    };

    const weeklyDayData = daysOrder.map(day => ({
      day: dayLabels[day],
      islem: dayCounts[day]
    }));

    return NextResponse.json({
      weekLabel,
      weeklyDayData
    });

  } catch (error) {
    console.error("Weekly Stats API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
