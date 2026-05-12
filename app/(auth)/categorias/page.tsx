"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CategoryDrawer } from "@/components/features/categorias/category-drawer";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  type: "RECEITA" | "DESPESA" | "AMBAS";
  _count: { transactions: number };
}

const typeLabels: Record<string, string> = { RECEITA: "Receita", DESPESA: "Despesa", AMBAS: "Ambas" };
const typeVariants: Record<string, "income" | "expense" | "secondary"> = { RECEITA: "income", DESPESA: "expense", AMBAS: "secondary" };

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categorias");
  if (!res.ok) throw new Error("Falha ao carregar categorias");
  return res.json();
}

async function deleteCategory(id: string) {
  const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || body.hint || "Erro ao remover");
  }
}

export default function CategoriasPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const qc = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({ queryKey: ["categorias"], queryFn: fetchCategories });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Categoria removida.");
      qc.invalidateQueries({ queryKey: ["categorias"] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={() => { setEditItem(null); setDrawerOpen(true); }}>
          <Plus className="h-4 w-4" />
          Criar Categoria
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Carregando...</div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <p className="text-lg font-semibold">Ainda sem categorias.</p>
            <p className="text-muted-foreground text-sm">
              Crie categorias para classificar suas transações e descobrir onde o dinheiro realmente está indo.
            </p>
            <Button size="sm" onClick={() => setDrawerOpen(true)}>Criar categoria</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{c.icon}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditItem(c); setDrawerOpen(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="font-semibold text-sm">{c.name}</p>
                {c.description && <p className="text-xs text-muted-foreground mt-1 truncate">{c.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={typeVariants[c.type]} className="text-xs">{typeLabels[c.type]}</Badge>
                  <span className="text-xs text-muted-foreground">{c._count.transactions} transações</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditItem(null); }}
        editItem={editItem}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["categorias"] })}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>&quot;{deleteTarget?.name}&quot;</strong>? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
