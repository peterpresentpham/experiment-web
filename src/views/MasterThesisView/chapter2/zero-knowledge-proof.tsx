/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';

export default function ZeroKnowledgeProof() {
  return (
    <SectionBox id="zero-knowledge-proof" title="Zero-knowledge Proof">
      <AppArticle isFirst>
        {
          'This section introduces Zero-knowledge proofs (ZKPs). The discussion covers the foundational concepts of ZKPs, their interactive and non-interactive variants, their applications in blockchain, and a detailed introduction to zk-SNARKs, including comparisons with other ZKP methods like zk-STARKs and Bulletproofs.'
        }
      </AppArticle>
      <AppArticle>
        {
          'ZKPs are critical for blockchain applications requiring privacy and efficiency. They enable users to prove credentials (age, financial status) without revealing sensitive data, supporting use cases like private transactions in Zcash, identity verification in decentralized systems, and scalable layer-2 solutions like zk-Rollups. By ensuring confidentiality and reducing on-chain data requirements, ZKPs enhance blockchain’s utility in finance, healthcare, and governance.'
        }
      </AppArticle>
      <AppArticle>
        {
          'In the context of this thesis, ZKPs are essential to implementing a private authentication in a smart contract recovery solution based on guardians. Specifically, using ZKPs, the valid guardian can prove their identity and recover ownership without revealing their real identities. The architecture of the recovery solution will be discussed in more detail in'
        }{' '}
        <RefLink mode="chapter" toId="chapter4" />
      </AppArticle>
      <AppArticle>
        {
          "ZKP is a cryptographic protocol that allows a prover to convince a verifier that a statement is true without revealing any additional information beyond the statement's validity. The goal of a zero-knowledge proof is to allow the verifier to be certain of the truth of the statement while keeping the underlying information secret. A valid zero-knowledge proof must satisfy the following three properties:"
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">Completeness</span>:{' '}
          {
            'An honest verifier will always be convinced by an honest prover if the statement is true.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Soundness</span>:{' '}
          {
            'If the statement is incorrect, a dishonest prover cannot convince the verifier except with negligible probability.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Zero-Knowledge</span>:{' '}
          {
            'The proof reveals no additional information beyond the fact that the statement is true. Even a cheating verifier learns nothing extra.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'A zero-knowledge proof involves two parties: the prover, who wants to prove the statement, and the verifier, who wants to verify its validity. The prover constructs a witness, a piece of secret information that serves as proof, and convinces the verifier that the statement is true through one of two possible approaches: (1) interactive zero-knowledge and (2) non-interactive zero-knowledge.'
        }
      </AppArticle>
      <FigureBox
        id="izk-interaction"
        alt="izk-interaction"
        title="The interaction between prover and verifier in an interactive zero-knowledge proof protocol"
        src={IMAGES.master.chapter2.izk}
      />
      <AppArticle isFirst>
        {
          'In an interactive zero-knowledge proof (IZK), the verifier proposes a challenge and expects the prover to respond correctly. The procedure can be repeated as many times as the verifier wants, until the verifier ensures that the probability that the prover guesses rather than knows the answer becomes low enough. A standard IZK involves three steps (as illustrated in'
        }{' '}
        <RefLink toId="izk-interaction" />)
      </AppArticle>
      <ArticleUL className="ml-3 list-decimal">
        <ArticleLI>The prover sends a message as a commitment to the verifier.</ArticleLI>
        <ArticleLI>The verifier returns a challenge and asks the prover to answer it.</ArticleLI>
        <ArticleLI>The prover calculates the answer and sends it back to the verifier.</ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'If the prover consistently responds with valid answers over multiple rounds of communication, the verifier can consider that the commitment is honest. IZKs are easy to implement and straightforward. However, the protocol requires constant back-and-forth communication, which makes it inefficient. Moreover, its proof is unavailable for independent assessment. There are two key reasons why IZKs are unsuitable for blockchain applications.'
        }
      </AppArticle>
      <FigureBox
        id="zk-overview"
        alt="zk-overview"
        title="The interaction between prover and verifier in a non-interactive zero-knowledge proof protocol"
        src={IMAGES.master.chapter2.nizk}
      />
      <AppArticle isFirst>
        {
          'Non-interactive zero-knowledge proofs (NIZKs) are developed to address the inefficiencies of interaction. These proofs require only a single message from the prover to the verifier. Instead of multiple rounds, NIZKs rely on advanced cryptographic techniques to ensure zero-knowledge properties, such as elliptic curve cryptography provides the discrete logarithm problem to ensure security, and a trusted setup or common reference string (CRS) to establish parameters. A standard model consists of three stages (that is illustrated in'
        }{' '}
        <RefLink toId="zk-overview" />)
      </AppArticle>
      <ArticleUL className="ml-3 list-decimal">
        <ArticleLI>The prover inputs the secret witness into an algorithm.</ArticleLI>
        <ArticleLI>The algorithm generates a proof.</ArticleLI>
        <ArticleLI>
          The proof is sent to the verifier, who checks its validity using the CRS.
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          "Based on NKZK's advantages, there are diverse applications that implement NIZKs to enhance privacy and scalability."
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">Private Transactions</span>:{' '}
          {
            'ZKPs can enable validation without exposing sensitive transaction data. For example, Zcash uses ZKPs to create shielded transactions. These transactions hide the participants and amounts involved while ensuring the network can verify that no double-spending occurs.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Scalability Solutions</span>:{' '}
          {
            'ZKPs compress transaction data off-chain, and then the off-chain computations are verified on-chain with minimal data. This approach reduces the volume of data stored on the blockchain while maintaining trustworthiness and security.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Identity Verification</span>:{' '}
          {
            'Users prove credentials without revealing personal data. For example, a user can prove they are above a certain age without revealing their exact birthday.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Guardian-Based Authentication</span>:{' '}
          {
            'Users can be authenticated by a group of guardians without revealing guardian identities, enhancing security in decentralized networks.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'zk-SNARK stands for Zero-Knowledge Succinct Non-Interactive Argument of Knowledge. This type of ZKP is the most widely adopted ZKP in blockchains. Their succinct proofs and fast verification make them ideal for limited resource environments. Besides the primary properties of non-interactive ZKP, completeness, soundness, zero-knowledge, and non-interactivity, zk-SNARKs also satisfy the following important characteristics:'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">Succinctness</span>:{' '}
          {
            'The proof is short and can be efficiently stored on-chain and quickly verified by network nodes.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Argument of knowledge</span>:{' '}
          {'the prover possesses a valid witness that satisfies the given statement.'}
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'At a high level, zk-SNARKs transform a computation into an equivalent algebraic form that can be efficiently proven and verified. The construction typically involves the following steps:'
        }
      </AppArticle>
      <ArticleUL className="ml-3 list-decimal">
        <ArticleLI>
          <span className="italic">Arithmetic Circuit Representation</span>:{' '}
          {
            'Initially, the computation to be proven is transformed into an arithmetic circuit composed of addition and multiplication gates over a finite field. Each gate represents a basic arithmetic constraint, and the overall circuit defines the computational statement.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Rank-1 Constraint System (R1CS)</span>:{' '}
          {
            'The circuit is then converted into an R1CS. This structured form enables a systematic translation into algebraic proofs.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Quadratic Arithmetic Programs (QAPs)</span>:{' '}
          {
            'The R1CS is compiled into a QAP. The central idea is that if a prover knows an assignment that satisfies the R1CS, they can construct polynomials that meet specific divisibility conditions.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Trusted Setup</span>:{' '}
          {
            'A one-time, trusted setup process generates a common reference string (CRS) consisting of public parameters required for proof generation and verification. The security of zk-SNARKs depends on the secrecy of certain components generated during this setup.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Proof Generation and Verification</span>:{' '}
          {
            "Using the CRS, the prover generates a valid proof, and the verifier can check the proof's validity quickly without learning anything about the input itself."
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'The main advantages of zk-SNARK are their succinctness and fast verification, making them highly suitable for high-frequency blockchain operations, such as transactions, smart contract executions, and rollup proofs. Their small proof size allows for significant savings in storage and network bandwidth compared to alternatives. However, zk-SNARKs has two limitations:'
        }
      </AppArticle>
      <ArticleUL className="ml-3 list-decimal">
        <ArticleLI>
          <span className="italic">Trusted setup dependency</span>:{' '}
          {
            'The dependency on a trusted setup can cause a potential centralization point and security risk if the setup process is incorrectly conducted.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Strong cryptographic assumptions</span>:{' '}
          {
            'zk-SNARKs depend on complex mathematical structures like elliptic curve pairings and specific non-standard assumptions, making them more complex to implement compared to proof systems relying purely on classical assumptions.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'To be compared, Zero-Knowledge Scalable Transparent Arguments of Knowledge (zk-STARK) were designed to address some limitations of zk-SNARKs, and do not require a trusted setup. However, zk-STARK proofs are larger and slower to verify than zk-SNARK proofs. Thus, while zk-STARKs are more robust in terms of trust and future-proofing, zk-SNARKs remain more efficient in terms of proof size and verification speed, which is critical for blockchains with high throughput requirements.'
        }
      </AppArticle>
    </SectionBox>
  );
}
