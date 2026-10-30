import AbbreviationBox, { TAbbreviationType } from 'src/components/Thesis/AbbreviationBox';
import { TDivProps } from 'src/types/global';

const data: Array<TAbbreviationType> = [
  { short: 'CAs', full: 'Contract accounts' },
  { short: 'dApps', full: 'Decentralized applications' },
  { short: 'ECDSA', full: 'Elliptic Curve Digital Signature Algorithm' },
  { short: 'EdDSA', full: 'Edwards-curve Digital Signature Algorithm' },
  { short: 'EOAs', full: 'Externally Owned Accounts' },
  { short: 'EVM', full: 'Ethereum Virtual Machine' },
  { short: 'HH', full: 'Homomorphic hiding' },
  { short: 'MPC', full: 'Multi-Party Computation' },
  { short: 'PoS', full: 'Proof of stake' },
  { short: 'PoW', full: 'Proof of work' },
  { short: 'QAP', full: 'Quadratic arithmetic program' },
  { short: 'R1CS', full: 'Rank 1 Constraint System' },
  { short: 'RPC', full: 'Remote Procedure Call' },
  { short: 'UserOp', full: 'User Operation' },
  { short: 'ZKPs', full: 'Zero knowledge proofs' },
  { short: 'zk-SNARK', full: 'Zero-Knowledge Succinct Non-Interactive Argument of Knowledge' },
];

export default function Abbreviation(props: TDivProps) {
  return <AbbreviationBox data={data} {...props} />;
}
