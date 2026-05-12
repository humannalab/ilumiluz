"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { BarthoLogo } from "@/components/brand/bartho-dog";
import { useTheme } from "next-themes";

/**
 * Botão hambúrguer + Sheet drawer com a Sidebar dentro.
 * Visível só em viewport <md. Fecha sozinho quando o usuário clica
 * num item de nav.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <Menu className="h-5 w-5" />
      </button>

      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        {/* Header próprio do drawer (substitui o do sidebar quando hideLogo=true) */}
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border bg-sidebar">
          <SheetTitle asChild>
            <span className="sr-only">Navegação</span>
          </SheetTitle>
          <BarthoLogo height={36} variant={isDark ? "negative" : "positive"} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <Sidebar hideLogo onNavClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
