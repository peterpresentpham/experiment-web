import { Metadata } from 'next';
import { sudokuMessages } from 'src/i18n/messages/sudoku';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import SudokuView from 'src/views/SudokuView';

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMessages(sudokuMessages);
  return generateAppMetadata(meta.title, meta.description);
}

export default function Sudoku() {
  return <SudokuView />;
}
