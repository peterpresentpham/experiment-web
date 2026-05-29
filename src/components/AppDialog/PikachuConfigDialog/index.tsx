import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { Settings } from 'lucide-react';
import { MouseEvent } from 'react';
import AppTooltip from 'src/components/AppTooltip';
import { Button } from 'src/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from 'src/components/shadcn/dialog';
import { DIALOG_KEY } from 'src/configs/constance';
import { useDialogStore } from 'src/states/dialog.state';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TPikachuTransform } from 'src/types/pikachu.type';
import BoardSizeConfig from './BoardSizeConfig';
import GameTypeConfig from './GameTypeConfig';
import ImgTypeConfig from './ImgTypeConfig';
import LineConfig from './LineConfig';
import PikachuConfigProvider, { usePikachuConfigContext } from './pikachuConfig.context';
import RoundConfig from './RoundConfig';

function PikachuConfigDialogLayout() {
  const { dialog, setDialog } = useDialogStore();
  const {
    metadata,
    fn: { setMetadata },
  } = usePikachuStore();
  const {
    size,
    numberOfLines,
    imgType,
    rounds,
    gameType,
    fn: { setSize, setNumberOfLines, setImgType, setRounds, setGameType },
  } = usePikachuConfigContext();

  function onSaveConfig(event: MouseEvent<HTMLFormElement>) {
    event.preventDefault();

    setMetadata({
      numberOfRows: size.numberOfRows,
      numberOfColumns: size.numberOfColumns,
      numberOfLines,
      imgType,
      roundList: rounds,
      gameType,
    });
    setDialog(DIALOG_KEY.pikachuConfigDialog, false);
  }

  function onOpenChange(open: boolean) {
    setDialog(DIALOG_KEY.pikachuConfigDialog, open);
  }

  function onCancel() {
    setSize({ numberOfRows: metadata.numberOfRows, numberOfColumns: metadata.numberOfColumns });
    setNumberOfLines(metadata.numberOfLines);
    setImgType(metadata.imgType);
    setRounds(metadata.roundList);
    setGameType(metadata.gameType);
    onOpenChange(false);
  }

  return (
    <Dialog open={dialog[DIALOG_KEY.pikachuConfigDialog]} onOpenChange={onOpenChange}>
      <DialogTrigger>
        <AppTooltip tooltipContent="Config" contentProps={{ side: 'bottom' }}>
          <Settings size={16} />
        </AppTooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Pikachu config</DialogHeader>
        <form onSubmit={onSaveConfig} className="scroll-hidden max-h-[75vh] overflow-auto">
          <div className="bg-background fixed right-0 left-0 flex items-center justify-between px-6 py-2 shadow-2xl">
            <Button onClick={onCancel} variant="destructive" className="mr-2">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
          <BoardSizeConfig />
          <ImgTypeConfig />
          <LineConfig />
          <RoundConfig />
          <GameTypeConfig />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PikachuConfigDialogDndLayout() {
  const {
    rounds,
    fn: { setRounds },
  } = usePikachuConfigContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    if (over.id == 'pikachu-config-droppable') {
      setRounds((rounds) => {
        return [active.id as TPikachuTransform, ...rounds];
      });
    } else {
      setRounds((rounds) => {
        const oldIndex = rounds.indexOf(active.id as TPikachuTransform);
        const newIndex = rounds.indexOf(over.id as TPikachuTransform);

        return arrayMove(rounds, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={rounds} strategy={horizontalListSortingStrategy}>
        <PikachuConfigDialogLayout />
      </SortableContext>
    </DndContext>
  );
}

export default function PikachuConfigDialog() {
  return (
    <PikachuConfigProvider>
      <PikachuConfigDialogDndLayout />
    </PikachuConfigProvider>
  );
}
