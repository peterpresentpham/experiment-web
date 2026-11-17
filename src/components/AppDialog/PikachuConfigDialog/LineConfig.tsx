import { TitleContainer } from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { usePikachuConfigContext } from './pikachuConfig.context';
import { useMessages } from 'src/i18n/client';
import { pikachuMessages } from 'src/i18n/messages/pikachu';

export default function LineConfig() {
  const {
    numberOfLines,
    fn: { setNumberOfLines },
  } = usePikachuConfigContext();
  const { config: text } = useMessages(pikachuMessages);

  return (
    <TitleContainer className="mt-2" title={text.lines}>
      <Button
        variant={numberOfLines == 2 ? 'default' : 'outline'}
        onClick={() => setNumberOfLines(2)}
      >
        2
      </Button>
      <Button
        variant={numberOfLines == 3 ? 'default' : 'outline'}
        onClick={() => setNumberOfLines(3)}
      >
        3
      </Button>
    </TitleContainer>
  );
}
