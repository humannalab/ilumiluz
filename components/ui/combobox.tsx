"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxItem {
  value: string;
  label: string;
  hint?: string;
  icon?: string;
}

interface Props {
  items: ComboboxItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchThreshold?: number; // mostra busca quando items.length >= threshold (default 5)
  disabled?: boolean;
  emptyLabel?: string;
  /**
   * Quando definido, renderiza CTA "Criar novo" no rodapé do dropdown.
   * Recebe o termo digitado na busca (string vazia se não houver) e cuida da criação.
   */
  onCreate?: (query: string) => Promise<{ value: string; label: string } | null>;
  createLabel?: string; // texto do CTA. Default: "Criar novo"
  className?: string;
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Selecionar",
  searchThreshold = 5,
  disabled,
  emptyLabel = "Nada encontrado",
  onCreate,
  createLabel = "Criar novo",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const showSearch = items.length >= searchThreshold;
  const selected = items.find((i) => i.value === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.hint?.toLowerCase().includes(q) ?? false)
    );
  }, [items, query]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleCreate = async () => {
    if (!onCreate || creating) return;
    setCreating(true);
    try {
      const created = await onCreate(query.trim());
      if (created) {
        onChange(created.value);
        setOpen(false);
        setQuery("");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.icon && <span className="text-base">{selected.icon}</span>}
              {selected.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          {showSearch && (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {emptyLabel}
              </div>
            ) : (
              filtered.map((it) => (
                <button
                  key={it.value}
                  type="button"
                  onClick={() => {
                    onChange(it.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                    "hover:bg-muted",
                    it.value === value && "bg-primary/10"
                  )}
                >
                  {it.icon && <span className="text-base">{it.icon}</span>}
                  <span className="flex-1 truncate">{it.label}</span>
                  {it.hint && (
                    <span className="text-xs text-muted-foreground">{it.hint}</span>
                  )}
                  {it.value === value && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {onCreate && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="flex w-full items-center gap-2 border-t border-border bg-muted/30 px-3 py-2 text-left text-sm font-medium text-primary transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {creating
                ? "Criando..."
                : query.trim()
                ? `${createLabel}: "${query.trim()}"`
                : createLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
