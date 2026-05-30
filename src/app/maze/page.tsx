import { Metadata } from 'next';
import MazeView from 'src/views/MazeView';

export const metadata: Metadata = {
  title: 'Maze Generator',
  description: 'Generate and solve mazes with custom start and end points',
};

export default function MazePage() {
  return <MazeView />;
}
