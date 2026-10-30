import { AppArticle } from 'src/components/box/ArticleBox';
import AppendixBox from 'src/components/Thesis/AppendixBox';
import ArithmeticCircuit from './ArithmeticCircuit';
import Circom from './circom';

export default function ArithmeticCircuitDesign() {
  return (
    <AppendixBox
      id="the-arithmetic-circuit"
      title="Arithmetic Circuit Design and Implementation in Circom"
    >
      <AppArticle isFirst>
        {
          'This appendix provides an overview of Circom. It also explains the specific circuits used in the thesis.'
        }
      </AppArticle>
      <Circom />
      <ArithmeticCircuit />
    </AppendixBox>
  );
}
