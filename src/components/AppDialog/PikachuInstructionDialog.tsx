import AppTooltip from 'src/components/AppTooltip';
import { Info } from 'lucide-react';
import IconDialogTrigger from 'src/components/AppDialog/components/IconDialogTrigger';
import { DIALOG_KEY } from 'src/configs/constance';
import {
  PIKACHU_NUM_TYPES,
  PIKACHU_PIECE_SIZE,
  pikachuImageSets,
  pikachuPieceSrc,
} from 'src/configs/pikachu.constance';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { pikachuMessages } from 'src/i18n/messages/pikachu';
import { useDialogStore } from 'src/states/dialog.state';
import { Dialog, DialogContent, DialogHeader } from '../shadcn/dialog';

export default function PikachuInstructionDialog() {
  const { dialog, setDialog } = useDialogStore();
  const { instruction: text, config } = useMessages(pikachuMessages);
  const { actions } = useMessages(commonMessages);

  return (
    <Dialog
      open={dialog[DIALOG_KEY.pikachuInstructionDialog]}
      onOpenChange={(open) => setDialog(DIALOG_KEY.pikachuInstructionDialog, open)}
    >
      <IconDialogTrigger label={actions.instructions} icon={Info} />
      <DialogContent className="sm:max-w-4xl!">
        <DialogHeader>{text.title}</DialogHeader>
        <div className="scroll-hidden h-fit max-h-[75vh] overflow-auto">
          {pikachuImageSets.map((set, setIndex) => (
            <div key={set} className={setIndex > 0 ? 'mt-4' : undefined}>
              <p className="text-lg">{`${setIndex + 1}. ${config.imageSets[set]}`}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from({ length: PIKACHU_NUM_TYPES }, (_, index) => {
                  const src = pikachuPieceSrc(set, index + 1);
                  return (
                    <div key={src}>
                      <AppTooltip
                        tooltipContent={
                          <img
                            src={src}
                            alt={(index + 1).toString()}
                            style={{
                              width: PIKACHU_PIECE_SIZE + 20,
                              height: PIKACHU_PIECE_SIZE + 20,
                            }}
                          />
                        }
                      >
                        <img
                          src={src}
                          alt={(index + 1).toString()}
                          loading="lazy"
                          style={{ width: PIKACHU_PIECE_SIZE, height: PIKACHU_PIECE_SIZE }}
                        />
                      </AppTooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
