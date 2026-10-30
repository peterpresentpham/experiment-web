/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import RefLink from 'src/components/Thesis/RefLink';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';

export default function Clave() {
  return (
    <SubsectionBox id="clave" title="Clave wallet vs. the proposed wallet">
      <AppArticle isFirst>
        Clave wallet is a guardian-based ERC-4337 wallet powered by ZKsync. Clave uses zkEmail
        <RefLink toId="zk-email" mode="cite" />, a powerful system that helps users verify emails
        using ZKP. Clave wallet recovery solution still relies on guardians and ERC-4337
        architecture, but guardians are email accounts instead of web3 accounts.
      </AppArticle>
      <AppArticle>
        {
          'When creating a Clave wallet, users register their email address as the recovery method. If a user loses access to their device or keys:'
        }
      </AppArticle>
      <ArticleUL className="ml-4 list-decimal">
        <ArticleLI>{"They initiate a recovery request via Clave's interface."}</ArticleLI>
        <ArticleLI>
          {
            "Clave's server sends a recovery email to the user's registered address (guardian). This email includes a DKIM (DomainKeys Identified Mail) signature from the email provider (like Gmail)."
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          "On the guardian's device, Clave's app parses the email and verifies its DKIM signature to ensure it came from the correct domain and hasn't been tampered with. Using a zk-SNARK circuit, the client generates a ZKP, without revealing the actual email address or email content."
        }
      </AppArticle>
      <AppArticle>
        {
          "The guardian submits the generated proof to Clave's smart contract to validate the proof. If the proof is valid and meets all conditions, the contract transfers ownership of the wallet to a new user-controlled address."
        }
      </AppArticle>
      <AppArticle>
        {
          'Using email accounts as guardians can significantly expand the pool of potential guardians, as not everyone has an on-chain account, but almost everyone has an email account. This solution is also highly convenient for users, especially those who are not familiar with Web3. Guardians can view the plain-text content of the email to understand the context of the recovery request before using the Clave app to generate a proof.'
        }
      </AppArticle>
      <AppArticle>
        {
          'However, the solution becomes more complex due to the integration of the email-based recovery factor, compared to the proposed wallet, which is based only on smart contracts, even though most of the complexity is hidden away from the user. Moreover, the Clave solution depends on a server to send recovery emails to guardians (users do not send these emails directly; this responsibility belongs to the Clave server), which could become a bottleneck in the architecture.'
        }
      </AppArticle>
    </SubsectionBox>
  );
}
