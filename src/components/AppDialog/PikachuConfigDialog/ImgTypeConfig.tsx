import { TitleContainer } from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { pikachuImageSets } from 'src/configs/pikachu.constance';
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
      {pikachuImageSets.map((set) => (
        <Button
          key={set}
          variant={imgType == set ? 'default' : 'outline'}
          onClick={() => setImgType(set)}
        >
          {text.imageSets[set]}
        </Button>
      ))}
    </TitleContainer>
  );
}
