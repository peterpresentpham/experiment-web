import { AppArticle } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import ProgramBox from 'src/components/Thesis/ProgramBox';
import RefLink from 'src/components/Thesis/RefLink';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';
import { guardianCircuitCode } from '../code';

export default function Circuit() {
  return (
    <SubsectionBox id="circuit-implementation" title="Circuit Implementation">
      <AppArticle isFirst>
        We use circomlib <RefLink toId="circomlib" mode="cite" />, a library that provides a
        collection of cryptographic circuits and helper functions specifically designed for use with
        zk-SNARKs and zk-STARKs, as a tool to build our circuit.
      </AppArticle>
      <AppArticle>
        {
          'The circuit has four inputs: msg, A, R8, and S, representing the fixed-size message, the public key, and the $R$ and $S$ components of the EdDSA signature, respectively. It produces three outputs: hashPublicKey, increment, and address. These correspond to the hashed guardian account address, the increment value, and the new owner address extracted from the 256-bit message signed by the guardian.'
        }
      </AppArticle>
      <AppArticle>
        {
          'To implement the signature verification and hash computation, we use EdDSAVerifier and Poseidon provided by circomlib, as illustrated in '
        }
        <RefLink toId="common-structure-of-guardian-circuit" mode="program" />.
      </AppArticle>
      <ProgramBox
        id="common-structure-of-guardian-circuit"
        title="The common structure of guardian circuit"
        code={{ language: 'solidity', code: guardianCircuitCode }}
      />
      <AppArticle isFirst>
        To compile and integrate the circuit with a smart contract, we use circom and snarkjs{' '}
        <RefLink toId="snarkjs" mode="cite" />. First, the circuit is compiled into a WebAssembly
        file (.wasm) and a constraint file (.r1cs). The witness-calculator program uses secret data,
        containing the input file and WebAssembly, to generate a witness. The snarkjs tool compiles
        the constraints and witnesses to a Solidity file, enabling smart contracts to validate ZKPs
        (as illustrated in <RefLink toId="architecture-circom-and-snarkjs" />
        ). The compilation and integration process are discussed in more detail in{' '}
        <RefLink toId="circom" mode="section" />.
      </AppArticle>
      <FigureBox
        id="architecture-circom-and-snarkjs"
        title="Architecture for generating and verifying proof using Circom and snarkjs."
        alt="architecture-circom-and-snarkjs"
        src={IMAGES.master.chapter5.zksnarkCompiler}
      />
    </SubsectionBox>
  );
}
