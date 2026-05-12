"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CreditCard, Wallet, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { CostCenterDrawer } from "@/components/features/centros-de-custo/cost-center-drawer";

interface CostCenter {
  id: string;
  name: string;
  bank: string;
  type: "CONTA_CORRENTE" | "CARTAO_CREDITO" | "ECONOMIAS";
  savingsType?: string;
  icon: string;
  currentBalance: number;
  _count: { transactions: number };
}

const typeLabels: Record<string, string> = {
  CONTA_CORRENTE: "Conta Corrente",
  CARTAO_CREDITO: "Cartão de Crédito",
  ECONOMIAS: "Economias",
};

const TypeIcon = ({ type }: { type: string }) => {
  if (type === "CARTAO_CREDITO") return <CreditCard className="h-5 w-5" />;
  if (type === "ECONOMIAS") return <PiggyBank className="h-5 w-5" />;
  return <Wallet className="h-5 w-5" />;
};

async function fetchCostCenters(): Promise<CostCenter[]> {
  const res = await fetch("/api/centros-de-custo");
  if (!res.ok) throw new Error("Falha ao carregar centros de custo");
  return res.json();
}

async function deleteCostCenter(id: string) {
  const res = await fetch(`/api/centros-de-custo/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || body.hint || "Erro ao remover");
  }
}

export default function CentrosDeCustoPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<CostCenter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CostCenter | null>(null);

  const qc = useQueryClient();
  const { data: costCenters = [], isLoading } = useQuery({
    queryKey: ["centros-de-custo"],
    queryFn: fetchCostCenters,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCostCenter,
    onSuccess: () => {
      toast.success("Centro de custo removido.");
      qc.invalidateQueries({ queryKey: ["centros-de-custo"] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Centros de Custo</h1>
        <Button onClick={() => { setEditItem(null); setDrawerOpen(true); }}>
          <Plus className="h-4 w-4" />
          Adicionar Conta
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Carregando...</div>
      ) : costCenters.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <p className="text-lg font-semibold">Você ainda não tem nenhuma conta por aqui.</p>
            <p className="text-muted-foreground text-sm">
              Cadastre uma conta corrente, cartão de crédito ou poupança para organizar melhor seus lançamentos.
            </p>
            <Button size="sm" onClick={() => setDrawerOpen(true)}>
              Adicionar centro de custo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {costCenters.map((cc) => (
            <Card key={cc.id} className="relative">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <TypeIcon type={cc.type} />
                    </div>
                    <div>
                      <p className="font-semibold">{cc.name}</p>
                      <p className="text-xs text-muted-foreground">{cc.bank}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditItem(cc); setDrawerOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cc)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>

                <Badge variant="secondary" className="mb-3 text-xs">
                  {typeLabels[cc.type]}
                  {cc.savingsType ? ` · ${cc.savingsType}` : ""}
                </Badge>

                {cc.type !== "CARTAO_CREDITO" && (
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo atual</p>
                    <p className={`text-xl font-bold ${cc.currentBalance >= 0 ? "text-income" : "text-expense"}`}>
                      {formatCurrency(cc.currentBalance)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CostCenterDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditItem(null); }}
        editItem={editItem}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["centros-de-custo"] })}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover centro de custo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>&quot;{deleteTarget?.name}&quot;</strong>? Essa ação não pode ser desfeita.
              {deleteTarget && deleteTarget._count.transactions > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Atenção: este centro possui {deleteTarget._count.transactions} transação(ões) vinculada(s). Reatribua-as antes de excluir.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
