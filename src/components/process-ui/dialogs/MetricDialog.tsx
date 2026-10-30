import { DialogProps } from '@radix-ui/react-dialog';
import { useMemo, useState } from 'react';
import { Button } from 'src/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from 'src/components/shadcn/dialog';
import { useProcessStateMachine } from 'src/state-machine/process.state-machine';
import { TProcessMeasureMetrics } from 'src/types/process.type';

export default function MetricDialog(props: DialogProps) {
  const { state } = useProcessStateMachine();
  const [open, setOpen] = useState(false);

  const { globalMetric, processMetrics } = useMemo(() => {
    const rawMetric = state.context.metricsData;
    const processMetrics: Array<TProcessMeasureMetrics & { index?: number }> = Object.values(
      rawMetric
    ).map((item) => {
      const turnaroundTime =
        item.completionTime != undefined ? item.completionTime - item.arrivalTime : undefined;
      const waitingTime = turnaroundTime != undefined ? turnaroundTime - item.burstTime : undefined;
      const responseTime =
        item.startTime != undefined ? item.startTime - item.arrivalTime : undefined;
      return { index: item.index, turnaroundTime, waitingTime, responseTime };
    });

    const averageMetric = (
      key: keyof TProcessMeasureMetrics
    ): TProcessMeasureMetrics[keyof TProcessMeasureMetrics] => {
      let sum = 0;
      let count = 0;
      processMetrics.forEach((item) => {
        const value = item[key];
        if (value !== undefined) {
          sum += value;
          count += 1;
        }
      });
      return count > 0 ? sum / count : undefined;
    };

    const globalMetric: TProcessMeasureMetrics = {
      turnaroundTime: averageMetric('turnaroundTime'),
      waitingTime: averageMetric('waitingTime'),
      responseTime: averageMetric('responseTime'),
    };

    return { globalMetric, processMetrics };
  }, [state.context.metricsData]);

  return (
    <Dialog {...props} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover:border-border h-8 border-x border-transparent">Metrics</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl opacity-80">
        <DialogHeader>Metric Dialog</DialogHeader>
        <div className="flex min-w-[320px] flex-1 flex-col gap-2 px-3 py-2 text-xs">
          <div className="text-foreground flex flex-wrap items-center gap-3">
            <div className="bg-muted px-2 py-1">
              Avg Turnaround:{' '}
              <span className="font-semibold">
                {globalMetric.turnaroundTime !== undefined
                  ? globalMetric.turnaroundTime.toFixed(2)
                  : '—'}
              </span>
            </div>
            <div className="bg-muted px-2 py-1">
              Avg Waiting:{' '}
              <span className="font-semibold">
                {globalMetric.waitingTime !== undefined ? globalMetric.waitingTime.toFixed(2) : '—'}
              </span>
            </div>
            <div className="bg-muted px-2 py-1">
              Avg Response:{' '}
              <span className="font-semibold">
                {globalMetric.responseTime !== undefined
                  ? globalMetric.responseTime.toFixed(2)
                  : '—'}
              </span>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="border-border text-muted-foreground border-b">
                  <th className="py-1 pr-2">#</th>
                  <th className="py-1 pr-2">Turnaround</th>
                  <th className="py-1 pr-2">Waiting</th>
                  <th className="py-1">Response</th>
                </tr>
              </thead>
              <tbody>
                {processMetrics.length === 0 ? (
                  <tr>
                    <td className="text-muted-foreground py-2" colSpan={4}>
                      No metrics yet
                    </td>
                  </tr>
                ) : (
                  processMetrics.map((metric, idx) => (
                    <tr key={idx} className="border-border border-b">
                      <td className="py-1 pr-2">
                        {metric.index !== undefined ? metric.index : idx + 1}
                      </td>
                      <td className="py-1 pr-2">
                        {metric.turnaroundTime !== undefined
                          ? metric.turnaroundTime.toFixed(2)
                          : '—'}
                      </td>
                      <td className="py-1 pr-2">
                        {metric.waitingTime !== undefined ? metric.waitingTime.toFixed(2) : '—'}
                      </td>
                      <td className="py-1">
                        {metric.responseTime !== undefined ? metric.responseTime.toFixed(2) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
