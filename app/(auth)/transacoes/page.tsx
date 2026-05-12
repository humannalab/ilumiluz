"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionDrawer } from "@/components/features/transacoes/transaction-drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  id: string;
  description: string;
  type: "RECEITA" | "DESPESA" | "SUPOSICAO";
  subtype: "PONTUAL" | "RECORRENTE" | "PARCELADA";
  amount: number;
  date: string;
  installmentNum?: number | null;
  installments?: number | null;
  parentId?: string | null;
  category?: { name: string; icon: string } | null;
  costCenter?: { name: string; icon: string } | null;
}

interface PaginatedResponse {
  items: Transaction[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  totals: {
    receitas: number;
    despesas: number;
    suposicoes: number;
    countReceitas: number;
    countDespesas: number;
    countSuposicoes: number;
  };
  // Range completo de datas (min/max) considerando todas as transações
  // do usuário — usado pra montar o select de meses dinamicamente.
  dateRange: { min: string | null; max: string | null };
}

const PAGE_SIZE = 20;

async function fetchTransactions(
  month: string,
  page: number,
  q: string
): Promise<PaginatedResponse> {
  const params = new URLSearchParams();
  if (month !== "all") params.set("month", month);
  if (q.trim()) params.set("q", q.trim());
  params.set("page", page.toString());
  params.set("pageSize", PAGE_SIZE.toString());
  const res = await fetch(`/api/transacoes?${params.toString()}`);
  if (!res.ok) throw new Error("Falha ao carregar transações");
  return res.json();
}

async function deleteTransaction({ id, cascade }: { id: string; cascade: boolean }) {
  const qs = cascade ? "?cascade=true" : "";
  const res = await fetch(`/api/transacoes/${id}${qs}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Falha ao remover transação");
}

async function confirmAsExpense(id: string) {
  const res = await fetch(`/api/transacoes/${id}`, { method: "PATCH" });
  if (!res.ok) throw new Error("Falha ao confirmar suposição");
}

export default function TransacoesPage() {
  const now = new Date();
  // Default: "all" (todos os lançamentos), do mais recente ao mais antigo,
  // paginados. Usuário pode trocar pra um mês específico se quiser análise.
  const [month, setMonth] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [cascade, setCascade] = useState(false);
  const [search, setSearch] = useState("");

  // Reset página ao trocar de mês ou de busca
  useEffect(() => {
    setPage(1);
  }, [month, search]);

  // Debounce simples de search pra não bater no backend a cada tecla
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["transacoes", month, page, debouncedSearch],
    queryFn: () => fetchTransactions(month, page, debouncedSearch),
  });
  const transactions = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      toast.success("Transação removida.");
      qc.invalidateQueries({ queryKey: ["transacoes"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao remover transação."),
  });

  const confirmMutation = useMutation({
    mutationFn: confirmAsExpense,
    onSuccess: () => {
      toast.success("Suposição confirmada como despesa real!");
      qc.invalidateQueries({ queryKey: ["transacoes"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Erro ao confirmar suposição."),
  });

  // Aggregates calculados do server-side, refletem o filtro inteiro
  // (não apenas a página atual)
  const totalReceitas = data?.totals?.receitas ?? 0;
  const totalDespesas = data?.totals?.despesas ?? 0;
  const countTransactionsRealizadas =
    (data?.totals?.countReceitas ?? 0) + (data?.totals?.countDespesas ?? 0);
  const countSuposicoes = data?.totals?.countSuposicoes ?? 0;

  // Busca já é server-side (param q). transactions vem filtrado.
  const hasActiveSearch = debouncedSearch.trim().length > 0;

  // Months select: opção padrão "Todos os lançamentos" + meses dinâmicos
  // baseados no dateRange dos dados do usuário (min/max do banco). Garante
  // que qualquer mês com lançamento real apareça no select, mesmo no
  // futuro distante (parcelas longas) ou passado distante (lançamentos
  // retroativos). Sempre inclui pelo menos -12 a +3 meses do mês atual
  // pra dar opção de filtrar perto do agora mesmo sem dados ali.
  const monthOptions: { value: string; label: string }[] = [
    { value: "all", label: "Todos os lançamentos" },
  ];
  {
    // Limites mínimos garantidos (independente dos dados): 12 meses atrás e 3 à frente
    const fallbackStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1)
    );
    const fallbackEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 3, 1)
    );

    // Limites reais dos dados (se houver)
    const dataMin = data?.dateRange.min ? new Date(data.dateRange.min) : null;
    const dataMax = data?.dateRange.max ? new Date(data.dateRange.max) : null;

    // Range final: o menor min e o maior max entre fallback e dados reais
    const startDate =
      dataMin && dataMin < fallbackStart ? dataMin : fallbackStart;
    const endDate = dataMax && dataMax > fallbackEnd ? dataMax : fallbackEnd;

    // Cap de segurança: 10 anos de range pra não estourar caso haja
    // lançamento de data absurda por engano
    const MAX_MONTHS = 12 * 10;
    let totalMonths =
      (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
      (endDate.getUTCMonth() - startDate.getUTCMonth());
    if (totalMonths > MAX_MONTHS) totalMonths = MAX_MONTHS;

    for (let i = totalMonths; i >= 0; i--) {
      const d = new Date(
        Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + i, 1)
      );
      const val = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      monthOptions.push({ value: val, label });
    }
  }

  // Quando o usuário clica em deletar, decide se mostra opção de cascade
  const isSeries = (t: Transaction | null) =>
    !!t &&
    (t.subtype === "RECORRENTE" ||
      t.subtype === "PARCELADA" ||
      !!t.parentId ||
      t.installmentNum === 0);

  const openDelete = (t: Transaction) => {
    setDeleteTarget(t);
    setCascade(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Transações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Receitas, despesas e suposições do período selecionado.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{countTransactionsRealizadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-income">{formatCurrency(totalReceitas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-expense">{formatCurrency(totalDespesas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Suposições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-assumption">
              {countSuposicoes}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        {/* Toolbar — busca + período + adicionar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título, categoria ou conta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setEditItem(null);
              setDrawerOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Adicionar transação
          </Button>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Carregando...</div>
          ) : transactions.length === 0 && hasActiveSearch ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-lg font-semibold">Nada encontrado com esses filtros.</p>
              <p className="text-muted-foreground text-sm">
                Tente ajustar a busca ou o período.
              </p>
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Limpar busca
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-lg font-semibold">
                {month === "all"
                  ? "Nenhum lançamento ainda."
                  : "Nenhum lançamento nesse período."}
              </p>
              <p className="text-muted-foreground text-sm">
                Registre uma receita ou despesa para começar a entender para onde seu dinheiro está indo.
              </p>
              <Button size="sm" onClick={() => setDrawerOpen(true)}>
                Adicionar transação
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop: tabela */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Data</th>
                      <th className="px-4 py-3 font-medium">Descrição</th>
                      <th className="px-4 py-3 font-medium">Tipo</th>
                      <th className="px-4 py-3 font-medium">Categoria</th>
                      <th className="px-4 py-3 font-medium">Centro de Custo</th>
                      <th className="px-4 py-3 font-medium text-right">Valor</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr
                        key={t.id}
                        className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${
                          t.type === "SUPOSICAO" ? "opacity-70" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {formatDate(t.date)}
                        </td>
                        <td className="px-4 py-3 font-medium max-w-48 truncate">
                          {t.description}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              t.type === "RECEITA"
                                ? "income"
                                : t.type === "DESPESA"
                                ? "expense"
                                : "assumption"
                            }
                          >
                            {t.type === "RECEITA" ? "Receita" : t.type === "DESPESA" ? "Despesa" : "Suposição"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t.category?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t.costCenter?.name ?? "—"}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            t.type === "RECEITA"
                              ? "text-income"
                              : t.type === "DESPESA"
                              ? "text-expense"
                              : "text-assumption"
                          }`}
                        >
                          {t.type === "RECEITA" ? "+" : t.type === "DESPESA" ? "-" : "~"}
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {t.type === "SUPOSICAO" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Confirmar como despesa real"
                                onClick={() => confirmMutation.mutate(t.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-income" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setEditItem(t); setDrawerOpen(true); }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDelete(t)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: cards */}
              <ul className="md:hidden divide-y divide-border">
                {transactions.map((t) => (
                  <li
                    key={t.id}
                    className={`p-4 ${t.type === "SUPOSICAO" ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {t.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(t.date)}</span>
                          <Badge
                            variant={
                              t.type === "RECEITA"
                                ? "income"
                                : t.type === "DESPESA"
                                ? "expense"
                                : "assumption"
                            }
                          >
                            {t.type === "RECEITA"
                              ? "Receita"
                              : t.type === "DESPESA"
                              ? "Despesa"
                              : "Suposição"}
                          </Badge>
                        </div>
                        {(t.category?.name || t.costCenter?.name) && (
                          <p className="text-xs text-muted-foreground">
                            {[t.category?.name, t.costCenter?.name]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <p
                        className={`shrink-0 text-right text-base font-semibold ${
                          t.type === "RECEITA"
                            ? "text-income"
                            : t.type === "DESPESA"
                            ? "text-expense"
                            : "text-assumption"
                        }`}
                      >
                        {t.type === "RECEITA"
                          ? "+"
                          : t.type === "DESPESA"
                          ? "-"
                          : "~"}
                        {formatCurrency(t.amount)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-1">
                      {t.type === "SUPOSICAO" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmMutation.mutate(t.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-income mr-1" />
                          Confirmar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditItem(t);
                          setDrawerOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDelete(t)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Paginação */}
          {transactions.length > 0 && (
            <div className="flex flex-col-reverse items-center gap-3 border-t border-border px-4 py-3 sm:flex-row sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {total === 0
                  ? "Nenhum lançamento"
                  : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} de ${total} lançamentos`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoading}
                >
                  ← Anterior
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isLoading}
                >
                  Próxima →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawer */}
      <TransactionDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditItem(null); }}
        editItem={editItem}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ["transacoes"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover transação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>&quot;{deleteTarget?.description}&quot;</strong>? Essa ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {isSeries(deleteTarget) && (
            <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cascade}
                onChange={(e) => setCascade(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {deleteTarget?.subtype === "PARCELADA"
                    ? "Remover toda a série de parcelas"
                    : "Remover toda a recorrência"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Apaga essa e todas as outras transações vinculadas a essa
                  série, em qualquer mês.
                </p>
              </div>
            </label>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget &&
                deleteMutation.mutate({ id: deleteTarget.id, cascade })
              }
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
