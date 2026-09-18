"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ThemePreference = "light" | "dark" | "system";

export async function setThemeAction(theme: ThemePreference) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  await prisma.user.update({ where: { id: userId }, data: { theme } });
  revalidatePath("/", "layout");
}
