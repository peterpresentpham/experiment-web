import { SendHorizonal } from 'lucide-react';
import { ChangeEvent, ComponentProps, KeyboardEvent, useRef, useState } from 'react';
import { Input } from 'src/components/shadcn/input';
import { cn } from 'src/lib/utils';

type TProps = ComponentProps<'div'> & {
  onSend?: (message: string) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
};

export default function ChatInput(props: TProps) {
  const { onSend, onStartTyping, onStopTyping, ...rest } = props;
  const [value, setValue] = useState('');
  const isFocusedRef = useRef(false);

  function onChangeValue(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.currentTarget.value);
    if (event.currentTarget.value.trim()) onStartTyping?.();
    else onStopTyping?.();
  }

  function trySendMessage() {
    const _value = value.trim();
    if (!_value) return;
    onStopTyping?.();
    onSend?.(_value);
    setValue('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      trySendMessage();
    }
  }

  function handleFocus() {
    isFocusedRef.current = true;
  }

  function handleBlur() {
    isFocusedRef.current = false;
    onStopTyping?.();
  }

  return (
    <div {...rest} className={cn('relative', rest.className)}>
      <Input
        type="text"
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onChange={onChangeValue}
      />
      <SendHorizonal
        size={16}
        className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
        onClick={trySendMessage}
      />
    </div>
  );
}
