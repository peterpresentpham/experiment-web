import { Metadata } from 'next';
import { generateAppMetadata } from 'src/services';
import CaroView from 'src/views/CaroView';

export const metadata: Metadata = generateAppMetadata(
  'Caro',
  'Caro (five-in-a-row) with offline, online peer-to-peer and blind modes.'
);

export default function Caro() {
  return <CaroView />;
}
