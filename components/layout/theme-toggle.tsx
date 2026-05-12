"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toggle simples claro <-> escuro pro Header.
 * Renderiza placeholder do mesmo tamanho durante a hidratação inicial
 * pra evitar flash/layout shift (next-themes só sabe o tema final no
 * client, depois do useEffect rodar).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder do mesmo tamanho do botão real — evita layout shift
    return (
      <span
        aria-hidden
        className={cn(
          "inline-block h-9 w-9 rounded-md",
          className
        )}
      />
    );
  }

  const current = (theme === "system" ? resolvedTheme : theme) ?? "light";
  const isDark = current === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      aria-label={isDark ? "Tema claro" : "Tema escuro"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
