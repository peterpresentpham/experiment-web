'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import { ComponentProps, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AppTooltip from 'src/components/AppTooltip';
import CopyClipboard from 'src/components/CopyClipboard';
import BaseInput from 'src/components/input/BaseInput';
import ProcessStatus from 'src/components/process-ui/ProcessStatus';
import { Button } from 'src/components/shadcn/button';
import { Form, FormField, FormItemContent } from 'src/components/shadcn/form';
import { formatText } from 'src/services';
import { TProcess } from 'src/types/process.type';
import z from 'zod';

const processTimeSchema = z.object({
  arrivalTime: z.number().min(0, 'arrivalTime must be >= 0'),
  executionTime: z
    .number()
    .min(1, 'executionTime must be >= 1')
    .max(120, 'executionTime must be <= 120'),
});

const schema = processTimeSchema.extend({
  blockTasks: z.array(processTimeSchema).optional(),
});

type TFormValues = z.infer<typeof schema>;

interface TProps {
  data: TProcess;
  events?: {
    onAddBlockTask?: () => void;
    onArrivalTimeChange?: (arrivalTime: number) => void;
    onExecutionTimeChange?: (executionTime: number) => void;
    onDelete?: () => void;
    onBlockTaskArrivalTimeChange?: (index: number, arrivalTime: number) => void;
    onBlockTaskExecutionTimeChange?: (index: number, executionTime: number) => void;
    onBlockTaskDelete?: (index: number) => void;
  };
  props?: ComponentProps<'div'>;
}

export default function ChangeProcessItem({ data, events, props }: TProps) {
  const form = useForm<TFormValues>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: { arrivalTime: data.arrivalTime, executionTime: data.executionTime },
  });

  useEffect(() => {
    form.reset({ arrivalTime: data.arrivalTime, executionTime: data.executionTime });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.arrivalTime, data.executionTime]);

  return (
    <div {...props} className="mt-2 border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <AppTooltip tooltipContent={data.pid}>
            <span className="text-xs font-medium">PID: {formatText(data.pid, 3)}</span>
          </AppTooltip>
          <CopyClipboard copyText={data.pid} iconprops={{ size: 16 }} />
        </div>
        <div className="flex items-center gap-1">
          <ProcessStatus state={data.state} />
          <Trash size={14} className="cursor-pointer" onClick={events?.onDelete} />
        </div>
      </div>
      <Form {...form}>
        <form className="mt-2">
          <FormField
            control={form.control}
            name="arrivalTime"
            render={({ field }) => (
              <FormItemContent
                itemprops={{ className: 'flex items-center gap-4 space-y-0' }}
                labelprops={{ className: 'shrink-0', children: 'Arrival Time' }}
              >
                <BaseInput
                  type="number"
                  className="rounded-none"
                  {...field}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    field.onChange(val);

                    const result = schema.shape.arrivalTime.safeParse(val);
                    if (result.success) events?.onArrivalTimeChange?.(val as number);
                  }}
                />
              </FormItemContent>
            )}
          />
          <FormField
            control={form.control}
            name="executionTime"
            render={({ field }) => (
              <FormItemContent
                itemprops={{ className: 'flex items-center gap-4 space-y-0 mt-2' }}
                labelprops={{ className: 'shrink-0', children: 'Execution Time' }}
              >
                <BaseInput
                  type="number"
                  className="rounded-none"
                  {...field}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    field.onChange(val);

                    const result = schema.shape.executionTime.safeParse(val);
                    if (result.success) events?.onExecutionTimeChange?.(val as number);
                  }}
                />
              </FormItemContent>
            )}
          />
          <Button className="mt-2 rounded-none" onClick={events?.onAddBlockTask} type="button">
            + add block tasks
          </Button>
          {(data?.blockTasks || []).length > 0 && (
            <div className="mt-5 flex flex-col gap-5">
              {data.blockTasks!.map((item, index) => {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <BaseInput
                      type="number"
                      className="rounded-none"
                      name={`blockTask-${index}-start`}
                      placeholder="Start"
                      value={item.arrivalTime}
                      onChange={(event) => {
                        const val = event.target.value === '' ? '' : Number(event.target.value);
                        events?.onBlockTaskArrivalTimeChange?.(index, val as number);
                      }}
                    />
                    <BaseInput
                      name={`blockTask-${index}-duration`}
                      type="number"
                      className="rounded-none"
                      placeholder="Duration"
                      value={item.executionTime}
                      onChange={(event) => {
                        const val = event.target.value === '' ? '' : Number(event.target.value);
                        events?.onBlockTaskExecutionTimeChange?.(index, val as number);
                      }}
                    />
                    <Trash
                      size={14}
                      className="cursor-pointer"
                      onClick={() => events?.onBlockTaskDelete?.(index)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
