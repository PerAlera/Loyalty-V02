import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20 // Sadece son 20 işlemi getir (MVP için)
        }
      }
    });

    if (!user) {
      return NextResponse.json({ transactions: [] });
    }

    return NextResponse.json({ transactions: user.transactions });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "İşlem geçmişi alınamadı" }, { status: 500 });
  }
}
