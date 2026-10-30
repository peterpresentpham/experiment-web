/* eslint-disable quotes */
import { Bluetooth, Circle, Settings } from 'lucide-react';
import IconDialogTrigger from 'src/components/AppDialog/components/IconDialogTrigger';
import { DIALOG_KEY } from 'src/configs/constance';
import { useDialogStore } from 'src/states/dialog.state';
import { Dialog, DialogContent, DialogHeader } from '../shadcn/dialog';

export default function CaroInstructionDialog() {
  const { dialog, setDialog } = useDialogStore();

  function onSettingClick() {
    setDialog(DIALOG_KEY.caroInstructionDialog, false);
    setDialog(DIALOG_KEY.caroConfigDialog, true);
  }

  return (
    <Dialog
      open={dialog[DIALOG_KEY.caroInstructionDialog]}
      onOpenChange={(open) => setDialog(DIALOG_KEY.caroInstructionDialog, open)}
    >
      <IconDialogTrigger label="Instructions" icon={Circle} />
      <DialogContent className="sm:max-w-4xl!">
        <DialogHeader>Caro instruction</DialogHeader>
        <div className="scroll-hidden h-fit max-h-[75vh] overflow-auto">
          <p className="text-lg">1. How to play?</p>
          <p className="text-justify text-sm">
            {
              'Your goal is to make five pieces of the same color in a vertical, horizontal or diagonal line. The player1 will take the first move. After the first game is over, the winner will take the first move.'
            }
          </p>
          <p className="mt-2 text-lg">2. Setting</p>
          <div className="text-justify text-sm">
            {'Click on the icon'}{' '}
            <Settings onClick={onSettingClick} className="inline cursor-pointer" size={14} />{' '}
            {
              'to open the config dialog. In the config dialog, you can change control the caro board. When you press save button, your changes will be applied and the new game will be started.'
            }
          </div>
          <p className="mt-2 text-lg">3. Play mode</p>
          <p className="text-justify text-sm">
            {'This game has three modes:'} <span className="text-primary font-medium">offline</span>
            {', '}
            <span className="text-primary font-medium">online</span>
            {', and '}
            <span className="text-primary font-medium">machine</span>
            {'. You and your friend can play in one device on offline play mode.'}
          </p>
          <p className="text-justify text-sm">
            {
              'Meanwhile, in online play mode, you and your friend can connect to other peer-to-peer online ('
            }
            <Bluetooth className="inline" size={14} />
            {
              '). One of you will be the host, and the other will be the guest. The host creates the connection and gets a short room code; the guest enters that room code to join. The app automatically exchanges the connection info in the background, so you only need to share the short room code with your friend (via any chat app). After the connection is established, you can start playing and chatting with each other.'
            }
          </p>
          <p className="mt-2 text-lg">4. Online play mode</p>
          <p className="text-justify text-sm">
            {
              'The host, currently as the player1, has the right to control the configuration and take the first move. When the connection is established, the configuration will be synced to the guest. After the first game is over, the right to control the configuration and play the first move will be transferred to the winner.'
            }
          </p>
          <p className="mt-2 text-lg">5. Game type</p>
          <p className="text-justify text-sm">
            {'This game support two game types:'}{' '}
            <span className="text-primary font-medium">normal</span> {'and'}{' '}
            <span className="text-primary font-medium">blind</span>.
          </p>
          <p className="text-justify text-sm">
            {
              'Normal type is just an ordinary traditional caro game, where two players perform their move until one of them wins.'
            }
          </p>
          <p className="text-justify text-sm">
            {
              "In blind type, only the latest move is shown on the game board; others are hidden, and players must depend on their memory to play their move. If a player makes at least a pre-defined number of mistakes (try to play from the grid that has already been played), the game's over, and the remaining player is the winner."
            }
          </p>
          <p className="text-justify text-sm">
            {
              'You can enable override mode. In this mode, you can play on the grid that the opponent has already played.'
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
