'use client';

import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';

export default function Section1Sub2() {
  return (
    <SectionBox id="section1_2" title="Our Contributions">
      <AppArticle isFirst>
        The primary contributions of the thesis are to introduce account abstraction and related
        concepts. After that, this thesis proposes the implementation of a zero-knowledge recovery
        mechanism for account abstraction based on ERC-4337. Specifically, our contributions will be
        presented in <RefLink toId="chapter4" mode="chapter" /> and{' '}
        <RefLink toId="chapter5" mode="chapter" />, including:
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">A recoverable account abstraction solution</span>. We propose an
          account abstraction wallet architecture to remove a single private key concern, therefore
          eliminating the risk of permanent asset loss. Furthermore, we present a zero-knowledge
          recovery solution based on guardians to hide guardian addresses on-chain.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Implementation and Evaluation</span>. We deploy a web
          application, a smart contract system, and a simple bundler to test and validate the
          proposed account abstraction architecture.
        </ArticleLI>
      </ArticleUL>
    </SectionBox>
  );
}
