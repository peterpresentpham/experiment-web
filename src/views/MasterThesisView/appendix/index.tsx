import SameChapterBox from 'src/components/Thesis/SameChapterBox';
import ArithmeticCircuitDesign from './AppendixA/ArithmeticCircuitDesign';
import RecoverySolution from './AppendixB/recovery-solution';

export default function Appendix() {
  return (
    <SameChapterBox id="appendix" mode="appendix">
      <ArithmeticCircuitDesign />
      <RecoverySolution />
    </SameChapterBox>
  );
}
