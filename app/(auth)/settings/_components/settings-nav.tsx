"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CreditCard, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/account", label: "Conta", icon: User },
  { href: "/settings/security", label: "Segurança", icon: Lock },
  { href: "/settings/billing", label: "Assinatura", icon: CreditCard },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border overflow-x-auto">
      <nav className="flex gap-1 -mb-px min-w-max">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors md:px-4",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
