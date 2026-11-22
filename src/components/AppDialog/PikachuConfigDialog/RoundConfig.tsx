import { ChevronDown, Trash } from 'lucide-react';
import { useState } from 'react';
import IconButton from 'src/components/buttons/IconButton';
import Draggable from 'src/components/dnd/Draggable';
import Droppable from 'src/components/dnd/Droppable';
import SortableItem from 'src/components/dnd/SortableItem';
import { Button } from 'src/components/shadcn/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'src/components/shadcn/collapsible';
import { pikachuRoundTransformations } from 'src/configs/pikachu.constance';
import { useMessages } from 'src/i18n/client';
import { pikachuMessages } from 'src/i18n/messages/pikachu';
import { cn } from 'src/lib/utils';
import { removeAtIndex } from 'src/services';
import { TPikachuTransform } from 'src/types/pikachu.type';
import { usePikachuConfigContext } from './pikachuConfig.context';

export default function RoundConfig() {
  const [isOpen, setIsOpen] = useState(true);
  const {
    rounds,
    fn: { setRounds },
  } = usePikachuConfigContext();
  const { config: text, transforms } = useMessages(pikachuMessages);

  function onRemove(id: TPikachuTransform) {
    setRounds((preValue) => {
      const index = preValue.indexOf(id);
      return removeAtIndex(preValue, index);
    });
  }

  function onCollapseClose(open: boolean) {
    setIsOpen(open);
  }

  return (
    <div className="mt-2 rounded-sm border p-2">
      <Collapsible open={isOpen} onOpenChange={onCollapseClose}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <p className="text-sm font-bold">{text.rounds}</p>
          <ChevronDown
            className={cn('size-4 cursor-pointer transition duration-400', isOpen && 'rotate-180')}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Button onClick={() => setRounds(pikachuRoundTransformations)}>{text.reset}</Button>
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-sm border border-ring p-1">
            {pikachuRoundTransformations
              .filter((id) => !rounds.includes(id))
              .map((id) => {
                return (
                  <Draggable key={id} id={id} className="rounded-sm border border-ring p-2">
                    <p className="text-sm">{transforms[id]}</p>
                  </Draggable>
                );
              })}
          </div>
          <Droppable
            id="pikachu-config-droppable"
            className="mt-2 flex flex-wrap gap-2 rounded-sm border border-ring p-1"
          >
            {rounds.map((id, index) => (
              <SortableItem
                key={id}
                id={id}
                className="flex cursor-grab justify-between rounded-sm border border-ring bg-background/70 p-2"
              >
                <div className="flex items-center gap-1">
                  <p className="font-bold">{index + 1}.</p>
                  <p className="text-sm text-nowrap">{transforms[id]}</p>
                </div>
                <IconButton aria-label={text.removeRound} onClick={() => onRemove(id)}>
                  <Trash size={14} />
                </IconButton>
              </SortableItem>
            ))}
          </Droppable>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
