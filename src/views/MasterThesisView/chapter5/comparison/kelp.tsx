import { AppArticle } from 'src/components/box/ArticleBox';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';

export default function Kelp() {
  return (
    <SubsectionBox id="kelp" title="KELP vs. the proposed wallet">
      <AppArticle>
        {
          'KELP is a smart contract-based framework that enables on-chain recovery of lost keys without relying on off-chain backups or on-chain guardians. KELP employs a three-phase protocol, consisting of Commit, Reveal, and Claim, to initiate a recovery. During this process, the original owner can cancel the request if it seems malicious. Designed to be fully decentralized and transparent, KELP is a lightweight, secure alternative for account recovery in blockchain systems.'
        }
      </AppArticle>
      <AppArticle>
        {
          'KELP represents a guardian-less smart contract recovery solution that is entirely implemented on-chain. Unlike guardian-based systems, KELP does not rely on third-party approvals or off-chain backup. Its main advantage over the proposed wallet is that it is simple and easy to implement. However, because KELP is based on a time-delay mechanism to prevent unauthorized recovery, it typically requires a longer delay period than guardian-based systems to maintain equivalent security, which may reduce responsiveness in urgent recovery scenarios.'
        }
      </AppArticle>
    </SubsectionBox>
  );
}
