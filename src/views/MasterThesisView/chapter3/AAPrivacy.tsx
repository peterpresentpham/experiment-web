/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';

export default function AAPrivacy() {
  return (
    <SectionBox id="privacy-in-account-abstraction" title="Privacy in Account Abstraction">
      <AppArticle isFirst>
        {
          'This section outlines several implementations of privacy in account abstraction, which use zero-knowledge proofs. Based on that, this section discusses the current limitations of privacy in account abstraction. In conclusion, this section demonstrates solutions that are used in the context of the thesis to deal with some limitations'
        }
      </AppArticle>
      <AppArticle>
        {
          'Account abstraction allows developers to implement custom logic, including ZKPs, so that it can enable various privacy-preserving solutions in blockchain systems, following by the below:'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">Privacy-preserving transaction</span>
          {
            ': In a traditional blockchain system, transaction details, including sender and receiver addresses, transferred amounts, and associated metadata, are public. It can compromise user privacy, exposing sensitive information. Using smart contracts and ZKPs, account abstraction can prove the validity of transactions without revealing transaction details.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Private authentication</span>
          {
            ": Fundamentally, the purpose of private authentication is to prove that a user is authorized without revealing which member of a group they are. For example, in a smart contract recovery with guardians, guardians' identities are typically stored on-chain, so they are public. It can disclose sensitive information about participants, cause privacy problems. To reduce this problem, account abstraction allows for the implementation of ZKP to prove that the guardian is eligible without knowing any guardian's identity."
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Anonymous voting</span>
          {
            ': Account abstraction with ZKPs can support governance functions such as voting in decentralized autonomous organizations (DAOs). For example, users can preserve the privacy of their choices while ensuring that each vote is valid and unique.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Payment system</span>
          {
            ': Account abstraction with ZKPs can implement a payment system that verifies transactions without compromising privacy. It is useful in peer-to-peer payment systems, where privacy is important.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Digital identity</span>
          {
            ': Account abstraction with ZKPs enables users to prove their identity without revealing real information. For example, if a user wants to prove that the balance is enough but does not publish the real balance, the user can use ZKP to shield the real balance, preventing the leak of the balance information.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'There are many real-world applications that use ZKPs to improve privacy and preservation. One of the fascinating applications is the Semaphore protocol '
        }
        <RefLink toId="semaphore" mode="cite" />
        {
          '. The protocol is a zero-knowledge protocol designed to enable users to prove membership in a group and send signals (such as votes or attestations) anonymously, without revealing their identity or linking their actions. The protocol presents identity as an EdDSA key pair and uses the hash of the public key as a commitment to enable a zk-SNARK protocol. Even though ZKPs enhance privacy significantly, there exist limitations that make it expensive and hard to implement in real-world applications, following by the below:'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">On-chain verification cost</span>
          {
            ': ZKPs are strongly based on complex mathematical operations, such as elliptic curve, polynomial, so that the verification process demands significant computational resources, which increases fees when executed on Ethereum or other EVM blockchains.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Proof size and latency</span>
          {
            ': Some ZKP protocols require a large proof for verification. A large proof can increase bandwidth and latency during transmission and verification.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">User experience and accessibility</span>
          {
            ': Privacy-preserving account abstraction requires users to interact with advanced cryptographic tools such as ZK compilers, proof generators, which are often difficult to understand.  Moreover, the risk of losing a ZK-based identity or failing to generate a valid proof may lead to transaction failure or loss of account access.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Trusted setup</span>
          {
            ': Some ZK schemes require a setup phase to generate public parameters. If this process is compromised, the privacy and soundness of the entire system may be at risk.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'Considering two prominent ZKP protocols, zk-SNARK and zk-STARK, zk-SNARKs require a trusted setup, which can cause a potential vulnerability if the setup process is compromised. However, zk-SNARKs have the advantage of compact proof sizes, resulting in lower bandwidth usage and reduced verification latency. In contrast, zk-STARKs eliminate the need for a trusted setup, enhancing transparency and security, but they produce significantly large proofs. This increases bandwidth requirements and latency during transmission and verification.'
        }
      </AppArticle>
      <AppArticle>
        {
          'In terms of the thesis, we will introduce two key contributions to enhancing privacy-preserving mechanisms in account abstraction using ZKPs and try to deal with the limitations of account abstraction:'
        }
      </AppArticle>
      <ArticleUL className="list-decimal">
        <ArticleLI>
          {
            'We process the evaluation and selection of efficient methods to interact with the ZKP environment. An evaluation was conducted to identify and select suitable methods that minimize proof size, gas consumption, and verification latency. This assessment is based on the following criteria: proof size, gas cost, verification time.'
          }
        </ArticleLI>
        <ArticleLI>
          {
            'To improve the accessibility and user experience of privacy-preserving features, a complete interface was developed to facilitate the generation and verification of guardian proofs. This interface abstracts the underlying cryptographic complexity and allows users to:'
          }
          <ArticleUL className="list-disc">
            <ArticleLI>
              {
                'Generate valid ZK proofs without interacting directly with low-level tools or libraries.'
              }
            </ArticleLI>
            <ArticleLI>{'Verify guardian authorizations securely and privately.'}</ArticleLI>
            <ArticleLI>
              {
                'Simplify the recovery process in smart wallets while preserving the anonymity of the guardian set.'
              }
            </ArticleLI>
          </ArticleUL>
        </ArticleLI>
      </ArticleUL>
    </SectionBox>
  );
}
