import { TodayIcon, HistoryIcon, StatsIcon, SettingsIcon } from "@/components/icons";

export const NAV_ITEMS = [
  { href: "/", label: "Today", icon: TodayIcon },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/stats", label: "Stats", icon: StatsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;
