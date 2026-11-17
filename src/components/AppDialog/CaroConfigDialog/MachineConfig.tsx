import { TitleContainer } from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { TCaroMachineLevel } from 'src/types/caro.type';
import { useCaroConfigContext } from './caroConfig.context';

const LEVELS: Array<TCaroMachineLevel> = ['easy', 'medium', 'hard'];

export default function MachineConfig() {
  const {
    playMode,
    machineLevel,
    machineTurn,
    fn: { setMachineLevel, setMachineTurn },
  } = useCaroConfigContext();
  const { config: text } = useMessages(caroMessages);

  if (playMode != 'machine') return null;

  return (
    <>
      <TitleContainer className="mt-2" title={text.machineLevel}>
        {LEVELS.map((value) => (
          <Button
            key={value}
            variant={machineLevel == value ? 'default' : 'outline'}
            onClick={() => setMachineLevel(value)}
          >
            {text.levels[value]}
          </Button>
        ))}
      </TitleContainer>
      <TitleContainer className="mt-2" title={text.firstMove}>
        <Button
          variant={machineTurn == 1 ? 'default' : 'outline'}
          onClick={() => setMachineTurn(1)}
        >
          {text.firstMoveYou}
        </Button>
        <Button
          variant={machineTurn == 0 ? 'default' : 'outline'}
          onClick={() => setMachineTurn(0)}
        >
          {text.firstMoveMachine}
        </Button>
      </TitleContainer>
    </>
  );
}
