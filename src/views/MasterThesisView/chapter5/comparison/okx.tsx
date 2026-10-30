/* eslint-disable quotes */
import { AppArticle } from 'src/components/box/ArticleBox';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';

export default function Okx() {
  return (
    <SubsectionBox id="okx" title="OKX wallet vs. the proposed wallet">
      <AppArticle>
        {
          'OKX is an MPC wallet. An MPC wallet splits the private key into multiple secret shares stored across different devices or parties. Unlike traditional wallets, the full private key is never reconstructed at any point. when a user signs a transaction, the involved parties collaborate through cryptographic computation to produce a valid signature, without exposing or combining their individual key shares.'
        }
      </AppArticle>
      <AppArticle>
        {
          "MPC recovery intends to recover the ability to sign. For example, a user has an OKX wallet with three key shares: $A$, $B$, and $C$ stored in the user's device, OKX's server, and cloud storage. The user loses the phone that keeps the key share $A$. By using MPC recovery, the user can generate a new key share in the new device, so recover the ability to sign. The intention is also the biggest difference between the OKX wallet and the proposed wallet. While the proposed wallet is a fund recovery type, it switches the user's funds from the compromised key pair to the new secure key pair."
        }
      </AppArticle>
      <AppArticle>
        {
          "The key difference is the reliance on OKX's centralized server to verify and generate a new key share. The proposed wallet minimizes the risks by decentralizing the recovery logic: decentralized guardians must generate a zero-knowledge proof by themselves and submit it to the smart contract system."
        }
      </AppArticle>
    </SubsectionBox>
  );
}
