import { AppArticle } from 'src/components/box/ArticleBox';
import SameChapterBox from 'src/components/Thesis/SameChapterBox';

export default function Abstract() {
  return (
    <SameChapterBox id="abstract" mode="abstract">
      <AppArticle isFirst>
        As blockchain technology gains adoption, traditional Externally Owned Accounts face
        significant limitations in usability, security, and recovery. These accounts rely on private
        keys for authentication, creating a single point of failure with no native mechanisms for
        recovery or flexible authentication. To overcome these challenges, this thesis proposes an
        Account Abstraction Wallet architecture that integrates social recovery mechanisms and
        leverages zero-knowledge proofs to ensure secure and private account management.
      </AppArticle>
      <AppArticle>
        The wallet design is based on the ERC-4337 standard, which enables account abstraction
        without requiring changes to the consensus protocol. In this architecture, users control
        smart contract wallets rather than traditional EOAs. To enhance recovery ability, the wallet
        employs a social recovery scheme, where a group of predefined guardians can assist in
        restoring access when a user loses their signing key. Unlike conventional social recovery
        models that require guardians to publicly sign recovery requests, our design uses
        zero-knowledge proofs to protect guardian identities. This ensures that the recovery process
        remains private, tamper-resistant, and verifiable on-chain without revealing sensitive
        information.
      </AppArticle>
      <AppArticle>
        The implementation employs efficient zero-knowledge proof primitives such as the Poseidon
        hash function and the BabyJubJub elliptic curve, optimized for compatibility with the
        circuits. A user-friendly interface is also developed to facilitate the generation and
        submission of proofs, making the system accessible to non-technical users.
      </AppArticle>
      <AppArticle>
        Through this approach, the proposed wallet achieves a balance between security, usability,
        and privacy. It eliminates the single point of failure inherent in EOAs, introduces robust
        account recovery, and preserves confidentiality in guardian-based verification. This thesis
        contributes a concrete solution toward more resilient, secure, and user-friendly Web3
        identity management.
      </AppArticle>
      <AppArticle>
        <span className="font-bold">Keyword</span>: blockchain, smart contract, externally owned
        account, zero-knowledge proofs, elliptic curve, circuit, social recovery.
      </AppArticle>
    </SameChapterBox>
  );
}
