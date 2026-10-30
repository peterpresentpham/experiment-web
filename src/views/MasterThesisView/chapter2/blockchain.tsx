/* eslint-disable react/no-unescaped-entities */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';

export default function Blockchain() {
  return (
    <SectionBox id="blockchain" title="Blockchain">
      <AppArticle isFirst>
        This section introduces blockchain technology, providing an overview of its historical
        origins, fundamental components, defining characteristics, and consensus mechanisms. It
        establishes the foundation for understanding blockchain's architecture, evolution, and
        transformative potential across applications.
      </AppArticle>
      <AppArticle>
        The concept of blockchain was introduced in 1991 by Stuart Haber and W. Scott Stornetta, who
        proposed a cryptographically secured chain of timestamped records to prevent tampering or
        misdating of digital documents <RefLink toId="haber1991" mode="cite" />. Their design used
        cryptographic hashing to link data blocks, forming a tamper-evident ledger.
      </AppArticle>
      <AppArticle>
        In 2008, Satoshi Nakamoto published the Bitcoin whitepaper{' '}
        <RefLink toId="bitcoin" mode="cite" />, presenting the first practical blockchain
        implementation. Bitcoin, launched in 2009, solved the double-spending problem in digital
        currencies through decentralized consensus, eliminating trusted intermediaries. Since then,
        the technology has evolved significantly. For example, the introduction of Ethereum in 2015
        extended blockchain's capabilities with smart contracts, enabling decentralized applications
        (dApps). Today, platforms like Cardano and Solana continue to advance blockchain
        functionality.
      </AppArticle>
      <AppArticle>
        At its core, a blockchain is a distributed ledger consisting of a sequence of
        cryptographically linked blocks, each containing validated transactions, maintained across a
        peer-to-peer network of nodes. Key components include blocks, transactions, Merkle Trees,
        and cryptographic hashing. Blockchain relies on cryptographic digital signatures, hash
        functions, and consensus protocols to ensure security and authenticity. Blockchain's
        defining characteristics are:
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">Decentralization</span>: Data is replicated across nodes,
          eliminating single points of failure and central control.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Immutability</span>: Once recorded, data cannot be altered
          without network consensus, ensuring tamper resistance.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Security</span>: Cryptographic mechanisms protect against
          unauthorized access.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Transparency</span>: Public blockchains allow open access to
          transaction data, fostering trust.
        </ArticleLI>
      </ArticleUL>
      <FigureBox
        id="blockchain-structure"
        src={IMAGES.master.chapter2.structure}
        alt="blockchain-structure"
        title="Blockchain structure"
      />
      <AppArticle isFirst>
        <RefLink toId="blockchain-structure" /> illustrates the blockchain structure{' '}
        <RefLink toId="a-survey-of-blockchain" mode="cite" />, which is composed of a sequence of
        blocks. Block serves as the fundamental unit of data storage and structure. Blocks are
        connected to each other through the reference that contains the previous block hash. The
        first block is called the genesis block, which does not have any previous block. Depending
        on the type and design of the blockchain, additional parameters may be present in a block.
        However, a typical block consists of two primary components: the block header and the block
        body. The block header contains important metadata that identifies the block, such as the
        previous block hash, timestamp, nonce, and Merkle tree root hash, while the block body
        includes a set of transactions, which are seen as the permanent records on the blockchain.
      </AppArticle>
      <AppArticle>
        A transaction in blockchain is a digitally signed instruction, which is performed by a
        particular (usually an account), to change the blockchain's state. In a blockchain network
        like Bitcoin, a transaction represents the transfer of cryptocurrency from one address to
        another. In programmable blockchains such as Ethereum, transactions can interact with smart
        contracts, enabling complex operations beyond simple value transfers. In terms of
        blockchain, transactions can be divided into two common models: unspent transaction output
        (UTXO) model and account model.
      </AppArticle>
      <FigureBox
        id="utxo-model"
        src={IMAGES.master.chapter2.unspentTransaction}
        alt="utxo-model"
        title="UTXO model"
      />
      <AppArticle isFirst>
        In the UTXO model (<RefLink toId="utxo-model" />
        ), each transaction has a list of outputs that will be spent as inputs in future
        transactions. The outputs are assigned to the addresses that will spend them. The total of
        unspent outputs in the current blockchain state is the total of balances of the addresses.
        On the other hand, in the account model, a blockchain maintains the balance of all accounts
        and keeps records of all transactions that affect the balance.
      </AppArticle>
      <AppArticle>
        To create a transaction, the sender specifies parameters (e.g., recipient address, amount)
        and signs it with a private key using an elliptic curve algorithm, such as Elliptic Curve
        Digital Signature Algorithm (ECDSA) or Edwards-curve Digital Signature Algorithm (EdDSA).
        The signed transaction is broadcast to the network's peer-to-peer nodes. Nodes verify the
        signature's authenticity, confirm the sender's balance, and check the nonce. Validated
        transactions are stored in a memory pool (mempool), awaiting inclusion in a new block by
        miners or validators. Selected transactions are hashed into a Merkle Tree, included in a
        block's body, and linked to the previous block via its hash in the header. The consensus
        mechanism determines which blocks are added to the blockchain. Once added, the transaction
        is confirmed, and the blockchain's global state is updated.
      </AppArticle>
      <AppArticle>
        In the domain of blockchain technology, Merkle tree{' '}
        <RefLink mode="cite" toId="merkle-tree" /> is the solution to verify whether a particular
        transaction is included in a block or not without having to download the entire dataset. A
        Merkle tree is a binary tree, represents the hash of all transactions in the block. Each
        leaf node in the Merkle tree is a transaction hash, and each non-leaf node is the hash of
        the concatenation of its two child nodes. The transaction hash is the way each transaction
        is identified. Transaction hash is a cryptographic digest generated by applying a hash
        function, such as SHA-256 in Bitcoin and Keccak-256 in Ethereum, to the transaction's
        contents.
      </AppArticle>
      <AppArticle>
        In a blockchain network, nodes maintain the honesty and security of the system. Depending on
        the blockchain's design and consensus mechanism, nodes can be miners or validators. Miners
        are responsible for creating new blocks and minting coins, while validators verify
        transactions and ensure network consistency through digital signatures. The process of
        selecting which node will add the next block to the blockchain is managed by a consensus
        mechanism.
      </AppArticle>
      <AppArticle>
        The consensus mechanism is the protocol that all nodes in a decentralized network agree on
        the state of the blockchain. A consensus mechanism has two key characteristics: (1) only
        valid blocks are added to the chain, and (2) the system remains secure even in the presence
        of malicious actors.
      </AppArticle>
      <AppArticle>
        There are two most widely used consensus mechanisms are Proof of Work (PoW) and Proof of
        Stake (PoS). In PoW, miners solve complex mathematical puzzles to verify transactions. The
        first miner to successfully find a valid solution is permitted the right to add a new block
        to the blockchain and receive cryptocurrency incentives. PoW ensures network security
        through computational difficulty, making it resistant to attacks. However, it requires
        substantial computational power and energy consumption, raising scalability and
        sustainability concerns. In contrast, Validators are selected to create blocks based on the
        cryptocurrency they stake as collateral in PoS. Validators who successfully add a block
        receive transaction fees as a reward. PoS significantly reduces energy consumption and
        allows for faster transaction finality. However, PoS can pose the risk of centralization,
        where a small number of entities control a significant portion of the staked assets. Other
        consensus models, such as Delegated Proof of Stake (DPoS), Proof of Authority (PoA), and
        Byzantine Fault Tolerance (BFT) variants, depend on the blockchain architecture.
      </AppArticle>
    </SectionBox>
  );
}
