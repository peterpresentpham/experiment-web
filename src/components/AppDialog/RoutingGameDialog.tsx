import { Locate } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { DIALOG_KEY } from 'src/configs/constance';
import { useDialogStore } from 'src/states/dialog.state';
import { TMyAllGame } from 'src/types/caro.type';
import AppTooltip from '../AppTooltip';
import { Button } from '../shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../shadcn/dialog';

const configs: { [key in TMyAllGame]: { title: string; link: string } } = {
  caro: { title: 'Caro', link: '/caro' },
  connect4: { title: 'Connect4', link: '/connect4' },
  pikachu: { title: 'Pikachu', link: '/pikachu' },
};

const _arr: Array<TMyAllGame> = ['caro', 'connect4', 'pikachu'];

interface TProps {
  game: TMyAllGame;
}

export default function RoutingGameDialog({ game }: TProps) {
  const config = configs[game];
  const { dialog, setDialog } = useDialogStore();

  const games = useMemo(() => {
    return _arr.filter((item) => item != game);
  }, [game]);

  return (
    <Dialog
      open={dialog[DIALOG_KEY.routingGameDialog]}
      onOpenChange={(open) => setDialog(DIALOG_KEY.routingGameDialog, open)}
    >
      <DialogTrigger className="cursor-pointer">
        <AppTooltip contentProps={{ side: 'bottom' }} tooltipContent="Routing">
          <Locate size={16} />
        </AppTooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>{`${config.title} routing`}</DialogHeader>
        <div className="scroll-hidden flex h-[30vh] flex-wrap gap-2 overflow-auto">
          <Link href="/">
            <Button onClick={() => setDialog(DIALOG_KEY.routingGameDialog, false)}>Go home</Button>
          </Link>
          {games.map((g) => {
            const _game = configs[g];

            return (
              <Link key={_game.title} href={_game.link}>
                <Button
                  variant="outline"
                  onClick={() => setDialog(DIALOG_KEY.routingGameDialog, false)}
                >
                  {_game.title}
                </Button>
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
