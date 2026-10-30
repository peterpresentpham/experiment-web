import { Settings } from 'lucide-react';
import IconDialogTrigger from 'src/components/AppDialog/components/IconDialogTrigger';
import { MouseEvent } from 'react';
import { Button } from 'src/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader } from 'src/components/shadcn/dialog';
import { DIALOG_KEY } from 'src/configs/constance';
import { useCaroStore } from 'src/states/caro.state';
import { useDialogStore } from 'src/states/dialog.state';
import GameTypeConfig from '../components/GameTypeConfig';
import PlayModeConfig from '../components/PlayModeConfig';
import BoardSizeConfig from './BoardSizeConfig';
import CaroConfigProvider, { useCaroConfigContext } from './caroConfig.context';
import WinTypeConfig from './WinTypeConfig';

function CaroConfigDialogLayout() {
  const { dialog, setDialog } = useDialogStore();
  const {
    metadata,
    fn: { reset, setMetadata },
  } = useCaroStore();
  const {
    size,
    playMode,
    gameType,
    isOverride,
    winMode,
    fn: { setSize, setPlayMode, setGameType, setIsOverride, setWinMode },
  } = useCaroConfigContext();

  function onSaveConfig(event: MouseEvent<HTMLFormElement>) {
    event.preventDefault();
    setMetadata({ size, playMode, gameType, isOverride, winMode });
    if (size != metadata.size) reset();
    setDialog(DIALOG_KEY.caroConfigDialog, false);
  }

  function onNewGame() {
    reset();
    setDialog(DIALOG_KEY.caroConfigDialog, false);
  }

  function onOpenChange(open: boolean) {
    setSize(metadata.size);
    setPlayMode(metadata.playMode);
    setGameType(metadata.gameType);
    setIsOverride(metadata.isOverride);
    setWinMode(metadata.winMode);
    setDialog(DIALOG_KEY.caroConfigDialog, open);
  }

  function onCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog open={dialog[DIALOG_KEY.caroConfigDialog]} onOpenChange={onOpenChange}>
      <IconDialogTrigger label="Config" icon={Settings} />
      <DialogContent>
        <DialogHeader>Caro config</DialogHeader>
        <form onSubmit={onSaveConfig} className="scroll-hidden max-h-[75vh] overflow-auto">
          <PlayModeConfig />
          <GameTypeConfig />
          <WinTypeConfig />
          <BoardSizeConfig />
          <div className="mt-4 flex items-center justify-between">
            <Button onClick={onNewGame}>New game</Button>
            <div>
              <Button type="button" onClick={onCancel} variant="outline" className="mr-2">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CaroConfigDialog() {
  return (
    <CaroConfigProvider>
      <CaroConfigDialogLayout />
    </CaroConfigProvider>
  );
}
