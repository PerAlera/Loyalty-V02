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
    const weeksAgoStr = searchParams.get("weeksAgo");
    const weeksAgo = weeksAgoStr ? parseInt(weeksAgoStr, 10) : 1;

    const storeId = session.user.storeId as string;

    // Calculate threshold date
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - (weeksAgo * 7));

    // Fetch all customers for the business with their most recent transaction
    const users = await prisma.user.findMany({
      where: { 
        storeId: storeId, 
        role: "CUSTOMER" 
      },
      select: {
        id: true,
        name: true,
        surname: true,
        phone: true,
        createdAt: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true }
        }
      }
    });

    // Determine the last visit date for each user and filter
    const inactiveCustomers = users.map(u => {
      const lastVisit = u.transactions.length > 0 ? u.transactions[0].createdAt : u.createdAt;
      return {
        id: u.id,
        name: u.name,
        surname: u.surname,
        phone: u.phone,
        lastVisit: lastVisit
      };
    }).filter(u => u.lastVisit < thresholdDate)
      .sort((a, b) => a.lastVisit.getTime() - b.lastVisit.getTime()); // Oldest visits first

    return NextResponse.json({
      inactiveCustomers
    });

  } catch (error) {
    console.error("Inactive Customers API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
