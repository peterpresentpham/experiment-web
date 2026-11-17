import { Info } from 'lucide-react';
import { useMemo } from 'react';
import AppTooltip from 'src/components/AppTooltip';
import BaseInput from 'src/components/input/BaseInput';
import { Button } from 'src/components/shadcn/button';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { useCaroStore } from 'src/states/caro.state';
import { useCaroConfigContext } from '../CaroConfigDialog/caroConfig.context';

export default function GameTypeConfig() {
  const {
    gameType,
    maxError,
    isOverride,
    playMode,
    fn: { setGameType, setMaxError, setIsOverride },
  } = useCaroConfigContext();
  const { role, connectionType } = useCaroConnectionContext();
  const { config: text } = useMessages(caroMessages);
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
      <p className="text-sm font-bold">{text.gameType}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          disabled={canNotConfig}
          variant={gameType == 'normal' ? 'default' : 'outline'}
          onClick={() => setGameType('normal')}
        >
          {text.normal}
        </Button>
        <Button
          disabled={canNotConfig}
          variant={gameType == 'blind' ? 'default' : 'outline'}
          onClick={() => setGameType('blind')}
        >
          {text.blind}
        </Button>
        <Button
          disabled={canNotConfig || playMode == 'machine'}
          variant={isOverride && playMode != 'machine' ? 'default' : 'outline'}
          onClick={() => setIsOverride((preValue) => !preValue)}
        >
          {text.override}
        </Button>
      </div>
      {gameType == 'blind' && (
        <div className="mt-6">
          <BaseInput
            name="maximum-errors"
            placeholder={text.maxErrors}
            type="number"
            value={maxError}
            onChange={(event) => setMaxError(parseInt(event.target.value))}
            icon={{
              end: (
                <AppTooltip tooltipContent={text.maxErrorsHint}>
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
