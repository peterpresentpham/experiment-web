import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import ProgramBox from 'src/components/Thesis/ProgramBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';
import { xorCode } from '../code';

export default function Circom() {
  return (
    <SectionBox id="circom" title="Circom">
      <AppArticle isFirst>
        {
          'Circom (short for Circuit Compiler) is a high-level language and compiler used to write arithmetic circuits for ZKPs, especially zk-SNARKs. Circom is maintained by iden3 and widely used in projects like Semaphore, zk-rollups, ZK Identity, and private voting systems. Circom allows for defining circuits, compiling those circuits into R1CS, and creating a smart contract. Circom includes several key features.'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">signal</span>
          {
            ': Signals carry a value during computation. Signals are divided into two types: public signals and private signals. Private signals are values that the prover knows and wants to keep hidden from the verifier. Public signals or public inputs/outputs are known to both provers and verifiers.'
          }
        </ArticleLI>
        <ArticleLI isMath>
          <span className="italic">constraint</span>
          {
            ': A constraint in Circom defines a mathematical relationship between signals that must be satisfied for the proof to be valid. Constraints can be divided into two types: linear constraints and non-linear constraints. Linear constraints represent additions, subtractions, and scalar multiplications. For instance, the constraint $G = 4x_1 = x_1 + x_1 + x_1 + x_1$ written as the multiplication of variables by constants must be a linear constraint. Non-linear constraints represent multiplication gates, which allow a multiplication between two linear constraints.'
          }
        </ArticleLI>
      </ArticleUL>
      <ProgramBox
        id="example-circuit-implemented-circom"
        title="$f = x + y - 2xy$ circuit implemented through Circom"
        code={{ language: 'solidity', code: xorCode }}
      />
      <AppArticle isFirst isMath>
        <RefLink toId="example-circuit-implemented-circom" mode="program" />
        {
          ' illustrates the circuit for the computation $f = x + y - 2xy$ implemented in Circom. The circuit includes two private input signals: $x$ and $y$, and an output signal $t_4$. Moreover, the circuit has four constraints, including'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI isMath>
          {
            'Three linear constraints, corresponding to three intermediate signals: $t_1 = x + y$ and $t_4 = t_1 + t_3$ (addition constraints) and $t_3 = -2t_2$ (scale multiplication constraint).'
          }
        </ArticleLI>
        <ArticleLI isMath>
          {'One non-linear constraint, corresponding to the intermediate signal $t_2 = xy$.'}
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        To serve the on-chain verification, Circom can compile Circom circuit into Solidity smart
        contract. The process has four steps (as illustrated in{' '}
        <RefLink toId="the-process-of-circom-compiling-smart-contract" />
        ): (1) Compiling circuit, (2) computing witness, (3) proving a Trusted Setup, and (4)
        exporting verifier smart contract.
      </AppArticle>
      <FigureBox
        id="the-process-of-circom-compiling-smart-contract"
        alt="the-process-of-circom-compiling-smart-contract"
        title="The process of compiling a Circom circuit to a smart contract"
        src={IMAGES.master.appendix.circomCompiler}
      />
      <AppArticle isFirst>
        {
          'First, the Circom compiler translates the high-level circuit definition into several low-level representations required for the following steps, including two important entities:'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">R1CS</span>
          {': Encodes the circuit as a set of rank-1 quadratic constraints over a finite field.'}
        </ArticleLI>
        <ArticleLI>
          <span className="italic">WebAssembly</span>: A program used to generate witnesses.
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'Second, Circom tool uses WebAssembly to calculate a witness. The process requires the inputs, and WebAssembly generated in the first step will calculate all the intermediate signals and output signals. The group of signals (inputs, outputs, and intermediate signals) is called a witness.'
        }
      </AppArticle>
      <AppArticle isMath>
        {
          'In the case $f = x + y - 2xy$, with inputs are $(x, y) = (1, 2)$, the witness could be: $(x, y, t_1, t_2, t_3, t_4) = (1, 2, 3, 2, -4, -1)$.'
        }
      </AppArticle>
      <AppArticle>
        {
          'For zk-SNARKs, a trusted setup is required to generate proving and verification keys. This process includes converting the circuit to a QAP internally and producing keys for proof generation and verification. In more detail, the trusted setup contains two parts:'
        }
      </AppArticle>
      <ArticleUL>
        <ArticleLI>
          <span className="italic">The Powers of Tau</span>, which is independent of the circuit.
          <span className="italic">Phase 2</span>, which depends on the circuit.
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'The final step is to generate a Solidity smart contract from the verification key. This contract includes the cryptographic logic required to validate proofs on-chain.'
        }
      </AppArticle>
    </SectionBox>
  );
}
