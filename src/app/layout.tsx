import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nūr Salah",
  description: "A calm, mindful tracker for the five daily prayers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f382c",
};

async function getThemeClass(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) return "";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { theme: true },
  });

  if (user?.theme === "dark") return "dark";
  if (user?.theme === "light") return "light";
  return "";
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const themeClass = await getThemeClass();

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${themeClass} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-foreground">
        {children}
      </body>
    </html>
  );
}
