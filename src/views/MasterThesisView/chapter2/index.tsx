import { AppArticle } from 'src/components/box/ArticleBox';
import ChapterBox from 'src/components/Thesis/ChapterBox';
import AccountSystem from './AccountSystem';
import Blockchain from './blockchain';
import SmartContract from './SmartContract';
import ZeroKnowledgeProof from './zero-knowledge-proof';

export default function Chapter2() {
  return (
    <ChapterBox id="chapter2" title="LITERATURE REVIEW">
      <AppArticle isFirst>
        This chapter provides a foundation of key concepts relevant to the thesis. The relevant
        concepts include blockchain technology, account system, and smart contract in blockchain.
        The chapter then presents zero-knowledge proofs, a novel and increasingly important concept
        in the Web3 space. Finally, it outlines zk-SNARKs, one of the most widely used and
        well-suited forms of zero-knowledge proofs in Web3 applications.
      </AppArticle>
      <Blockchain />
      <AccountSystem />
      <SmartContract />
      <ZeroKnowledgeProof />
    </ChapterBox>
  );
}
