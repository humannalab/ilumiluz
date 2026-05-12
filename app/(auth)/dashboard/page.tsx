"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, type AreaChartDataPoint } from "@/components/ui/area-chart";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "anual" | "semestral" | "mensal";

const PERIOD_LABELS: Record<Period, string> = {
  anual: "Anual",
  semestral: "Semestral",
  mensal: "Mensal",
};

interface ChartPoint {
  date: string;
  receitas: number;
  despesas: number;
  suposicoes: number;
}

interface DashboardData {
  chartData: ChartPoint[];
  currentBalance: number;
  period: Period;
}

async function fetchDashboard(period: Period, includeAssumptions: boolean): Promise<DashboardData> {
  const res = await fetch(
    `/api/dashboard?period=${period}&includeAssumptions=${includeAssumptions}`
  );
  if (!res.ok) throw new Error("Falha ao carregar dados");
  return res.json();
}

// Largura mínima por bucket no chart. Garante que com 24 meses (período
// "anual") o gráfico fique scrollável e legível em qualquer viewport.
const MIN_PX_PER_MONTH = 70;

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("anual");
  const [includeAssumptions, setIncludeAssumptions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", period, includeAssumptions],
    queryFn: () => fetchDashboard(period, includeAssumptions),
  });

  const chartData: AreaChartDataPoint[] =
    data?.chartData.map((d) => ({
      date: new Date(d.date),
      primary: d.receitas,
      secondary: d.despesas,
    })) ?? [];

  const hasAnyData = chartData.some((d) => d.primary > 0 || d.secondary > 0);

  // Auto-scroll: ao carregar pela primeira vez no período "anual" (24 meses),
  // posiciona o scroll de forma que o mês atual fique centralizado.
  useEffect(() => {
    if (hasAutoScrolled || !scrollRef.current || !hasAnyData) return;
    if (period !== "anual" || chartData.length === 0) return;

    const now = new Date();
    const currentMonth0 = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();
    const idx = chartData.findIndex(
      (d) =>
        d.date.getUTCFullYear() === currentYear &&
        d.date.getUTCMonth() === currentMonth0
    );
    if (idx < 0) return;

    const container = scrollRef.current;
    const totalScrollWidth = container.scrollWidth;
    const visibleWidth = container.clientWidth;
    const monthWidth = totalScrollWidth / chartData.length;
    // Posiciona o mês atual ~30% da largura visível (pra ver passado e futuro)
    const targetLeft = idx * monthWidth - visibleWidth * 0.3;
    container.scrollTo({ left: Math.max(0, targetLeft), behavior: "auto" });
    setHasAutoScrolled(true);
  }, [chartData, period, hasAnyData, hasAutoScrolled]);

  // Reseta o auto-scroll ao trocar de período
  useEffect(() => {
    setHasAutoScrolled(false);
  }, [period]);

  // Largura mínima do chart: garante scroll horizontal quando temos
  // muitos meses (período "anual" com 24 meses).
  const chartMinWidth = Math.max(640, chartData.length * MIN_PX_PER_MONTH);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe sua saúde financeira
        </p>
      </div>

      {/* Saldo atual */}
      {data && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {data.currentBalance >= 0 ? (
                <TrendingUp className="h-8 w-8 text-income" />
              ) : (
                <TrendingDown className="h-8 w-8 text-expense" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Saldo do mês atual</p>
                <p
                  className={cn(
                    "text-3xl font-bold",
                    data.currentBalance >= 0 ? "text-income" : "text-expense"
                  )}
                >
                  {formatCurrency(data.currentBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">Receitas × Despesas</CardTitle>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Period tabs */}
              <div className="flex items-center rounded-lg border border-border bg-muted p-1 gap-0.5">
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                      period === p
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>

              {/* Suposições switch */}
              <div className="flex items-center gap-2">
                <Switch
                  id="assumptions"
                  checked={includeAssumptions}
                  onCheckedChange={setIncludeAssumptions}
                />
                <Label
                  htmlFor="assumptions"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Suposições
                </Label>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-income" />
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-expense" />
              <span className="text-xs text-muted-foreground">
                {includeAssumptions ? "Despesas + Suposições" : "Despesas"}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          ) : !hasAnyData ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-lg font-semibold text-foreground">
                Seu histórico financeiro começa aqui.
              </p>
              <p className="text-muted-foreground text-sm max-w-xs">
                Adicione sua primeira transação e veja sua saúde financeira tomar forma — mês a
                mês.
              </p>
              <Button asChild size="sm">
                <a href="/transacoes">Adicionar transação</a>
              </Button>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="scrollbar-always -mx-2 px-2 pb-2"
            >
              <div style={{ minWidth: chartMinWidth }}>
                <AreaChart
                  data={chartData}
                  height={280}
                  primaryLabel="Receitas"
                  secondaryLabel={includeAssumptions ? "Despesas + Suposições" : "Despesas"}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
