import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import SectionBox from 'src/components/Thesis/SectionBox';

export default function Section1Sub3() {
  return (
    <SectionBox id="section1_3" title="Thesis Organization">
      <AppArticle isFirst>The rest of this thesis is organized as follows:</AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="font-bold">Chapter 2</span>{' '}
          {
            'introduces relevant concepts, including blockchain fundamentals, account system in blockchain, the smart contract, and zero-knowledge proofs.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Chapter 3</span>{' '}
          {
            'discusses the challenges of the current blockchain account model and the need for account abstraction. It also provides an overview of account abstraction mechanisms based on ERC-4337. The chapter also provides knowledge about privacy in account abstraction, including implementations of privacy in account abstraction and several its limitations.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Chapter 4</span>{' '}
          {
            'describes the proposed system architecture. The chapter focuses on the integration of the recovery method with zero-knowledge proofs to verify and change ownership without revealing guardian identities.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Chapter 5</span>{' '}
          {
            'This chapter discusses the implementation environment, including the technologies used for deployment, metadata management, and system configuration. It also presents several comparisons between existing recovery wallet solutions and the wallet proposed in this thesis, highlighting key differences in architecture and recovery mechanisms. Furthermore, the chapter evaluates the performance of the proposed approach by measuring proof generation time, verification time, and on-chain gas costs.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Chapter 6</span>{' '}
          {
            'presents the research results and suggests directions for future work. The chapter summarizes the proposed solution and its contributions to addressing the identified challenges. It also outlines potential improvements and promising areas for further development.'
          }
        </ArticleLI>
      </ArticleUL>
    </SectionBox>
  );
}
