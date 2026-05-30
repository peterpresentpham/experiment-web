'use client';

import { useMemo, useRef } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { useProcessMonitorData } from 'src/state-machine/process.state-machine';
import { ProcessMonitoringStatusType } from 'src/types/process.type';

const MARGIN = { top: 50, right: 20, bottom: 50, left: 80 };
const BAR_HEIGHT = 24;
const ROW_GAP = 12;

type TTooltipData = {
  label: string;
  start: number;
  end: number;
  status: string;
};

export default function TimelineChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const monitorData = useProcessMonitorData();

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, showTooltip, hideTooltip } =
    useTooltip<TTooltipData>();

  const { width, height, xScale, yScale, bars } = useMemo(() => {
    const w = Math.max(containerRef.current?.clientWidth ?? 800, 400);
    const maxTime = Math.max(...monitorData.map((d) => d.end), 10);
    const catSet = new Set<string>();
    monitorData.forEach((p) => catSet.add(p.index !== undefined ? `P${p.index}` : p.pid));
    const cats = Array.from(catSet);
    const h = Math.max(cats.length * (BAR_HEIGHT + ROW_GAP) + MARGIN.top + MARGIN.bottom, 150);

    const xScale = scaleLinear<number>({
      domain: [0, maxTime + 2],
      range: [MARGIN.left, w - MARGIN.right],
      nice: true,
    });

    const yScale = scaleBand<string>({
      domain: cats,
      range: [MARGIN.top, MARGIN.top + cats.length * (BAR_HEIGHT + ROW_GAP)],
      padding: 0.3,
    });

    const bars = monitorData.map((p) => {
      const key = p.index !== undefined ? `P${p.index}` : p.pid;
      const isRunning = p.state === ProcessMonitoringStatusType.RUNNING;
      return {
        key: `${p.pid}-${p.start}`,
        label: key,
        x: p.start,
        x2: p.end,
        y: key,
        color: isRunning ? '#2ecc71' : '#e74c3c',
        status: isRunning ? 'Running' : 'I/O Blocked',
      };
    });

    return { width: w, height: h, categories: cats, xScale, yScale, bars };
  }, [monitorData]);

  if (monitorData.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        No timeline data yet. Start the process simulation to see the chart.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <svg width={width} height={height} className="overflow-visible">
        {/* Title */}
        <text x={MARGIN.left} y={22} fill="var(--foreground, #000)" fontSize={16} fontWeight={700}>
          Realtime Process Scheduling
        </text>

        {/* Y Axis */}
        <AxisLeft
          scale={yScale}
          left={MARGIN.left}
          stroke="var(--muted-foreground, #666)"
          tickStroke="var(--muted-foreground, #666)"
          tickLabelProps={() => ({
            fill: 'var(--foreground, #000)',
            fontSize: 12,
            fontWeight: 600,
            textAnchor: 'end',
            dx: -8,
            dy: 4,
          })}
        />

        {/* X Axis */}
        <AxisBottom
          scale={xScale}
          top={height - MARGIN.bottom}
          stroke="var(--muted-foreground, #666)"
          tickStroke="var(--muted-foreground, #666)"
          label="Time (Units)"
          labelProps={{
            fill: 'var(--muted-foreground, #666)',
            fontSize: 12,
            textAnchor: 'middle',
          }}
          tickLabelProps={() => ({
            fill: 'var(--muted-foreground, #666)',
            fontSize: 11,
            textAnchor: 'middle',
            dy: 4,
          })}
        />

        {/* Grid lines */}
        {xScale.ticks().map((tick) => {
          const x = xScale(tick);
          if (x === undefined) return null;
          return (
            <line
              key={`grid-${tick}`}
              x1={x}
              x2={x}
              y1={MARGIN.top}
              y2={height - MARGIN.bottom}
              stroke="rgba(128, 128, 128, 0.1)"
              strokeWidth={1}
            />
          );
        })}

        {/* Bars */}
        <Group>
          {bars.map((bar) => {
            const yPos = yScale(bar.y);
            if (yPos === undefined) return null;

            const x1 = xScale(bar.x) ?? 0;
            const x2 = xScale(bar.x2) ?? 0;
            const barWidth = Math.max(x2 - x1, 2);

            return (
              <Bar
                key={bar.key}
                x={x1}
                y={yPos}
                width={barWidth}
                height={BAR_HEIGHT}
                fill={bar.color}
                rx={4}
                style={{ cursor: 'pointer' }}
                onMouseMove={(event) => {
                  const point = localPoint(event) || { x: 0, y: 0 };
                  showTooltip({
                    tooltipLeft: point.x,
                    tooltipTop: point.y - 8,
                    tooltipData: {
                      label: bar.label,
                      start: bar.x,
                      end: bar.x2,
                      status: bar.status,
                    },
                  });
                }}
                onMouseLeave={() => hideTooltip()}
              />
            );
          })}
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <Tooltip
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            borderRadius: 8,
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backgroundColor: 'rgba(255,255,255,0.95)',
            color: '#000',
          }}
        >
          <div style={{ fontSize: 12 }}>
            <strong>{tooltipData.label}</strong>
            <br />
            {tooltipData.start} – {tooltipData.end}
            <br />
            Status: <strong>{tooltipData.status}</strong>
          </div>
        </Tooltip>
      )}
    </div>
  );
}
