/* eslint-disable react/no-unescaped-entities */
/* eslint-disable quotes */

import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';

export default function RecoveryWallets() {
  return (
    <SectionBox id="recovery-wallets" title="Recovery wallets">
      <ArticleUL className="list-disc">
        <ArticleLI isMath>
          <span className="font-bold">OKX wallet</span>
          <RefLink toId="okx" mode="cite" />
          {
            ": OKX is a MPC wallet. MPC (Multi-Party Computation), which is quite like Shamir's Secret Sharing, divides $sk$ into several shares stored on different devices. OKX wallet splits $sk$ into three independent shares using MPC. A 2-of-3 threshold is required to generate valid transaction signatures; no single component can execute actions alone. To recover, users must present any two of these three credentials: (1) their device, (2) a cloud backup, and (3) OKX account login."
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Soul wallet</span>
          <RefLink toId="soul-wallet" mode="cite" />
          {
            ': Soul wallet is an ERC-4337 smart contract wallet having the social recovery based on guardians. Soul wallet recovery smart contract stores the keccak256 hash of the guardian data. When users want to recover their wallet, their guardians sign an EIP-712-based signature, and the process also reveals guardian data.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Clave Wallet</span>
          <RefLink toId="clave-wallet" mode="cite" />
          {
            ": is a smart contract wallet built on ZKsync. Its architecture leverages ZKsync's native account abstraction, which is conceptually similar to ERC-4337. Clave Wallet offers two key recovery mechanisms: passkey-based recovery and guardian-based recovery."
          }
          <AppArticle>
            {
              'In the passkey-based method, when users create an account using a passkey, an encrypted version of their private key is automatically backed up to the cloud. If users lose their device, they can recover access on another trusted device by using the same passkey.'
            }
          </AppArticle>
          <AppArticle>
            The guardian-based solution in Clave allows email accounts, rather than traditional web3
            addresses, to act as guardians. This is made possible through the use of zkEmail
            <RefLink toId="zk-email" mode="cite" />, which enables zero-knowledge proofs to verify
            email ownership without revealing the guardian's email address or content.
          </AppArticle>
        </ArticleLI>
      </ArticleUL>
    </SectionBox>
  );
}
