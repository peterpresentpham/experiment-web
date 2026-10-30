import { AppArticle } from 'src/components/box/ArticleBox';
import ChapterBox from 'src/components/Thesis/ChapterBox';
import AAPrivacy from './AAPrivacy';
import Challenge from './Challenge';
import Erc4337 from './erc4337';
import NeedForAA from './NeedForAA';

export default function Chapter3() {
  return (
    <ChapterBox id="chapter3" title="ACCOUNT ABSTRACTION">
      <AppArticle isFirst>
        {
          'This chapter discusses different limitations of the current blockchain account model. Moreover, this chapter introduces the fundamental aspects of account abstraction, with a particular focus on ERC-4337 and its components. This chapter also presents recent privacy issues within the context of account abstraction. While privacy is a critical issue in blockchain systems, it is rarely discussed in account abstraction. By presenting recent developments, this chapter aims to provide useful references for further research.'
        }
      </AppArticle>
      <Challenge />
      <NeedForAA />
      <Erc4337 />
      <AAPrivacy />
    </ChapterBox>
  );
}
