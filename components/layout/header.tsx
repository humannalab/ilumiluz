"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings, ShieldCheck, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { isAdmin as checkIsAdmin } from "@/lib/admin";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Header() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const name = session?.user?.name?.trim() || email || "Usuário";
  const image = session?.user?.image ?? "";
  const isAdmin = checkIsAdmin(email);
  const initials = getInitials(name) || "?";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar px-4 md:justify-end md:px-6">
      {/* Mobile: hamburger + logo. Some no md+ (sidebar fixa cuida) */}
      <MobileNav />
      <Link
        href="/"
        className="md:hidden flex items-center"
        aria-label="Ilumiluz — página inicial"
      >
        <Image
          src="/logo-ilumiluz.svg"
          alt="Ilumiluz"
          width={90}
          height={24}
          priority
        />
      </Link>

      {/* Spacer para empurrar avatar para a direita no mobile */}
      <div className="flex-1 md:hidden" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Avatar className="h-9 w-9">
              {image && <AvatarImage src={image} alt={name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-sidebar-foreground line-clamp-1">
                {name}
              </p>
              {email && (
                <p className="text-xs leading-tight text-muted-foreground line-clamp-1">
                  {email}
                </p>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={4}
          collisionPadding={16}
          className="w-64"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3 py-1">
              <Avatar className="h-10 w-10">
                {image && <AvatarImage src={image} alt={name} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {name}
                </p>
                {email && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {email}
                  </p>
                )}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/settings/account" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Link>
          </DropdownMenuItem>

          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
