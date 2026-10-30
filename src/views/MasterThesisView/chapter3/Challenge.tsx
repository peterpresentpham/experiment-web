/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox, { SubsectionBox } from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';

export default function Challenge() {
  return (
    <SectionBox
      id="challenge-in-the-current-blockchain-account-model"
      title="Challenges in the Current Blockchain Account Model"
    >
      <AppArticle isFirst>
        {
          'This section outlines the limitations of the current blockchain account model, focusing on EOAs, and further discusses several significant issues, including key management risks, limited functionality, and security vulnerabilities.'
        }
      </AppArticle>
      <AppArticle>
        {
          'The current blockchain account model, particularly EOAs, has a wide range of applications. Its advantages include ease of implementation, user-friendly experience, and reliability in typical scenarios. However, EOAs still present several limitations that lead to significant challenges. These include key management risks, feature limitations, security vulnerabilities, contract account limitations, lack of native account recovery, and inflexibility in access control. Among these, there are three primary challenges, including key management risks, feature limitations, and security vulnerabilities. Addressing these core issues can potentially resolve the others. For example, limitations in contract accounts are an aspect of feature limitations, and the lack of native account recovery can be dealt with by handling feature limitations.'
        }
      </AppArticle>
      <SubsectionBox id="key-management-risk" title="Key management risk">
        <AppArticle isFirst>
          {
            'EOAs are secured and controlled through a cryptographic key pair. This key pair enables secure communication, authentication, and transaction signing. The public-private key system is based on asymmetric cryptography, which ensures that only the private key owner can control the account, while others can independently verify ownership using the corresponding public key.'
          }
        </AppArticle>
        <AppArticle isMath>
          {
            'A private key is a randomly generated 256-bit integer in the range between 0 and $2^{256} - 1$. Because of the number of possible random values, brute-force attacks are infeasible. Private keys provide full control over an Ethereum account or any blockchain account that is based on asymmetric cryptography, so that unauthorized access can result in the loss of digital assets. A private key has two important functions:'
          }
        </AppArticle>
        <ArticleUL className="list-disc">
          <ArticleLI>
            <span className="italic">Transaction signing</span>:{' '}
            {
              'When sending a transaction, the private key generates a digital signature. This signature verifies account ownership and authorizes the transaction without exposing the private key.'
            }
          </ArticleLI>
          <ArticleLI>
            <span className="italic">Account control</span>:{' '}
            {
              'The private key is the only way to access and manage an account. If lost, the account and its associated assets become permanently inaccessible.'
            }
          </ArticleLI>
        </ArticleUL>
        <AppArticle>
          {
            'The public key is derived from the private key using elliptic curve cryptography. It is primarily used for the verification of digital signatures. A public key is typically 64 bytes long, consisting of two 32 byte integers that represent the $x$ and $y$ coordinates on the elliptic curve.'
          }
        </AppArticle>
        <AppArticle>
          {
            'EOAs rely on a single private key for access and transaction authorization. This dependence causes a major risk: if the private key is lost, forgotten, or compromised, the user permanently loses access to the account and all associated assets.'
          }
        </AppArticle>
        <FigureBox
          id="bitcoin-supply"
          alt="bitcoin-supply"
          src={IMAGES.master.chapter3.losingBitcoin}
          title={
            <div>
              Bitcoin supply (in million Bitcoin <RefLink mode="cite" toId="bitcoin-supply" />)
            </div>
          }
        />
        <AppArticle isFirst>
          As illustrated in <RefLink toId="bitcoin-supply" />
          {
            ', an estimated 20% of all Bitcoin, approximately 3.84 million BTC, has been lost. This estimate is based on blockchain analysis of addresses where funds have remained inactive for seven years or more. One of the primary causes of the loss is the loss of private keys, including forgotten passwords, misplaced backups, and unrecoverable seed phrases.'
          }
        </AppArticle>
      </SubsectionBox>
      <SubsectionBox id="feature-limitation" title="Feature limitations">
        <AppArticle isFirst>
          As discussed in <RefLink toId="key-management-risk" mode="subsection" />
          {
            ', beyond the risks of losing private keys and forgetting passwords, a significant limitation of EOAs is the lack of built-in recovery mechanisms. Unlike smart contracts, EOAs cannot execute or implement programmable logic. Various recovery methods have been proposed, such as off-chain backups and seed phrases, but these approaches require users to securely store recovery credentials or rely on trusted storage solutions. Pre-signed transactions can add an extra layer of security; however, they still depend on offline storage devices and secondary accounts. More advanced recovery solutions—both guardian-based and guardian-less—are implemented via smart contracts and, therefore, cannot be natively supported by EOAs without external modifications.'
          }
        </AppArticle>
        <AppArticle>
          {
            'Beyond recovery limitations, EOAs are restricted in their functionality. Their primary purpose is to manage Ether, interact with other accounts, and initiate transactions. However, EOAs cannot support advanced features such as:'
          }
        </AppArticle>
        <ArticleUL className="list-disc">
          <ArticleLI>
            <span className="italic">Paymaster services</span>:{' '}
            {
              'EOAs cannot facilitate gas fee sponsorship mechanisms, limiting flexibility in transaction cost management.'
            }
          </ArticleLI>
          <ArticleLI>
            <span className="italic">Multi-Signature security</span>
            {
              ': EOAs lack multi-signature capabilities, making them less secure for collective fund management.'
            }
          </ArticleLI>
          <ArticleLI>
            <span className="italic">Automated transaction execution</span>
            {
              ': EOAs cannot schedule or automate transactions based on predefined conditions, requiring manual user intervention.'
            }
          </ArticleLI>
          <ArticleLI>
            <span className="italic">Gas fee optimization</span>
            {
              ': EOAs do not allow for gas abstraction techniques such as batching or dynamic gas payment strategies, which smart contracts can implement.'
            }
          </ArticleLI>
        </ArticleUL>
        <AppArticle>
          {
            'These limitations make EOAs less suitable for complex and scalable blockchain applications, driving the need for alternative account models such as smart contract-based wallets that offer enhanced programmability and security.'
          }
        </AppArticle>
      </SubsectionBox>
      <SubsectionBox id="security-vulnerability" title="Security vulnerabilities">
        <AppArticle isFirst isMath>
          {
            "EOAs rely on the discrete elliptic curve security problem, which ensures that it is nearly impossible to recover a private key from its corresponding public key. Despite nearly three decades of research, no algorithm has been found that significantly improves upon the naive approach. For example, a brute-force attack has a complexity of $O(n)$, while Pollard's Rho algorithm has a complexity of $O(\\sqrt{n})$. Even if a computer could perform $10^{12}$ operations per second, the time required to compute a 256-bit private key would be approximately $10^{25}$ seconds, making elliptic curve cryptography highly secure against direct attacks."
          }
        </AppArticle>
        <AppArticle>
          {
            'However, despite the cryptographic security of key pairs, EOAs remain vulnerable to various attack vectors, primarily stemming from private key and seed phrase compromises. Notable incidents include:'
          }
        </AppArticle>
        <ArticleUL className="list-disc">
          <ArticleLI>
            <span className="italic">Ronin Network Hack (2022)</span>:{' '}
            {
              'This attack exploited vulnerabilities in the private key management of the Ronin Network, leading to the theft of over $600 million worth of assets. The breach was a result of a compromised validator node that managed the private keys for the network.'
            }
          </ArticleLI>
          <ArticleLI>
            <span className="italic">Poloniex Private Key Compromise (November 10, 2023)</span>
            {
              ': A major security breach resulted in approximately $130 million in cryptocurrency losses across multiple assets, including Ethereum, TRON, and Bitcoin. The attackers gained access to private keys, enabling unauthorized fund transfers.'
            }
          </ArticleLI>
          <ArticleLI>
            <span className="italic">Mixin Network Database Attack (September 23, 2023)</span>
            {
              ": The largest crypto security breach of 2023, this attack led to estimated losses of $200 million. Attackers exploited vulnerabilities in Mixin's cloud infrastructure, obtaining private keys associated with deposit and hot wallet addresses."
            }
          </ArticleLI>
          <ArticleLI>
            <span className="italic">Cryptocurrency Phishing Scams (ongoing)</span>
            {
              ': Phishing scams, where users are tricked into revealing their private keys or seed phrases, remain a prevalent threat. Attackers often use fake websites or emails that mimic legitimate services, leading to theft of funds.'
            }
          </ArticleLI>
        </ArticleUL>
        <FigureBox
          id="hacking"
          alt="hacking"
          title="Incident count and number of attacks in 2023"
          src={IMAGES.master.chapter3.hacking}
        />
        <AppArticle isFirst>
          As illustrated <RefLink toId="hacking" />,{' '}
          {
            'private key compromises were the most costly attack vector, resulting in total losses of $880,892,924 across just 47 incidents. This accounted for nearly half of all financial losses in the crypto space in 2023. These incidents highlight the critical need for enhanced security measures, such as multi-signature wallets, hardware security modules, and account abstraction solutions, to mitigate the risks associated with EOAs.'
          }
        </AppArticle>
      </SubsectionBox>
    </SectionBox>
  );
}
