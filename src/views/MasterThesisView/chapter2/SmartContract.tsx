/* eslint-disable react/no-unescaped-entities */
/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';

export default function SmartContract() {
  return (
    <SectionBox id="smart-contract" title="Smart contract">
      <AppArticle isFirst>
        {
          'This section introduces smart contracts, covering their historical origins, architectural structure, core characteristics, and execution environment. It also explores the wide range of smart contract applications, with a specific focus on smart contract wallets and their integration with account abstraction.'
        }
      </AppArticle>
      <AppArticle>
        A smart contract is a decentralized, trustless, self-executing program stored on a
        blockchain that automatically executes the shared code when predefined conditions are met.
        The concept was first proposed by Nick Szabo in 1997{' '}
        <RefLink mode="cite" toId="smart-contract" />, who considers smart contracts as digital
        protocols that execute agreements with minimal trust. Szabo's idea leveraged cryptographic
        techniques to ensure security and automation, but lacked a practical implementation platform
        at the time.
      </AppArticle>
      <AppArticle>
        Smart contracts came with Ethereum's launch in 2015, introduced by Vitalik Buterin{' '}
        <RefLink mode="cite" toId="ethereum-whitepaper" />. Ethereum introduced the Ethereum Virtual
        Machine (EVM), a Turing-complete environment that allows developers to deploy and execute
        arbitrary logic on-chain or smart contracts. Since then, other platforms such as Cardano,
        Solana, and Binance Smart Chain have installed smart contracts. Fundamentally, a smart
        contract consists of three core components:
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">Code</span>:{' '}
          {
            "The smart contract's bytecode, written in languages like Solidity, compiled into EVM. The code defines the contract’s logic, such as executing a token swap or updating a voting record."
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Storage</span>:{' '}
          {
            'Persistent data stored on the blockchain as a key-value mapping, retaining state information. Storage is costly due to gas fees, incentivizing efficient design.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Balance</span>: {'The cryptocurrency held by the contract'}
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'In Ethereum, EVM is the runtime environment for smart contracts. The EVM is a Turing-complete virtual machine, which means that EVM can solve any problems with a necessary time, energy, and instructions. One of the key features of the EVM is its determinism, which is that the same input always results in the same output. Additionally, the EVM is designed to be isolated from the host system, meaning that smart contracts run in a sandboxed environment, isolated from the host machine.'
        }
      </AppArticle>
      <FigureBox
        id="smart-contract-structure"
        title="Structure of Smart contract"
        alt="smart-contract-structure"
        src={IMAGES.master.chapter2.smartContract}
      />
      <AppArticle isFirst>
        The structure and operating mechanism of smart contracts are illustrated in{' '}
        <RefLink toId="smart-contract-structure" />. A smart contract is written in a high-level
        programming language; in the scope of this thesis, it is Solidity. The source code is then
        compiled into EVM bytecode, a low-level binary representation that the EVM can interpret and
        execute. This bytecode is sent to the blockchain based on a deployment transaction to
        blockchain. After being verified and included in a block, the contract is officially
        deployed and then is assigned a unique address. From that point, users and other contracts
        can trigger functions within the contract by sending transactions to its address, executing
        the smart contract logic, and changing its storage.
      </AppArticle>
      <AppArticle>
        {
          "When a user or another contract initiates a transaction directed to a deployed smart contract's address, the EVM retrieves the bytecode of the target smart contract from the blockchain state. The bytecode is then interpreted as instructions or opcodes such as ADD, MUL, JUMP, CALL, SSTORE, RETURN. As a stack-based virtual machine, the EVM executes these operations using a last-in, first-out (LIFO) stack structure, where instructions are pushed to and popped from the stack during computation. If the execution completes successfully, the contract's persistent storage may be updated, and the global blockchain state is modified accordingly to reflect token transfers, state variable changes, or other effects resulting from the contract's logic."
        }
      </AppArticle>
      <AppArticle>
        {
          "A smart contract has three primary characteristics: automation, immutability, and transparency. Automation means that once deployed, smart contracts execute autonomously when a predefined condition is met. Immutability is that the contract's code can not be changed after deployed. Transparency means that the code and state are publicly visible on the blockchain (in public networks), allowing anyone to verify functionality."
        }
      </AppArticle>
      <AppArticle>
        {
          'Smart contracts are the backbone of modern blockchain ecosystems, enabling trustless and automated solutions. Their utility expands to a wide range of domains, including DeFi, NFTs, and DAOs. More recently, the implementation of account abstraction mechanisms, such as ERC-4337, uses smart contracts to improve user experience, security, and programmability in blockchain systems.'
        }
      </AppArticle>
      <AppArticle>
        {
          'In DeFi, smart contracts automate financial services like lending, borrowing, trading, and yield farming. Protocols such as Uniswap implement smart contracts to automate market makers, allowing users to swap tokens directly without relying on centralized exchanges.'
        }
      </AppArticle>
      <AppArticle>
        {
          'In NFTs, smart contracts define token standards such as ERC-721, ERC-1155, enabling the creation, ownership, and transfer of unique digital assets. Smart contracts manage metadata and access rights in NFT-based marketplaces and gaming ecosystems.'
        }
      </AppArticle>
      <AppArticle>
        {
          'DAOs are managed entirely by smart contracts, which automate proposal voting, treasury management, and execution of governance decisions. For instance, MakerDAO relies on smart contracts to manage the DAI token and adjust parameters without centralized control.'
        }
      </AppArticle>
      <AppArticle>
        {
          'In the scope of the thesis, smart contracts play a central role in implementing the recovery account abstraction wallet, enhancing traditional EOA by offering programmable features. Unlike EOAs, smart contracts can execute and implement custom logic.'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">Custom verification</span>:{' '}
          {
            'Smart contracts can replace the standard EOA verification mechanism with custom verification logic. For example, smart contract wallets can use multi-signature or biometric authentication to reduce key loss risks.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Social recovery</span>:{' '}
          {
            'Smart contract wallets can enable social recovery. Fundamentally, users can designate trusted guardians (friends, devices, or entities) to recover accounts.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Zero-knowledge proofs integration</span>:{' '}
          {'Smart contract allows the implementation of ZKP to enhance privacy for the system.'}
        </ArticleLI>
      </ArticleUL>
    </SectionBox>
  );
}
