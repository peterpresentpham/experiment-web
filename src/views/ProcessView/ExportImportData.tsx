/* eslint-disable @typescript-eslint/no-explicit-any */
import { Download, Import } from 'lucide-react';
import { ReactNode, useState } from 'react';
import AppTooltip from 'src/components/AppTooltip';
import CopyClipboard from 'src/components/CopyClipboard';
import { Button } from 'src/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from 'src/components/shadcn/dialog';
import { Input } from 'src/components/shadcn/input';
import { Label } from 'src/components/shadcn/label';
import { exampleProcessData } from 'src/configs/example-process';
import { useProcessStore } from 'src/states/process.state';
import { TProcessDataObject, ProcessStatusType } from 'src/types/process.type';

interface TProps {
  components?: {
    import?: ReactNode;
    export?: ReactNode;
  };
  isShowExport?: boolean;
}

const EXAMPLE_JSON_SNIPPET = `{
  "process-id-1": {
    "pid": "process-id-1",
    "arrivalTime": 0,
    "executionTime": 5,
    "blockTasks": [
      { "arrivalTime": 2, "executionTime": 1 }
    ]
  }
}`;

export default function ExportImportData({ components, isShowExport = true }: TProps) {
  const { processes, fn } = useProcessStore();
  const [open, setOpen] = useState(false);

  function onExport() {
    const jsonStr = JSON.stringify(processes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        const result: TProcessDataObject = {};

        if (Array.isArray(json)) {
          json.forEach((item: Record<string, any>, index: number) => {
            const pid = (item.pid as string) || crypto.randomUUID();
            result[pid] = {
              ...(item as any),
              pid,
              index: (item.index as number) ?? index + 1,
              state: ProcessStatusType.NEW,
              runtime: 0,
              currentBlockTaskIndex: 0,
              readyPriority: -1,
              waitingPriority: -1,
              beginAt: -1,
              endAt: -1,
              blockTasks: item.blockTasks?.map((task: any) => ({
                ...task,
                runtime: 0,
              })),
            };
          });
        } else if (typeof json === 'object' && json !== null) {
          Object.entries(json).forEach(([key, item]: [string, any]) => {
            result[key] = {
              ...item,
              pid: (item.pid as string) || key,
              state: ProcessStatusType.NEW,
              runtime: 0,
              currentBlockTaskIndex: 0,
              readyPriority: -1,
              waitingPriority: -1,
              beginAt: -1,
              endAt: -1,
              blockTasks: item.blockTasks?.map((task: any) => ({
                ...task,
                runtime: 0,
              })),
            };
          });
        }
        fn.setProcesses(result);
        setOpen(false);
      } catch (error) {
        console.error(error);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  function onUseExampleData() {
    fn.setProcesses(exampleProcessData);
    setOpen(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {components?.import ? (
            <div className="cursor-pointer">{components.import}</div>
          ) : (
            <button className="flex items-center justify-center">
              <AppTooltip tooltipContent="Import">
                <Import size={14} className="cursor-pointer" />
              </AppTooltip>
            </button>
          )}
        </DialogTrigger>
        <DialogContent className="from-background to-muted/30 max-w-3xl overflow-hidden border-none bg-linear-to-br p-0">
          <div className="col-span-3 flex flex-col space-y-6 p-8">
            <DialogHeader titleProps={{ className: 'text-2xl font-bold tracking-tight' }}>
              Data Configuration
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="file-upload" className="text-base font-semibold">
                  Upload Configuration
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="application/json"
                  onChange={onFileChange}
                  className="file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer file:mr-4 file:border-0 file:px-4 file:py-1 file:text-sm file:font-semibold"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="border-border/50 w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-3 font-medium">
                    Alternative
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Quick Start</Label>
                <Button
                  variant="outline"
                  className="hover:bg-primary/5 hover:text-primary group h-12 w-full justify-start px-4 transition-all"
                  onClick={onUseExampleData}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 group-hover:bg-primary/20 p-2 transition-colors">
                      <Import size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Load Example Data</div>
                      <div className="text-muted-foreground text-xs">
                        Get started quickly with preset processes
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
              <div className="border-border/50 bg-muted/30 overflow-hidden border">
                <div className="bg-muted/50 border-border/50 flex items-center justify-between border-b px-4 py-2">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    JSON Template
                  </span>
                  <CopyClipboard
                    copyText={EXAMPLE_JSON_SNIPPET}
                    iconprops={{
                      size: 14,
                      className: 'text-muted-foreground hover:text-primary transition-colors',
                    }}
                  />
                </div>
                <div className="bg-secondary p-4">
                  <pre className="text-muted-foreground overflow-x-auto font-mono text-xs leading-relaxed">
                    {EXAMPLE_JSON_SNIPPET}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {isShowExport && (
        <AppTooltip tooltipContent="Export">
          {components?.export ? (
            <div className="cursor-pointer">{components.export}</div>
          ) : (
            <Download onClick={onExport} size={14} className="cursor-pointer" />
          )}
        </AppTooltip>
      )}
    </>
  );
}
