import { Metadata } from 'next';
import { generateAppMetadata } from 'src/services';
import AlgorithmView from 'src/views/AlgorithmView';

export const metadata: Metadata = generateAppMetadata('Algorithm');

export default function Algorithm() {
  return <AlgorithmView />;
}
