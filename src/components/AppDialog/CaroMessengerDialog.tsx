import { MessageCircle, Send } from 'lucide-react';
import IconDialogTrigger from 'src/components/AppDialog/components/IconDialogTrigger';
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { beVietnamPro } from 'src/configs/constance';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { cn } from 'src/lib/utils';
import { createCaroMessage } from 'src/services/caro.utils';
import { useCaroChat } from 'src/states/messenger.state';
import { Dialog, DialogContent, DialogHeader } from '../shadcn/dialog';
import { Textarea } from '../shadcn/textarea';

export default function CaroMessengerDialog() {
  const { peer, connectionType } = useCaroConnectionContext();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const {
    chats,
    fn: { addChats },
  } = useCaroChat();
  const [message, setMessage] = useState('');

  function _sendMessage(message: string) {
    if (peer && message.length > 0) {
      addChats('yourChat', message);
      peer.send(createCaroMessage('chat', message));
      setMessage('');
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && message.trim() !== '' && !event.shiftKey) {
      event.preventDefault();
      _sendMessage(message);
    }
  }

  function onSendClick(event: MouseEvent<SVGElement>) {
    event.preventDefault();
    _sendMessage(message);
  }

  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
  }, [chats]);

  return connectionType == 'connected' ? (
    <Dialog>
      <IconDialogTrigger label="Message" icon={MessageCircle} />
      <DialogContent className="flex h-3/4 flex-col">
        <DialogHeader className="h-fit">Messenger</DialogHeader>
        <div className="flex h-[calc(100%-20px)] flex-col gap-4">
          <div ref={messagesEndRef} className="scroll-hidden flex-1 overflow-y-scroll">
            {chats.map((chat, index) => {
              if (chat.type == 'yourChat')
                return (
                  <div key={index} className="relative mt-4 ml-4 flex justify-end">
                    <div className="absolute -top-2 right-0 text-[8px]">you</div>
                    <div className={cn('bg-secondary rounded-sm p-1', beVietnamPro.className)}>
                      {chat.message}
                    </div>
                  </div>
                );
              else
                return (
                  <div key={index} className="relative mt-4 mr-4 flex">
                    <div className="absolute -top-2 text-[8px]">friend</div>
                    <div className={cn('bg-sidebar-ring rounded-sm p-1', beVietnamPro.className)}>
                      {chat.message}
                    </div>
                  </div>
                );
            })}
          </div>
          <div className="relative">
            <Textarea
              placeholder="Enter your message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(beVietnamPro.className, 'font-sans')}
              rows={1}
            />
            <Send onClick={onSendClick} className="absolute top-2 right-2 cursor-pointer" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
}
