/* eslint-disable quotes */
import { AppArticle } from 'src/components/box/ArticleBox';
import { Table, TableBody, TableCell, TableRow } from 'src/components/shadcn/table';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';
import TableBox from 'src/components/Thesis/TableBox';
import { IMAGES } from 'src/configs/images';
import { curveSignatureTable, hashFunctionTable } from './code';

export default function Choosing() {
  return (
    <SubsectionBox
      id="choosing-hash-function-and-curve-signature"
      title="Choosing hash function and curve signature algorithm"
    >
      <AppArticle isFirst>
        {
          'ZK circuits are fundamentally built on addition and multiplication operations over finite fields, so it has many steps that depend on arithmetic computations. Therefore, the proposed hash function must simplify circuit construction, minimizing the number of constraints and the amount of computation burden in R1CS and QAP, as well as during the proof generation and verification processes.'
        }
      </AppArticle>
      <AppArticle isMath>
        {
          'For instance, consider the XOR ($\\oplus$) operation on two bits $a$ and $b$. The result is 0 if the bits are equal and 1 otherwise. This logic can be expressed as: $f = x \\oplus y = x + y - 2xy$'
        }
      </AppArticle>
      <FigureBox
        title="XOR circuit."
        id="xor-circuit"
        alt="xor-circuit"
        src={IMAGES.master.chapter4.xorCircuit}
      />
      <AppArticle isFirst isMath>
        <RefLink toId="xor-circuit" />
        {
          ' illustrates the arithmetic circuit for the computation $f = x + y - 2xy$. The arithmetic circuit has four constraints, corresponding to four intermediate or final outputs: $T_1 = x + y$, $T_2 = x * y$, $T_3 = -2 * T_2$ and $T_4 = T_1 + T_3$, two inputs: $x$ and $y$, and one final output: $T_4$. Each constraint adds to the complexity of the circuit, making it more expensive to compute in R1CS and QAP.'
        }
      </AppArticle>
      <AppArticle>
        {'To measure circuit efficiency, we used the snarkjs library '}
        <RefLink toId="snarkjs" mode="cite" />
        {
          ' to calculate the number of non-linear constraints, linear constraints, wires, labels, witness size, and constraint size. We also measured the time taken to generate and verify the proof.'
        }
      </AppArticle>
      <AppArticle>
        We evaluate several hash functions: SHA256, Keccak256, pedersen, poseidon{' '}
        <RefLink toId="poseidon-hash-function" mode="cite" />, and poseidon2. We use the
        implementations of circomlib <RefLink toId="circomlib" mode="cite" /> for SHA256, poseidon
        and pedersen, and hash-circuits <RefLink toId="keccak256-circom" mode="cite" /> for
        Keccak256 and poseidon2. All code is available in our open-source repository{' '}
        <RefLink toId="my-aa-contract" mode="cite" />.{' '}
        <RefLink toId="hash-function-constraints" mode="table" /> shows the result.
      </AppArticle>
      <TableBox id="hash-function-constraints" title="Information of some hash function's circuits">
        <Table>
          <TableBody>
            {hashFunctionTable.map((data) => {
              return (
                <TableRow key={data[0]}>
                  <TableCell>
                    <p className="font-bold">{data[0]}</p>
                  </TableCell>
                  <TableCell>{data[1]}</TableCell>
                  <TableCell>{data[2]}</TableCell>
                  <TableCell>{data[3]}</TableCell>
                  <TableCell>{data[4]}</TableCell>
                  <TableCell>{data[5]}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableBox>
      <AppArticle isFirst>
        {
          'SHA256 and Keccak256, which are built on bitwise logic, require a significantly larger number of constraints, especially non-linear constraints, to be represented in a ZK circuit. In contrast, Pedersen, Poseidon, and Poseidon2 are designed with finite field arithmetic in mind and only require hundreds of constraints, leading to significantly better performance.'
        }
      </AppArticle>
      <AppArticle>
        {
          "A suitable hash function for ZK circuits should rely as much as possible on arithmetic operations (addition and multiplication), avoiding bitwise and modular operations. This reduces the circuit's complexity and improves the performance of R1CS and QAP, directly impacting proof generation and verification times."
        }
      </AppArticle>
      <AppArticle>
        {
          'Similarly, choosing a curve signature algorithm must follow the same rule: minimizing bitwise and modular operations and ensuring compatibility with field arithmetic. However, the choice of curve can also depend on system-specific requirements. For instance, if guardians are required to use ECDSA for other parts of the system, it may be suitable despite its inefficiency in ZK circuits.'
        }
      </AppArticle>
      <TableBox id="curve-constraints" title="Information of ECDSA and EdDSA circuit">
        <Table>
          <TableBody>
            {curveSignatureTable.map((data) => {
              return (
                <TableRow key={data[0]}>
                  <TableCell>
                    <p className="font-bold">{data[0]}</p>
                  </TableCell>
                  <TableCell>{data[1]}</TableCell>
                  <TableCell>{data[2]}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableBox>
      <AppArticle isFirst>
        <RefLink toId="curve-constraints" mode="table" />
        {
          ' compares the performance of ECDSA and BabyJubJub (EdDSA). ECDSA requires over a million constraints, and proof generation time is over 44 seconds, while EdDSA needs only tens of thousands of constraints and about 2 seconds to generate a proof. Unless there are specific requirements for ECDSA, EdDSA is a more efficient choice.'
        }
      </AppArticle>
      <AppArticle>
        {
          'Based on the evaluation and the efficient design for the ZK protocol, we selected Poseidon as the hash function and BabyJubJub as the curve signature algorithm for our implementation.'
        }
      </AppArticle>
    </SubsectionBox>
  );
}
