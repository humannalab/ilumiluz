"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingBag,
  MapPin,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Exportado para reutilizar no MobileNav (drawer hamburger)
export const NAV_ITEMS: Array<{ href: string; label: string; icon: LucideIcon }> =
  [
    { href: "/settings/account",  label: "Minha conta",  icon: User },
    { href: "/conta/pedidos",     label: "Pedidos",       icon: ShoppingBag },
    { href: "/conta/enderecos",   label: "Endereços",     icon: MapPin },
    { href: "/settings/security", label: "Segurança",     icon: Lock },
  ];

interface SidebarProps {
  /** Quando true, esconde o logo (porque o drawer mobile já tem header próprio) */
  hideLogo?: boolean;
  /** Callback quando um link é clicado — útil pro mobile drawer fechar */
  onNavClick?: () => void;
}

export function Sidebar({ hideLogo = false, onNavClick }: SidebarProps = {}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      {!hideLogo && (
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <Link href="/" aria-label="Ilumiluz — página inicial">
            <Image
              src="/logo-ilumiluz.svg"
              alt="Ilumiluz"
              width={100}
              height={26}
              priority
            />
          </Link>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
