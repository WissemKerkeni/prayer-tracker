"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SettingsActionState = { error?: string; success?: boolean } | undefined;

export async function updateSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Not authenticated." };

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const calculationMethod = String(formData.get("calculationMethod") ?? "MWL");
  const madhab = String(formData.get("madhab") ?? "SHAFI");

  if (!name) return { error: "Name is required." };
  if ((city && !country) || (country && !city)) {
    return { error: "Enter both city and country, or leave both blank." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      city: city || null,
      country: country || null,
      calculationMethod,
      madhab,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  revalidatePath("/");
  return { success: true };
}
