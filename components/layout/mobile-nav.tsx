"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";

/**
 * Botão hambúrguer + Sheet drawer com a Sidebar dentro.
 * Visível apenas em viewport <md. Fecha quando o usuário clica num link.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

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
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border bg-sidebar">
          <SheetTitle asChild>
            <span className="sr-only">Navegação</span>
          </SheetTitle>
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

        <div className="flex-1 overflow-y-auto">
          <Sidebar hideLogo onNavClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
