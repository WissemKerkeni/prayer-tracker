import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/SettingsForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOutAction } from "@/lib/actions/auth-actions";
import type { ThemePreference } from "@/lib/actions/theme-actions";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return (
    <div className="space-y-5 pb-6">
      <div>
        <p className="text-sm text-foreground-muted">{user.email}</p>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Appearance</p>
        <ThemeToggle current={user.theme as ThemePreference} />
      </div>

      <SettingsForm
        name={user.name}
        city={user.city ?? ""}
        country={user.country ?? ""}
        calculationMethod={user.calculationMethod}
        madhab={user.madhab}
      />

      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full rounded-control border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-canvas"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
