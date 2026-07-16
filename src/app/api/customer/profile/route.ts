import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        surname: true,
        phone: true,
        email: true,
        birthDate: true,
        gender: true,
        profileRewardClaimed: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();
    const { birthDate, gender } = body;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

    let updateData: any = {};
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (gender !== undefined) updateData.gender = gender || null;

    // Check if profile is complete now
    const willHaveBirthDate = birthDate !== undefined ? !!birthDate : !!user.birthDate;
    const willHaveGender = gender !== undefined ? !!gender : !!user.gender;

    const storeSettings = await prisma.storeSettings.findFirst({ orderBy: { updatedAt: 'desc' } });
    
    let rewardGranted = false;

    if (storeSettings?.profileRewardEnabled && !user.profileRewardClaimed && willHaveBirthDate && willHaveGender) {
      updateData.profileRewardClaimed = true;
      rewardGranted = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        surname: true,
        phone: true,
        email: true,
        birthDate: true,
        gender: true,
        profileRewardClaimed: true
      }
    });

    if (rewardGranted && storeSettings?.profileRewardAmount) {
      // Grant reward
      const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
      if (wallet) {
        await prisma.wallet.update({
          where: { userId: user.id },
          data: { beans: { increment: storeSettings.profileRewardAmount } }
        });
      } else {
        await prisma.wallet.create({
          data: { userId: user.id, beans: storeSettings.profileRewardAmount, rewards: 0 }
        });
      }

      // Add transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "EARN_BEAN",
          amount: storeSettings.profileRewardAmount
        }
      });
    }

    return NextResponse.json({ user: updatedUser, message: "Profil güncellendi" + (rewardGranted ? ` ve ${storeSettings?.profileRewardAmount} çekirdek kazandınız!` : "") });
  } catch (error) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json({ error: "Güncelleme sırasında bir hata oluştu" }, { status: 500 });
  }
}
