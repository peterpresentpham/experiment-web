import SectionBox from 'src/components/Thesis/SectionBox';
import SmartContract from './SmartContract';
import Bundler from './bundler';
import Circuit from './circuit';

export default function Implementation() {
  return (
    <SectionBox id="implementation" title="Implementation">
      <Circuit />
      <SmartContract />
      <Bundler />
    </SectionBox>
  );
}
