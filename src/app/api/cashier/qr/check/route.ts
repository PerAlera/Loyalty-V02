import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "CASHIER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
    }

    const qrToken = await prisma.qrToken.findUnique({
      where: { token },
      select: { isUsed: true }
    });

    if (!qrToken) {
      return NextResponse.json({ error: "Token bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ isUsed: qrToken.isUsed });
  } catch (error) {
    console.error("QR Check Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
