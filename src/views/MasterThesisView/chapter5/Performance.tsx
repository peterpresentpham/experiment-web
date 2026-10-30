import { AppArticle } from 'src/components/box/ArticleBox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/shadcn/table';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import TableBox from 'src/components/Thesis/TableBox';
import { circuitStats, transactionLocalStats, transactionTestnetStats } from './code';

export default function Performance() {
  return (
    <SectionBox title="Performance Evaluation" id="performance-evaluation">
      <AppArticle isFirst>
        {
          'To evaluate the efficiency of our proposed system, we conduct the experiences to measure the gas cost for some critical transactions performed in the system, involving the first transaction with deploying account, the transaction for deploying guardian contract and verification proof, as well as the time taken for generating proofs, number of constraints and proof size. Experiments were carried out on a local machine, a MacBook M1 Pro with 16GB of memory and 8 cores. The results regarding the number of constraints in the circuit, the witness size, the constraint size, and the average time taken to generate and verify the proof are shown in '
        }
        <RefLink toId="evaluation-of-the-compilation" mode="table" />
      </AppArticle>
      <TableBox
        id="evaluation-of-the-compilation"
        title="Information about the proposed main circuit"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {circuitStats.map((item) => {
              return (
                <TableRow key={item.field}>
                  <TableCell>{item.field}</TableCell>
                  <TableCell>{item.result}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableBox>
      <AppArticle isFirst isMath>
        We used the simple transfer ETH transaction as the first transaction to measure the gas cost
        of deploying an account. We evaluated the gas cost in two environments, the local network
        created by hardhat library and Binance Smart Chain testnet.{' '}
        <RefLink toId="gas-cost-local" mode="table" /> and{' '}
        <RefLink toId="gas-cost-bsc" mode="table" /> list results for each environment. The average
        gas price in BSC is 3 gwei (3 * $10^{-9}$ BNB), with a BNB price is 651.41 USD; these
        measurements were as of December 3, 2024.
      </AppArticle>
      <TableBox id="gas-cost-local" title="Gas cost on local network">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Gas used (unit of gas)</TableHead>
              <TableHead>Average cost (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionLocalStats.map((item, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>{item.transaction}</TableCell>
                  <TableCell>{item.gasUsed}</TableCell>
                  <TableCell>{item.averageCostUSD}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableBox>
      <TableBox id="gas-cost-bsc" title="Gas cost on BSC testnet">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Gas used (unit of gas)</TableHead>
              <TableHead>Average cost (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionTestnetStats.map((item, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>{item.transaction}</TableCell>
                  <TableCell>{item.gasUsed}</TableCell>
                  <TableCell>{item.averageCostUSD}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableBox>
      <AppArticle isFirst>
        {
          'In conclusion, we presented the implementation process of the system, which includes building a zk-SNARK circuit, deploying smart contracts, and setting up a bundler. The experiments were conducted using realistic inputs and were successfully verified on-chain, demonstrating that the zero-knowledge proof verification process is feasible and meets security requirements without revealing sensitive information. Both the proof generation time and verification time are within acceptable limits for practical deployment in blockchain environments.'
        }
      </AppArticle>
    </SectionBox>
  );
}
