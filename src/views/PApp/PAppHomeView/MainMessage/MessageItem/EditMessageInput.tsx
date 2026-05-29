import { Textarea } from 'src/components/shadcn/textarea';

interface TProps {
  editedMessage: string;
  setEditedMessage: (value: string) => void;
}

export default function EditMessageInput({ editedMessage, setEditedMessage }: TProps) {
  return (
    <Textarea value={editedMessage} onChange={(event) => setEditedMessage(event.target.value)} />
  );
}
