"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarthoLogo } from "@/components/brand/bartho-dog";

// Exportado pra reutilizar no MobileNav (drawer hamburger)
export const NAV_ITEMS: Array<{ href: string; label: string; icon: LucideIcon }> =
  [
    { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { href: "/transacoes", label: "Transações", icon: ArrowLeftRight },
    { href: "/centros-de-custo", label: "Centros de Custo", icon: Wallet },
    { href: "/categorias", label: "Categorias", icon: Tags },
  ];

interface SidebarProps {
  /** Quando true, esconde o logo (porque o drawer mobile já tem header próprio) */
  hideLogo?: boolean;
  /** Callback quando um link é clicado — útil pro mobile drawer fechar */
  onNavClick?: () => void;
}

export function Sidebar({ hideLogo = false, onNavClick }: SidebarProps = {}) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      {!hideLogo && (
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <BarthoLogo height={36} variant={isDark ? "negative" : "positive"} />
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
              pathname === href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Configurações / Admin / Sair migraram pro dropdown do Header */}
    </aside>
  );
}
