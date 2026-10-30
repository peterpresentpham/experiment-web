/* eslint-disable quotes */
import { AppArticle } from 'src/components/box/ArticleBox';
import ChapterBox from 'src/components/Thesis/ChapterBox';
import Section1Sub1 from './Section1Sub1';
import Section1Sub2 from './Section1Sub2';
import Section1Sub3 from './Section1Sub3';

export default function Chapter1() {
  return (
    <ChapterBox id="chapter1" title="Introduction">
      <AppArticle isFirst>
        {
          'Web3 and blockchain technologies have the potential to reshape fundamental aspects of digital applications. Web3, the next phase of the internet, is based on blockchain technology, cryptographic technology, and peer-to-peer networks. Its goal is to create a decentralized internet with open, transparent websites and web applications. Web3 creates decentralized, trustless, and transparent systems. Therefore, Web3 gains numerous benefits for individuals.'
        }
      </AppArticle>
      <AppArticle>
        {
          'In Web 2.0, technology companies control and exploit user information. In Web3, users have full ownership of their data. They can choose what information to share with companies and third parties. In addition, the decentralized Web allows users to track their data and review the source code of their platforms. All stakeholders remain aware of the value and transactions they are involved. In addition, Web3 directly connects businesses with customers, significantly reducing or eliminating middle layers.'
        }
      </AppArticle>
      <AppArticle>
        {
          "With the potential to revolutionize finance, supply chains, and digital asset transactions, effective digital asset management is important. Blockchain wallets address the need by securely storing users' public and private keys while providing an intuitive interface for managing crypto assets. A wallet allows users to track their assets, create transactions, and interact with decentralized applications (dApps). The role of wallets in the Web3 ecosystem is important. Considering the advantages and disadvantages of the most common wallet type, Externally Owned Accounts (EOAs), this thesis proposes a novel blockchain wallet mechanism and discusses its potential improvements."
        }
      </AppArticle>
      <Section1Sub1 />
      <Section1Sub2 />
      <Section1Sub3 />
    </ChapterBox>
  );
}
