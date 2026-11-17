import { TitleContainer } from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { usePikachuConfigContext } from './pikachuConfig.context';
import { useMessages } from 'src/i18n/client';
import { pikachuMessages } from 'src/i18n/messages/pikachu';

export default function BoardSizeConfig() {
  const {
    size,
    fn: { setSize },
  } = usePikachuConfigContext();
  const { config: text } = useMessages(pikachuMessages);

  return (
    <TitleContainer className="mt-16" title={text.board}>
      <Button
        variant={size.numberOfColumns == 6 ? 'default' : 'outline'}
        onClick={() => setSize({ numberOfRows: 4, numberOfColumns: 6 })}
      >
        6x4
      </Button>
      <Button
        variant={size.numberOfColumns == 9 ? 'default' : 'outline'}
        onClick={() => setSize({ numberOfRows: 6, numberOfColumns: 9 })}
      >
        9x6
      </Button>
      <Button
        variant={size.numberOfColumns == 16 ? 'default' : 'outline'}
        onClick={() => setSize({ numberOfRows: 9, numberOfColumns: 16 })}
      >
        16x9
      </Button>
    </TitleContainer>
  );
}
