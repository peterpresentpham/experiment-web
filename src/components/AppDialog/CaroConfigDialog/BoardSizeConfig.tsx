import { TitleContainer } from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { useCaroConfigContext } from './caroConfig.context';

export default function BoardSizeConfig() {
  const {
    size,
    fn: { setSize },
  } = useCaroConfigContext();
  const { config: text } = useMessages(caroMessages);

  return (
    <TitleContainer className="mt-2" title={text.board}>
      <Button variant={size == 3 ? 'default' : 'outline'} onClick={() => setSize(3)}>
        3x3
      </Button>
      <Button variant={size == 10 ? 'default' : 'outline'} onClick={() => setSize(10)}>
        10x10
      </Button>
      <Button variant={size == 15 ? 'default' : 'outline'} onClick={() => setSize(15)}>
        15x15
      </Button>
    </TitleContainer>
  );
}
