import AppTooltip from 'src/components/AppTooltip';
import { Info } from 'lucide-react';
import IconDialogTrigger from 'src/components/AppDialog/components/IconDialogTrigger';
import { useState } from 'react';
import { DIALOG_KEY } from 'src/configs/constance';
import { PIKACHU_PIECE_SIZE, PIKACHU_URL } from 'src/configs/pikachu.constance';
import { useDialogStore } from 'src/states/dialog.state';
import AppPagination from '../AppPagination';
import { Dialog, DialogContent, DialogHeader } from '../shadcn/dialog';

export default function PikachuInstructionDialog() {
  const { dialog, setDialog } = useDialogStore();
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Dialog
      open={dialog[DIALOG_KEY.pikachuInstructionDialog]}
      onOpenChange={(open) => setDialog(DIALOG_KEY.pikachuInstructionDialog, open)}
    >
      <IconDialogTrigger label="Instructions" icon={Info} />
      <DialogContent className="sm:max-w-4xl!">
        <DialogHeader>Pikachu instruction</DialogHeader>
        <div className="scroll-hidden h-fit max-h-[75vh] overflow-auto">
          <p className="text-lg">1. Internal images</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from({ length: 90 }).map((_, index) => {
              const _index = index + 1;

              return (
                <div key={_index}>
                  <AppTooltip
                    tooltipContent={
                      <img
                        src={`/pikachu/piece${_index}.png`}
                        alt={_index.toString()}
                        style={{ width: PIKACHU_PIECE_SIZE + 20, height: PIKACHU_PIECE_SIZE + 20 }}
                      />
                    }
                  >
                    <img
                      src={`/pikachu/piece${_index}.png`}
                      alt={_index.toString()}
                      style={{ width: PIKACHU_PIECE_SIZE, height: PIKACHU_PIECE_SIZE }}
                    />
                  </AppTooltip>
                </div>
              );
            })}
          </div>
          <p className="text-lg">2. External images</p>
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: currentPage < 12 ? 90 : 35 }).map((_, index) => {
                const _index = index - 89 + 90 * currentPage;

                return (
                  <div key={`external-${_index}`}>
                    <AppTooltip
                      tooltipContent={
                        <img
                          src={`${PIKACHU_URL}/${_index}.png`}
                          alt={_index.toString()}
                          style={{
                            width: PIKACHU_PIECE_SIZE + 20,
                            height: PIKACHU_PIECE_SIZE + 20,
                          }}
                        />
                      }
                    >
                      <img
                        src={`${PIKACHU_URL}/${_index}.png`}
                        alt={_index.toString()}
                        style={{ width: PIKACHU_PIECE_SIZE, height: PIKACHU_PIECE_SIZE }}
                      />
                    </AppTooltip>
                  </div>
                );
              })}
            </div>
            <AppPagination
              className="flex justify-end"
              currentPage={currentPage}
              totalPages={12}
              events={{ onPageChange: (page) => setCurrentPage(page) }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
