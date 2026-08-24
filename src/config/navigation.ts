import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  LayoutDashboard,
  Library,
  Palette,
  Sparkles,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Phase in which this section becomes usable. */
  phase: number;
  /** Rendered but disabled until its phase ships. */
  comingSoon?: boolean;
};

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, phase: 1 },
  { title: "Brands", href: "/brands", icon: Palette, phase: 3, comingSoon: true },
  { title: "Create", href: "/create", icon: Sparkles, phase: 6, comingSoon: true },
  { title: "Projects", href: "/projects", icon: FolderKanban, phase: 7, comingSoon: true },
  { title: "Library", href: "/library", icon: Library, phase: 8, comingSoon: true },
];
