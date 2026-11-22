import { Download, Import } from 'lucide-react';
import { ReactNode, useState } from 'react';
import AppTooltip from 'src/components/AppTooltip';
import CopyClipboard from 'src/components/CopyClipboard';
import { Button } from 'src/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from 'src/components/shadcn/dialog';
import { Input } from 'src/components/shadcn/input';
import { Label } from 'src/components/shadcn/label';
import { exampleProcessData } from 'src/configs/example-process';
import { parseImportedProcesses } from 'src/services/process.utils';
import { useProcessStore } from 'src/states/process.state';
import { useMessages } from 'src/i18n/client';
import { processMessages } from 'src/i18n/messages/process';

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
  const text = useMessages(processMessages);
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
        fn.setProcesses(parseImportedProcesses(json));
        setOpen(false);
      } catch (error) {
        console.error(error);
        alert(text.importDialog.invalidJson);
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
            <button aria-label={text.import} className="flex items-center justify-center">
              <AppTooltip tooltipContent={text.import}>
                <Import size={14} className="cursor-pointer" />
              </AppTooltip>
            </button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-3xl overflow-hidden border-none bg-linear-to-br from-background to-muted/30 p-0">
          <div className="col-span-3 flex flex-col space-y-6 p-8">
            <DialogHeader titleProps={{ className: 'text-2xl font-bold tracking-tight' }}>
              {text.importDialog.title}
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="file-upload" className="text-base font-semibold">
                  {text.importDialog.upload}
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="application/json"
                  onChange={onFileChange}
                  className="cursor-pointer file:mr-4 file:border-0 file:bg-primary/10 file:px-4 file:py-1 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 font-medium text-muted-foreground">
                    {text.importDialog.alternative}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold">{text.importDialog.quickStart}</Label>
                <Button
                  variant="outline"
                  className="group h-12 w-full justify-start px-4 transition-all hover:bg-primary/5 hover:text-primary"
                  onClick={onUseExampleData}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                      <Import size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{text.importDialog.loadExample}</div>
                      <div className="text-xs text-muted-foreground">
                        {text.importDialog.loadExampleHint}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
              <div className="overflow-hidden border border-border/50 bg-muted/30">
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/50 px-4 py-2">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {text.importDialog.template}
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
                  <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
                    {EXAMPLE_JSON_SNIPPET}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {isShowExport && (
        <AppTooltip tooltipContent={text.export}>
          {components?.export ? (
            <div className="cursor-pointer">{components.export}</div>
          ) : (
            <Download
              role="button"
              aria-label={text.export}
              onClick={onExport}
              size={14}
              className="cursor-pointer"
            />
          )}
        </AppTooltip>
      )}
    </>
  );
}
