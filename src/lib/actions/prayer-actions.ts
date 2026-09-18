"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pointsFor, type PrayerName, type PrayerStatusName } from "@/lib/scoring";
import { todayKey } from "@/lib/date";

export async function logPrayerAction(
  prayer: PrayerName,
  status: PrayerStatusName,
  dateKey: string = todayKey(),
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const points = pointsFor(prayer, status);

  await prisma.prayerLog.upsert({
    where: { userId_date_prayer: { userId, date: dateKey, prayer } },
    create: { userId, date: dateKey, prayer, status, points },
    update: { status, points },
  });

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/stats");
}
