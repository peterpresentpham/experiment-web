import { Info } from 'lucide-react';
import { useMemo } from 'react';
import AppTooltip from 'src/components/AppTooltip';
import BaseInput from 'src/components/input/BaseInput';
import { Button } from 'src/components/shadcn/button';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useCaroStore } from 'src/states/caro.state';
import { useCaroConfigContext } from '../CaroConfigDialog/caroConfig.context';

export default function GameTypeConfig() {
  const {
    gameType,
    maxError,
    isOverride,
    fn: { setGameType, setMaxError, setIsOverride },
  } = useCaroConfigContext();
  const { role, connectionType } = useCaroConnectionContext();
  const {
    metadata: { preWinner },
  } = useCaroStore();

  const canNotConfig = useMemo(() => {
    if (connectionType == 'connected') {
      if (preWinner == 0) return role != 'host';
      else return role != 'guest';
    }
    return false;
  }, [connectionType, preWinner, role]);

  return (
    <div className="mt-2 rounded-sm border p-2">
      <p className="text-sm font-bold">Game type</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          disabled={canNotConfig}
          variant={gameType == 'normal' ? 'default' : 'outline'}
          onClick={() => setGameType('normal')}
        >
          Normal
        </Button>
        <Button
          disabled={canNotConfig}
          variant={gameType == 'blind' ? 'default' : 'outline'}
          onClick={() => setGameType('blind')}
        >
          Blind
        </Button>
        <Button
          disabled={canNotConfig}
          variant={isOverride ? 'default' : 'outline'}
          onClick={() => setIsOverride((preValue) => !preValue)}
        >
          Override
        </Button>
      </div>
      {gameType == 'blind' && (
        <div className="mt-6">
          <BaseInput
            name="maximum-errors"
            placeholder="Maximum number of errors"
            type="number"
            value={maxError}
            onChange={(event) => setMaxError(parseInt(event.target.value))}
            icon={{
              end: (
                <AppTooltip tooltipContent="The maximum number of errors that player can make in blind mode">
                  <Info size={14} />
                </AppTooltip>
              ),
            }}
          />
        </div>
      )}
    </div>
  );
}
