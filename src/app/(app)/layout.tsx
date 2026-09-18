import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopNav userName={session.user.name ?? session.user.email ?? "Account"} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 md:px-8 md:py-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
