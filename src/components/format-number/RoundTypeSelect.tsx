import { RoundingMode } from '@peter-present/format-number';
import { ToggleGroup, ToggleGroupItem } from '../shadcn/toggle-group';

const configs: Array<RoundingMode> = ['half', 'up', 'down', 'truncate', 'banker'];

interface TProps {
  mode: RoundingMode;
  setMode: (mode: RoundingMode) => void;
}

export default function RoundTypeSelect({ mode = 'half', setMode }: TProps) {
  return (
    <ToggleGroup className="mt-2 bg-accent" type="single">
      {configs.map((item) => {
        return (
          <ToggleGroupItem
            key={item}
            value={item}
            onClick={() => setMode(item)}
            className="relative"
          >
            {item}
            {mode == item && (
              <div className="absolute right-1.5 bottom-0 left-1.5 h-0.5 bg-destructive" />
            )}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
