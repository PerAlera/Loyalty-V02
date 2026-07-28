import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    let whereClause: any = { isGlobal: true };
    
    if (session && session.user) {
      if (session.user.role === "OWNER") {
        whereClause = {};
      } else {
        whereClause = {
          OR: [
            { isGlobal: true },
            { users: { some: { id: session.user.id } } }
          ]
        };
      }
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
