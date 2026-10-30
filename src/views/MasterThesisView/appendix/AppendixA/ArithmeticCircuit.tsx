import { AppArticle } from 'src/components/box/ArticleBox';
import ProgramBox from 'src/components/Thesis/ProgramBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import { analyticMessageCode, guardianCode } from '../code';

export default function ArithmeticCircuit() {
  return (
    <SectionBox id="Arithmetic circuit in the Thesis" title="arithmetic-circuit-in-the-thesis">
      <ProgramBox
        id="structure-of-main-arithmetic-circuit"
        title="Structure of main arithmetic circuit"
        code={{ language: 'solidity', code: guardianCode }}
      />
      <AppArticle isFirst>
        <RefLink toId="structure-of-main-arithmetic-circuit" mode="program" /> implements the
        guardian-based verification mechanism using EdDSA over BabyJubJub and Poseidon hash. Its
        main purpose is to allow a guardian to prove authorization by submitting a valid signature
        over a message, without leaking private keys.
      </AppArticle>
      <ProgramBox
        id="calculation-increment-and-address-circuit"
        title="Calculation increment and new owner address circuir"
        code={{ language: 'solidity', code: analyticMessageCode }}
      />
      <AppArticle isFirst>
        <RefLink toId="calculation-increment-and-address-circuit" mode="program" /> is used to
        extract the increment parameter and the new owner address from the signature. The circuit
        reconstructs both values by combining 8-bit segments extracted from the signature.
      </AppArticle>
    </SectionBox>
  );
}
