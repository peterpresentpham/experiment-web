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
import MachineConfig from './MachineConfig';
import CaroConfigProvider, { useCaroConfigContext } from './caroConfig.context';
import WinTypeConfig from './WinTypeConfig';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { commonMessages } from 'src/i18n/messages/common';

function CaroConfigDialogLayout() {
  const { dialog, setDialog } = useDialogStore();
  const { config: text } = useMessages(caroMessages);
  const { actions } = useMessages(commonMessages);
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
    machineLevel,
    machineTurn,
    fn: {
      setSize,
      setPlayMode,
      setGameType,
      setIsOverride,
      setWinMode,
      setMachineLevel,
      setMachineTurn,
    },
  } = useCaroConfigContext();

  function onSaveConfig(event: MouseEvent<HTMLFormElement>) {
    event.preventDefault();
    const isMachine = playMode == 'machine';
    // The machine does not understand override moves, so the option is off against it.
    setMetadata({
      size,
      playMode,
      gameType,
      isOverride: isMachine ? false : isOverride,
      winMode,
      machineLevel,
      machineTurn,
    });
    const isMachineSetupChanged =
      isMachine && (metadata.playMode != 'machine' || machineTurn != metadata.machineTurn);
    // Machine games always start with player 1, so "who plays first" follows machineTurn.
    if (isMachineSetupChanged) reset(0);
    else if (size != metadata.size) reset(isMachine ? 0 : undefined);
    setDialog(DIALOG_KEY.caroConfigDialog, false);
  }

  function onNewGame() {
    reset(metadata.playMode == 'machine' ? 0 : undefined);
    setDialog(DIALOG_KEY.caroConfigDialog, false);
  }

  function onOpenChange(open: boolean) {
    setSize(metadata.size);
    setPlayMode(metadata.playMode);
    setGameType(metadata.gameType);
    setIsOverride(metadata.isOverride);
    setWinMode(metadata.winMode);
    setMachineLevel(metadata.machineLevel);
    setMachineTurn(metadata.machineTurn);
    setDialog(DIALOG_KEY.caroConfigDialog, open);
  }

  function onCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog open={dialog[DIALOG_KEY.caroConfigDialog]} onOpenChange={onOpenChange}>
      <IconDialogTrigger label={actions.config} icon={Settings} />
      <DialogContent>
        <DialogHeader>{text.title}</DialogHeader>
        <form onSubmit={onSaveConfig} className="scroll-hidden max-h-[75vh] overflow-auto">
          <PlayModeConfig />
          <MachineConfig />
          <GameTypeConfig />
          <WinTypeConfig />
          <BoardSizeConfig />
          <div className="mt-4 flex items-center justify-between">
            <Button onClick={onNewGame}>{actions.newGame}</Button>
            <div>
              <Button type="button" onClick={onCancel} variant="outline" className="mr-2">
                {actions.cancel}
              </Button>
              <Button type="submit">{actions.save}</Button>
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
