import { TitleContainer } from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { usePikachuConfigContext } from './pikachuConfig.context';
import { useMessages } from 'src/i18n/client';
import { pikachuMessages } from 'src/i18n/messages/pikachu';

export default function GameTypeConfig() {
  const {
    gameType,
    fn: { setGameType },
  } = usePikachuConfigContext();
  const { config: text } = useMessages(pikachuMessages);

  return (
    <TitleContainer className="mt-2" title={text.gameType}>
      <Button
        variant={gameType == 'normal' ? 'default' : 'outline'}
        onClick={() => setGameType('normal')}
      >
        {text.normal}
      </Button>
      <Button
        variant={gameType == 'customBoard' ? 'default' : 'outline'}
        onClick={() => setGameType('customBoard')}
      >
        {text.customBoard}
      </Button>
      <Button
        variant={gameType == 'randomBoard' ? 'default' : 'outline'}
        onClick={() => setGameType('randomBoard')}
      >
        {text.randomBoard}
      </Button>
      <Button
        variant={gameType == 'blind' ? 'default' : 'outline'}
        onClick={() => setGameType('blind')}
      >
        {text.blind}
      </Button>
    </TitleContainer>
  );
}
