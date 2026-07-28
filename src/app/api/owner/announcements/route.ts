import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import webPush from "web-push";

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webPush.setVapidDetails(
      "mailto:alperen@peralera.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (error) {
    console.warn("VAPID configuration failed (this is non-fatal for the build):", error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, sendPush, target, selectedUserIds } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Başlık ve içerik gereklidir" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { id: session.user.storeId as string } });
    if (!store) return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });

    const isGlobal = target === "all";
    const userConnections = !isGlobal && selectedUserIds && selectedUserIds.length > 0 
      ? selectedUserIds.map((id: string) => ({ id })) 
      : [];

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        storeId: store.id,
        isGlobal,
        isPush: sendPush || false,
        users: {
          connect: userConnections
        }
      }
    });

    if (sendPush) {
      let subscriptions: any[] = [];
      
      if (target === "all") {
        subscriptions = await prisma.pushSubscription.findMany();
      } else if (target === "selected" && selectedUserIds && selectedUserIds.length > 0) {
        subscriptions = await prisma.pushSubscription.findMany({
          where: { 
            userId: { in: selectedUserIds }
          }
        });
      }

      const payload = JSON.stringify({
        title: title,
        body: content,
        icon: "/icon.png",
        url: "/" 
      });

      const pushPromises = subscriptions.map(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        return webPush.sendNotification(pushSubscription, payload).catch(err => {
          console.error("Push notification failed for endpoint:", sub.endpoint, err);
          if (err.statusCode === 410) {
            return prisma.pushSubscription.delete({ where: { id: sub.id } });
          }
        });
      });

      await Promise.all(pushPromises);
    }

    return NextResponse.json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    console.error("Announcements API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
