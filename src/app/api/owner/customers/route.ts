import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const storeId = session.user.storeId as string;

    const customers = await prisma.user.findMany({
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
        pushSubscriptions: {
          select: { id: true }
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // We can also flag if they have push enabled to help the admin
    // and compute lastVisit
    const mapped = customers.map(c => {
      const lastTxDate = c.transactions.length > 0 ? c.transactions[0].createdAt : c.createdAt;
      
      return {
        id: c.id,
        name: c.name,
        surname: c.surname,
        phone: c.phone,
        hasPush: c.pushSubscriptions.length > 0,
        lastVisit: lastTxDate
      };
    });

    return NextResponse.json({ customers: mapped });
  } catch (error) {
    console.error("Customers Fetch Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
