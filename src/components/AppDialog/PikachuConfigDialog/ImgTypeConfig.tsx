import { TitleContainer } from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { usePikachuConfigContext } from './pikachuConfig.context';
import { useMessages } from 'src/i18n/client';
import { pikachuMessages } from 'src/i18n/messages/pikachu';

export default function ImgTypeConfig() {
  const {
    imgType,
    fn: { setImgType },
  } = usePikachuConfigContext();
  const { config: text } = useMessages(pikachuMessages);

  return (
    <TitleContainer className="mt-2" title={text.imageType}>
      <Button
        variant={imgType == 'internal' ? 'default' : 'outline'}
        onClick={() => setImgType('internal')}
      >
        {text.internal}
      </Button>
      <Button
        variant={imgType == 'external' ? 'default' : 'outline'}
        onClick={() => setImgType('external')}
      >
        {text.external}
      </Button>
    </TitleContainer>
  );
}
