import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';
import Bundler from './Bundler';
import EntryPoint from './EntryPoint';
import UserOperation from './UserOperation';

export default function Erc4337() {
  return (
    <SectionBox id="erc4337" title="ERC-4337">
      <AppArticle isFirst>
        {
          'This section provides an overview of ERC in common and ERC-4337 in practice. The section outlines the key components, including the UserOperation structure, the account contract, the EntryPoint contract, and the bundler.'
        }
      </AppArticle>
      <AppArticle>
        {
          'In the Ethereum ecosystem, ERC stands for Ethereum Request for Comments. It is a technical standard used to define rules, protocols, and application-level interfaces for smart contracts and dApps deployed on the Ethereum blockchain. These standards are proposed and maintained through the Ethereum Improvement Proposal (EIP) process, and are driven by the community to evolve the Ethereum protocol and its ecosystem. Each ERC is assigned a unique number. Some of the most widely adopted ERCs include:'
        }
      </AppArticle>
      <ArticleUL>
        <ArticleLI>
          <span className="italic">ERC-20</span>: A standard interface for fungible tokens, widely
          used in DeFi applications.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">ERC-721</span>: The standard for non-fungible tokens (NFTs),
          enabling unique digital asset representation.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">ERC-1155</span>: A multi-token standard supporting both fungible
          and non-fungible assets in a single contract.
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        ERC-4337 <RefLink mode="cite" toId="eip4337" />{' '}
        {
          'is a token standard that supports account abstraction without changing the Ethereum consensus. Traditional proposals for account abstraction required adding new transaction types at the protocol level, for example, modifying how nodes handle accounts or signatures. ERC-4337 avoids this by defining a new object called a UserOperation, which is not a native Ethereum transaction, but a data structure handled by smart contracts and off-chain components.'
        }
      </AppArticle>
      <FigureBox
        id="erc-4337"
        alt="erc-4337"
        src={IMAGES.master.chapter3.erc4337}
        title="The architecture of ERC-4337"
      />
      <AppArticle isFirst>
        <RefLink toId="erc-4337" />{' '}
        {
          'illustrates the typical architecture of ERC-4337. Instead of submitting native transactions to the blockchain, users submit UserOperation objects to a mempool, which stands for memory pool, acting as a temporary storage for unspent UserOperations. The objects in the mempool are selected by a bundler and are aggregated into a single bundled transaction. This bundled transaction is then sent to a global smart contract known as the EntryPoint} contract, which processes and executes each UserOperation on the blockchain.'
        }
      </AppArticle>
      <AppArticle isMath>
        {
          'ERC-4337 uses a smart contract system for many purposes, such as account management, UserOperation validation and execution, and fee management. There are several standard smart contracts in ERC-4337: Account contract, AccountFactory contract, EntryPoint contract, and Paymaster contract.'
        }
      </AppArticle>
      <FigureBox
        id="erc4337-smart-contract"
        alt="erc4337-smart-contract"
        src={IMAGES.master.chapter3.erc4337Contract}
        title="ERC-4337 smart contract system"
      />
      <AppArticle isFirst>
        <RefLink toId="erc4337-smart-contract" />{' '}
        {
          'illustrates a standard ERC-4337 smart contract system, involving EntryPoint smart contract, user contract account, typically including AccountFactory contract for account management, and Paymaster contract or Aggregator contract as options. The Paymaster contract acts as a third party that sponsors gas fees for users. The Aggregator} contract implements multi-signature schemes, signature aggregation into account abstraction. In addition, because of the flexible property, the system can install extended smart contracts to enable functionalities that are required by developers and users.'
        }
      </AppArticle>
      <UserOperation />
      <EntryPoint />
      <Bundler />
    </SectionBox>
  );
}
