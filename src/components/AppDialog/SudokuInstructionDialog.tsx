import { Info } from 'lucide-react';
import IconDialogTrigger from 'src/components/AppDialog/components/IconDialogTrigger';
import { DIALOG_KEY } from 'src/configs/constance';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { sudokuMessages } from 'src/i18n/messages/sudoku';
import { useDialogStore } from 'src/states/dialog.state';
import { Dialog, DialogContent, DialogHeader } from '../shadcn/dialog';

export default function SudokuInstructionDialog() {
  const { dialog, setDialog } = useDialogStore();
  const { instruction } = useMessages(sudokuMessages);
  const { actions } = useMessages(commonMessages);

  return (
    <Dialog
      open={dialog[DIALOG_KEY.sudokuInstructionDialog]}
      onOpenChange={(open) => setDialog(DIALOG_KEY.sudokuInstructionDialog, open)}
    >
      <IconDialogTrigger label={actions.instructions} icon={Info} />
      <DialogContent>
        <DialogHeader>{instruction.title}</DialogHeader>
        <div className="flex flex-col gap-4 text-sm">
          {[instruction.rules, instruction.controls].map((items, group) => (
            <ul key={group} className="list-disc space-y-1.5 pl-5">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
