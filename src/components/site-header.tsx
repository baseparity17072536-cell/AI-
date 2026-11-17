import Link from "next/link";
import {
  ChevronDown,
  Crown,
  Folder,
  Globe,
  GraduationCap,
  House,
  LayoutGrid,
  Menu,
  Play,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type NavKey = "home" | "prompts" | "studio" | "my-prompts" | "tutorials" | "pricing";

const navLinks: { key?: NavKey; label: string; href: string; icon: LucideIcon }[] = [
  { key: "home", label: "Home", href: "/", icon: House },
  { key: "prompts", label: "Prompt Library", href: "/prompts", icon: LayoutGrid },
  { key: "studio", label: "Create", href: "/studio", icon: Sparkles },
  { key: "my-prompts", label: "My Prompts", href: "/my-prompts", icon: Folder },
  { key: "tutorials", label: "Tutorials", href: "/tutorials", icon: GraduationCap },
  { key: "pricing", label: "Pricing", href: "/pricing", icon: Crown },
];

export function SiteHeader({ active }: { active?: NavKey }) {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-black/70 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]">
            <Play className="h-4 w-4 fill-amber-400 text-amber-400" />
          </span>
          <span className="leading-none">
            <span className="text-gold block text-xl font-extrabold tracking-wider">CRENIX</span>
            <span className="block text-[9px] tracking-[0.35em] text-stone-300">TECHNOLOGY</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 xl:flex">
          {navLinks.map(({ key, label, href, icon: Icon }) => (
            <li key={label}>
              <Link
                href={href}
                aria-current={key && key === active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition hover:text-amber-300 ${
                  key && key === active ? "gold-outline text-white" : "text-stone-200"
                }`}
              >
                <Icon className="h-4 w-4 text-amber-400" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden items-center gap-1 text-sm text-stone-200 sm:flex">
            <Globe className="h-4 w-4" /> EN <ChevronDown className="h-3 w-3" />
          </button>
          <a href="/account" className="gold-outline hidden rounded-full px-4 py-1.5 text-sm sm:block">
            Log In
          </a>
          <a href="/account" className="gold-btn rounded-full px-4 py-1.5 text-sm font-semibold">
            Sign Up
          </a>
          {/* Mobile menu (no JS needed) */}
          <details className="relative xl:hidden">
            <summary className="cursor-pointer list-none rounded-lg p-1.5 text-amber-400" aria-label="เมนู">
              <Menu className="h-6 w-6" />
            </summary>
            <ul className="gold-card absolute right-0 mt-3 w-56 rounded-xl p-2">
              {navLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-amber-500/10">
                    <Icon className="h-4 w-4 text-amber-400" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
