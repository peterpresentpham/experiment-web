/* eslint-disable react/no-unescaped-entities */
/* eslint-disable quotes */

import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';

export default function RecoveryMethods() {
  return (
    <SectionBox id="recovery-methods" title="Recovery methods">
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="font-bold">Off-chain backup and recovery</span>:{' '}
          {
            'This method is backing up private key ($sk$) to a secondary location for later restoration. This allows users to regain access if the key is lost, but it does not protect against theft or leakage. For example, storing the key on offline devices (e.g., USB drives), even encrypted keys requires managing an additional Key Encryption Key (KEK); devices can also be lost or damaged.'
          }
          <AppArticle isMath>
            {
              "To enhance security, $sk$ can be split into shares and distributed across multiple platforms. This distributed backup strategy improves both security and fault tolerance, enabling more flexible recovery mechanisms. One example is Shamir's Secret Sharing, which divides the private key or recovery data into several shares, with a required threshold of shares to recover the account. These shares can be stored as passkeys on the user's device or as encrypted keys in the cloud."
            }
          </AppArticle>
        </ArticleLI>
        <ArticleLI isMath>
          <span className="font-bold">Use of seed phrases</span>:{' '}
          {
            'A seed phrase is a human-readable sequence of random words that serves as a backup for $sk$. Users only need to securely store the seed phrase, typically written on paper. Although seed phrases are easier to store compared to raw private keys, they must be kept secure because anyone who gains access to them can recover the private key and take control of the account.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Pre-signed transactions</span>:{' '}
          {
            'Users can create and store pre-signed transactions that transfer assets to a secondary account. These transactions remain offline until needed. However, secure management of secondary accounts is crucial to prevent further risks.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Guardian-based smart contract recovery</span>:{' '}
          {
            'This method uses smart contracts and trusted guardians. Guardians cannot access funds but can authorize an account recovery process. If a user generates a new key pair, guardians can approve an operation that transfers ownership to the new key. All user cases, from managing guardians to activating the recovery process, are controlled by smart contracts.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Guardian-less smart contract recovery</span>: This approach
          eliminates the need for external guardians but still uses smart contracts. A famous method
          is KELP
          <RefLink toId="kelp" mode="cite" />, the method has four function logics: (1) commit, (2)
          reveal, (3) claim, and (4) challenge. This approach is fully on-chain, trustless, and
          setup-free, making it ideal for decentralized key management. However, it depends on the
          owner's ability to monitor and respond to unauthorized recovery attempts in time.
        </ArticleLI>
      </ArticleUL>
    </SectionBox>
  );
}
