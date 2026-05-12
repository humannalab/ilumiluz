"use client";

import { curveMonotoneX } from "@visx/curve";
import { GridRows } from "@visx/grid";
import { localPoint } from "@visx/event";
import { scaleLinear, scaleTime } from "@visx/scale";
import { AreaClosed, LinePath } from "@visx/shape";
import { ParentSize } from "@visx/responsive";
import { motion } from "motion/react";
import useMeasure from "react-use-measure";
import { bisectCenter } from "d3-array";
import { useCallback, useMemo, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface AreaChartDataPoint {
  date: Date;
  primary: number;
  secondary: number;
}

interface TooltipData {
  x: number;
  y: number;
  point: AreaChartDataPoint;
}

interface InternalChartProps {
  data: AreaChartDataPoint[];
  width: number;
  height: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  formatValue?: (v: number) => string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const MARGIN = { top: 24, right: 16, bottom: 32, left: 56 };

function formatDefault(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);
}

/* ─── Inner Chart ────────────────────────────────────────────────────────── */
function InternalChart({
  data,
  width,
  height,
  primaryLabel = "Receitas",
  secondaryLabel = "Despesas",
  formatValue = formatDefault,
}: InternalChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const dates = useMemo(() => data.map((d) => d.date), [data]);

  const xScale = useMemo(
    () =>
      scaleTime({
        domain: [dates[0], dates[dates.length - 1]],
        range: [0, innerW],
      }),
    [dates, innerW]
  );

  const allValues = useMemo(
    () => data.flatMap((d) => [d.primary, d.secondary]),
    [data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.max(...allValues) * 1.15],
        range: [innerH, 0],
        nice: true,
      }),
    [allValues, innerH]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const pt = localPoint(svgRef.current, e);
      if (!pt) return;
      const x0 = xScale.invert(pt.x - MARGIN.left);
      const idx = bisectCenter(dates, x0);
      const point = data[Math.max(0, Math.min(idx, data.length - 1))];
      const cx = xScale(point.date) + MARGIN.left;
      setTooltip({ x: cx, y: pt.y, point });
    },
    [data, dates, xScale]
  );

  const monthFmt = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", { month: "short" }),
    []
  );

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-line-primary)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--chart-line-primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradSecondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-line-secondary)" stopOpacity={0.1} />
            <stop offset="100%" stopColor="var(--chart-line-secondary)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Grid */}
          <GridRows
            scale={yScale}
            width={innerW}
            stroke="var(--chart-grid)"
            strokeOpacity={0.6}
            numTicks={4}
          />

          {/* Areas */}
          <AreaClosed
            data={data}
            x={(d) => xScale(d.date)}
            y={(d) => yScale(d.secondary)}
            yScale={yScale}
            curve={curveMonotoneX}
            fill="url(#gradSecondary)"
          />
          <AreaClosed
            data={data}
            x={(d) => xScale(d.date)}
            y={(d) => yScale(d.primary)}
            yScale={yScale}
            curve={curveMonotoneX}
            fill="url(#gradPrimary)"
          />

          {/* Lines */}
          <LinePath
            data={data}
            x={(d) => xScale(d.date)}
            y={(d) => yScale(d.secondary)}
            curve={curveMonotoneX}
            stroke="var(--chart-line-secondary)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <LinePath
            data={data}
            x={(d) => xScale(d.date)}
            y={(d) => yScale(d.primary)}
            curve={curveMonotoneX}
            stroke="var(--chart-line-primary)"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* X-axis labels */}
          {data.map((d, i) => {
            // Show fewer ticks when many data points
            const step = data.length > 12 ? Math.ceil(data.length / 12) : 1;
            if (i % step !== 0) return null;
            return (
              <text
                key={i}
                x={xScale(d.date)}
                y={innerH + 20}
                textAnchor="middle"
                fontSize={11}
                fill="var(--chart-label)"
                fontFamily="var(--font-sans)"
              >
                {monthFmt.format(d.date)}
              </text>
            );
          })}

          {/* Y-axis labels */}
          {yScale.ticks(4).map((tick) => (
            <text
              key={tick}
              x={-8}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill="var(--chart-label)"
              fontFamily="var(--font-sans)"
            >
              {formatValue(tick)}
            </text>
          ))}

          {/* Crosshair */}
          {tooltip && (
            <>
              <line
                x1={tooltip.x - MARGIN.left}
                x2={tooltip.x - MARGIN.left}
                y1={0}
                y2={innerH}
                stroke="var(--chart-crosshair)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <circle
                cx={xScale(tooltip.point.date)}
                cy={yScale(tooltip.point.primary)}
                r={4}
                fill="var(--chart-line-primary)"
              />
              <circle
                cx={xScale(tooltip.point.date)}
                cy={yScale(tooltip.point.secondary)}
                r={4}
                fill="var(--chart-line-secondary)"
              />
            </>
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="pointer-events-none absolute z-10 min-w-[140px] rounded-lg p-3 shadow-lg"
          style={{
            background: "var(--chart-foreground)",
            left: Math.min(tooltip.x + 12, width - 160),
            top: Math.max(tooltip.y - 60, 0),
          }}
        >
          <p
            className="mb-1.5 text-xs font-medium"
            style={{ color: "var(--chart-tooltip-muted)" }}
          >
            {new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
              tooltip.point.date
            )}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "var(--chart-line-primary)" }}
              />
              <span
                className="text-xs"
                style={{ color: "var(--chart-tooltip-foreground)" }}
              >
                {primaryLabel}: {formatValue(tooltip.point.primary)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "var(--chart-line-secondary)" }}
              />
              <span
                className="text-xs"
                style={{ color: "var(--chart-tooltip-foreground)" }}
              >
                {secondaryLabel}: {formatValue(tooltip.point.secondary)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Public API ─────────────────────────────────────────────────────────── */
export interface AreaChartProps {
  data: AreaChartDataPoint[];
  height?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  formatValue?: (v: number) => string;
  className?: string;
}

export function AreaChart({
  data,
  height = 280,
  primaryLabel,
  secondaryLabel,
  formatValue,
  className,
}: AreaChartProps) {
  const [ref, { width }] = useMeasure();

  return (
    <div ref={ref} className={className ?? "w-full"}>
      {width > 0 && (
        <InternalChart
          data={data}
          width={width}
          height={height}
          primaryLabel={primaryLabel}
          secondaryLabel={secondaryLabel}
          formatValue={formatValue}
        />
      )}
    </div>
  );
}
