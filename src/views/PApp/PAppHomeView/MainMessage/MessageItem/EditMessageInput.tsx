import { useState } from 'react';
import { Textarea } from 'src/components/shadcn/textarea';

interface TProps {
  message: string;
}

export default function EditMessageInput({ message }: TProps) {
  const [editedMessage, setEditedMessage] = useState(message);

  return (
    <Textarea value={editedMessage} onChange={(event) => setEditedMessage(event.target.value)} />
  );
}
