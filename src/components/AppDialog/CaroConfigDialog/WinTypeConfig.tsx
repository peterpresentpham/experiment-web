import { TitleContainer } from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { useCaroConfigContext } from './caroConfig.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';

export default function WinTypeConfig() {
  const {
    winMode,
    fn: { setWinMode },
  } = useCaroConfigContext();
  const { config: text } = useMessages(caroMessages);

  return (
    <TitleContainer className="mt-2" title={text.winType}>
      <Button
        variant={winMode == 'blockOpponent' ? 'default' : 'outline'}
        onClick={() => setWinMode('blockOpponent')}
      >
        {text.blockByOpponent}
      </Button>
      <Button
        variant={winMode == 'non-blockOpponent' ? 'default' : 'outline'}
        onClick={() => setWinMode('non-blockOpponent')}
      >
        {text.notBlockByOpponent}
      </Button>
    </TitleContainer>
  );
}
