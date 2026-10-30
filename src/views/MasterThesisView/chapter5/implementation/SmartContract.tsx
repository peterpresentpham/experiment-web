/* eslint-disable quotes */
import { AppArticle } from 'src/components/box/ArticleBox';
import { Table, TableBody, TableCell, TableRow } from 'src/components/shadcn/table';
import AlgorithmBox from 'src/components/Thesis/AlgorithmBox';
import ProgramBox from 'src/components/Thesis/ProgramBox';
import RefLink from 'src/components/Thesis/RefLink';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';
import TableBox from 'src/components/Thesis/TableBox';
import { accountCode, accountFactoryCode, getAddressCode, zkContractCode } from '../code';

export default function SmartContract() {
  return (
    <SubsectionBox title="Smart Contract Implementation" id="smart-contract-implementation">
      <AppArticle isFirst>
        Our smart contract system is based on the Eth infinitism account abstraction architecture{' '}
        <RefLink toId="eth-infinitism-account-abstraction" mode="cite" />. While the original
        architecture focuses on account abstraction, we extend it by introducing a
        zero-knowledge-based recovery mechanism.
      </AppArticle>
      <AppArticle>
        {
          'Specifically, we modify the architecture in several elements. First, we implement a key-value store to map each owner address to its corresponding account address. Additionally, we override the original getAddress function to return the exact account address, instead of relying on the deterministic address returned by CREATE2 (as shown in '
        }
        <RefLink toId="modified-account-factory" mode="program" />
        ).
      </AppArticle>
      <ProgramBox
        id="modified-account-factory"
        title="The modified interface of AccountFactory"
        code={{ language: 'solidity', code: accountFactoryCode }}
      />
      <AlgorithmBox id="getAddress" title="getAddress function" algorithm={getAddressCode} />
      <AppArticle isFirst>
        {'The getAddress function ('}
        <RefLink toId="getAddress" mode="algorithm" />
        {
          ") currently gets the account address by CREATE2 unless its owner address is not in mapping owners. Moreover, we create changeOwner function, this function will modify a mapping in owners when it is called by the guardian's smart contract."
        }
      </AppArticle>
      <AppArticle>
        {
          'Furthermore, we enhance the Account smart contract so it can deploy its associated Guardian contract. In practical applications, deploying a guardian contract requires an external deployer. It is a reasonable and secure design choice to allow the account itself to act as this deployer. The structure of Account smart contract is illustrated in '
        }
        <RefLink toId="account-contract-core" mode="program" />
      </AppArticle>
      <ProgramBox
        id="account-contract-core"
        title="The Account smart contract core"
        code={{ language: 'solidity', code: accountCode }}
      />
      <ProgramBox
        id="zk-guardian-core"
        title="The ZKGuardian smart contract core"
        code={{ language: 'solidity', code: zkContractCode }}
      />
      <AppArticle isFirst>
        The ZKGuardian smart contract (as shown in{' '}
        <RefLink toId="zk-guardian-core" mode="program" />) provides the core logic for the recovery
        process. Its interface includes functions for submitting and confirming a new owner address
        via a zk-SNARK proof, as well as for managing the guardian set. The verification of proofs
        uses public signals to ensure that only valid, authorized requests are accepted. The
        contract supports guardian setup, threshold configuration, and dynamic management of the
        guardian list.
      </AppArticle>
      <AppArticle>
        All contracts are implemented in Solidity and deployed on the Binance Smart Chain Testnet.{' '}
        <RefLink toId="deploy-contact" mode="table" /> illustrates the deployed contract addresses
        used in our implementation.
      </AppArticle>
      <TableBox id="deploy-contact" title="Deployed contracts' address on BSC Testnet">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>EntryPoint</TableCell>
              <TableCell>0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>AccountFactory</TableCell>
              <TableCell>0x6320A83b3Ad58a58AfDC898320914EB282100AD6</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableBox>
    </SubsectionBox>
  );
}
