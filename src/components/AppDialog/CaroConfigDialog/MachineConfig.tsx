import { Brain } from 'lucide-react';
import { toast } from 'sonner';
import { TitleContainer } from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { useCaroExperienceStore } from 'src/states/caro-experience.state';
import { TCaroMachineLevel } from 'src/types/caro.type';
import { useCaroConfigContext } from './caroConfig.context';

const LEVELS: Array<TCaroMachineLevel> = ['easy', 'medium', 'hard', 'hell'];

export default function MachineConfig() {
  const {
    playMode,
    machineLevel,
    machineTurn,
    fn: { setMachineLevel, setMachineTurn },
  } = useCaroConfigContext();
  const { config: text, learning } = useMessages(caroMessages);
  const memoryCount = useCaroExperienceStore((state) => state.entries.length);
  const isLearning = useCaroExperienceStore((state) => state.isLearning);
  const clearMemory = useCaroExperienceStore((state) => state.fn.clear);
  const hellModel = useCaroExperienceStore((state) => state.hellModel);
  const hellTrainedGames = useCaroExperienceStore((state) => state.hellTrainedGames);

  if (playMode != 'machine') return null;

  function onClearMemory() {
    clearMemory();
    toast.info(learning.cleared);
  }

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
        {machineLevel == 'hell' && (
          <p className="w-full text-sm text-muted-foreground">
            {hellModel == 'ready'
              ? text.hellHint.ready(hellTrainedGames)
              : hellModel == 'missing'
                ? text.hellHint.missing
                : text.hellHint.unknown}{' '}
            {text.hellHint.report}
          </p>
        )}
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
      <TitleContainer
        className="mt-2"
        title={text.memory}
        contentProps={{ className: 'justify-between' }}
      >
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <Brain size={16} className={isLearning ? 'animate-pulse text-primary' : undefined} />
          {isLearning ? text.memoryLearning : text.memoryCount(memoryCount)}
        </p>
        {memoryCount > 0 && (
          <Button variant="outline" size="sm" onClick={onClearMemory}>
            {text.clearMemory}
          </Button>
        )}
      </TitleContainer>
    </>
  );
}
