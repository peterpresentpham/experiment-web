/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';

export default function NeedForAA() {
  return (
    <SectionBox id="the-need-for-account-abstraction" title="Need for Account Abstraction">
      <AppArticle isFirst>
        {
          'This section introduces an overview of account abstraction, a mechanism that combines the strengths of EOAs and CAs to address their limitations, enhancing flexibility and user experience in blockchain applications.'
        }
      </AppArticle>
      <AppArticle>
        {
          'Account abstraction (AA) is a concept that combines the flexibility of CA and the user control of EOA. AA allows users to define how their accounts behave, how transactions are validated, and how gas fees are managed. It enhances user experience, security, and functionality in applications like smart contract wallets, social recovery mechanisms, and gasless transactions, making blockchain more accessible and secure for mainstream adoption.'
        }
      </AppArticle>
      <FigureBox
        id="account-abstraction-structure"
        alt="account-abstraction-structure"
        title="Structure of Account abstraction"
        src={IMAGES.master.chapter3.accountAbstraction}
      />
      <AppArticle isFirst>
        <RefLink toId="account-abstraction-structure" />{' '}
        {
          "illustrates the basic account abstraction structure. At its core, AA separates an account's identity (the public key and private key) from its logic. AA still maintains the user control through a key pair. However, the user's logic and state are managed on-chain by a contract account that is associated with the EOA instead of the key pair directly. For example, in the traditional EOA model, a wallet validates transactions at the protocol level using hardcoded rules, typically elliptic curve cryptography. With account abstraction, this validation logic is moved on-chain and becomes programmable. The mechanism eliminates EOA's single-point failure, ensuring the user's funds are safe when the private key is compromised through the implementation of recovery methods."
        }
      </AppArticle>
      <AppArticle>
        {
          'Account abstraction provides several advantages over traditional account models, particularly in the context of security, usability, and programmability. Developers can upgrade the logic of smart contract wallets to add new features or repair vulnerabilities, something that is not possible with fixed-function in EOAs. For example, a major limitation of EOAs is their inefficiency in executing multiple transactions. Each transaction must be signed and executed individually, leading to a slow user experience.'
        }
      </AppArticle>
      <AppArticle>
        AA can improve this by allowing transaction batching. Instead of executing multiple
        transactions separately, AA allows users to bundle multiple operations into a single
        transaction. As shown in <RefLink toId="multicall" />, EOAs execute transactions
        sequentially, while <RefLink toId="multicall1" /> illustrates how AA bundles multiple
        transactions in one, reducing execution time and improving efficiency.
      </AppArticle>
      <FigureBox
        id="multicall"
        alt="multicall"
        title="Execute transaction by EOA"
        src={IMAGES.master.chapter3.multicall}
      />
      <FigureBox
        id="multicall1"
        alt="multicall1"
        title="Multicall by account abstraction"
        src={IMAGES.master.chapter3.multicall1}
      />
      <AppArticle isFirst>
        {
          "Additionally, AA allows gas fee flexibility. Unlike EOAs, which require users to pay transaction fees in the blockchain's native token, AA allows users to pay fees in alternative tokens defined by a paymaster contract. This mechanism automatically converts native assets into the required gas token, simplifying the payment process and enhancing accessibility for users."
        }
      </AppArticle>
      <AppArticle>
        {
          'AA eliminates the constraints of EOAs by integrating programmable security, flexible authentication, and enhanced transaction execution. By addressing key management risks, preventing fraudulent transactions, and optimizing user experience, AA provides a more secure and user-friendly framework for managing blockchain accounts. This innovation is crucial for improving the usability and adoption of blockchain applications while maintaining strong security guarantees.'
        }
      </AppArticle>
      <AppArticle>
        {
          'AA introduces several recovery solutions based on smart contract, for example Smart Contract Recovery with Guardians and Guardian-less Smart Contract Recovery.'
        }
      </AppArticle>
      <AppArticle>
        <span className="italic">Smart Contract Recovery with Guardians</span>
        {
          ': This method uses smart contracts and trusted guardians. Guardians cannot access funds, but can authorize an account recovery process. If a user generates a new key pair, guardians can approve an operation that transfers ownership to the new key. All user cases, from managing guardians to activating the recovery process, are controlled by smart contracts.'
        }
      </AppArticle>
      <AppArticle>
        <span className="italic">Guardian-less Smart Contract Recovery</span>
        {
          ': This approach eliminates the need for external guardians by utilizing cryptographic techniques such as multi-signature schemes, zero-knowledge proofs, and secret sharing. These mechanisms enhance self-custody and account abstraction in decentralized systems.'
        }
      </AppArticle>
      <AppArticle>
        {
          "An example of guardian-less recovery is Shamir's Secret Sharing, which can be combined with time locks or decentralized identity (DID) systems. In this method, the private key or recovery data is divided into multiple shares (e.g., split into 5 parts), with a required threshold (e.g., 3 parts) needed to recover the account. This enables secure and decentralized recovery without human involvement."
        }
      </AppArticle>
      <AppArticle>
        {
          'To implement AA without modifying the Ethereum consensus layer, ERC-4337 proposes a new account abstraction standard using user operations and a special smart contract called EntryPoint. ERC-4337 moves account logic off-chain and uses a bundler to submit transactions on behalf of users. ERC-4337 introduces several components:'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">UserOperation</span>: A signed data structure that represents an
          abstracted user transaction.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Bundler</span>: An off-chain node or actor that packages user
          operations and submits them to the blockchain.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">EntryPoint contract</span>: A smart contract that verifies and
          executes user operations.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Paymaster</span>: A contract that sponsors gas fees or handles
          alternative payment mechanisms.
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        The technical details and architecture of ERC-4337 will be discussed in{' '}
        <RefLink toId="erc4337" mode="section" />.
      </AppArticle>
    </SectionBox>
  );
}
