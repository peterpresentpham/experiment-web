import { Metadata } from 'next';
import { generateAppMetadata } from 'src/services';
import PikachuView from 'src/views/PikachuView';

export const metadata: Metadata = generateAppMetadata(
  'Pikachu',
  'Match pairs of tiles across a board that shifts as you clear it.'
);

export default function Pikachu() {
  return <PikachuView />;
}
