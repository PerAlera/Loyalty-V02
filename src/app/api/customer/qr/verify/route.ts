import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) return NextResponse.json({ error: "Token gerekli" }, { status: 400 });

    const qrToken = await prisma.qrToken.findUnique({ where: { token } });

    if (!qrToken) return NextResponse.json({ error: "Geçersiz QR Kod" }, { status: 404 });
    if (qrToken.isUsed) return NextResponse.json({ error: "Bu QR Kod zaten kullanılmış" }, { status: 400 });
    if (qrToken.expiresAt < new Date()) return NextResponse.json({ error: "Bu QR Kodun süresi dolmuş" }, { status: 400 });
    if (qrToken.type !== "EARN") return NextResponse.json({ error: "Bu QR Kod puan kazanma kodu değil!" }, { status: 400 });

    const settings = await prisma.storeSettings.findFirst();
    const requiredCoffees = settings ? settings.requiredCoffees : 10;
    const requiredFoods = settings ? settings.requiredFoods : 10;

    let wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId: session.user.id, beans: 0, rewards: 0, foodPoints: 0, foodRewards: 0 } });
    }

    const beansEarned = qrToken.beans || 0;
    const foodPointsEarned = qrToken.foodPoints || 0;
    
    let newBeans = wallet.beans;
    let newRewards = wallet.rewards;
    let newFoodPoints = wallet.foodPoints;
    let newFoodRewards = wallet.foodRewards;

    const transactions = [];

    if (qrToken.productType === "FOOD" || qrToken.productType === "BOTH") {
      if (foodPointsEarned > 0) {
        newFoodPoints += foodPointsEarned;
        while (newFoodPoints >= requiredFoods) {
          newFoodPoints -= requiredFoods;
          newFoodRewards += 1;
        }
        transactions.push(prisma.transaction.create({
          data: {
            userId: session.user.id,
            type: "EARN_FOOD",
            amount: foodPointsEarned
          }
        }));
      }
    }
    
    if (qrToken.productType === "COFFEE" || qrToken.productType === "BOTH") {
      if (beansEarned > 0) {
        newBeans += beansEarned;
        while (newBeans >= requiredCoffees) {
          newBeans -= requiredCoffees;
          newRewards += 1;
        }
        transactions.push(prisma.transaction.create({
          data: {
            userId: session.user.id,
            type: "EARN_BEAN",
            amount: beansEarned
          }
        }));
      }
    }

    await prisma.$transaction([
      prisma.qrToken.update({
        where: { id: qrToken.id },
        data: { isUsed: true, userId: session.user.id }
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { 
          beans: newBeans, 
          rewards: newRewards,
          foodPoints: newFoodPoints,
          foodRewards: newFoodRewards
        }
      }),
      ...transactions
    ]);

    const txCount = await prisma.transaction.count({
      where: { userId: session.user.id, type: { in: ["EARN_BEAN", "EARN_FOOD"] } }
    });
    
    // Determine if new user (if they just made their first earn transaction(s))
    // If BOTH was used, txCount might be 2. So if txCount <= 2 and they only had this one session, they are new.
    const isNewUser = txCount <= transactions.length;

    let message = "";
    if (qrToken.productType === "BOTH") {
      message = `${beansEarned} kahve ve ${foodPointsEarned} yemek puanı başarıyla eklendi!`;
    } else if (qrToken.productType === "FOOD") {
      message = `${foodPointsEarned} yemek puanı başarıyla eklendi!`;
    } else {
      message = `${beansEarned} kahve çekirdeği başarıyla eklendi!`;
    }

    return NextResponse.json({ 
      success: true, 
      message,
      isNewUser,
      newBeans,
      newRewards,
      newFoodPoints,
      newFoodRewards
    });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
