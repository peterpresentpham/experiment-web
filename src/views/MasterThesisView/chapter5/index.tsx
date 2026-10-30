import { AppArticle } from 'src/components/box/ArticleBox';
import ChapterBox from 'src/components/Thesis/ChapterBox';
import RefLink from 'src/components/Thesis/RefLink';
import Comparison from './comparison';
import Implementation from './implementation';
import Performance from './Performance';

export default function Chapter5() {
  return (
    <ChapterBox id="chapter5" title="IMPLEMENTATION AND EVALUATION">
      <AppArticle isFirst>
        {
          'This section discusses the implementation and evaluation of our system. For the implementation, we design and build a zk-SNARK circuit that encapsulates all necessary logic. We also deploy a bundler and develop a user interface where guardians and users can easily create and interact with their accounts and EdDSA key pairs.'
        }
      </AppArticle>
      <AppArticle>
        {
          'We have published the source code of the webpage, bundler, circuit, and smart contract under the MIT license. Specifically, smart contract (including circuit), webpage, and bundler can be found in '
        }
        <RefLink toId="my-aa-contract" mode="cite" />, <RefLink toId="my-aa-ui" mode="cite" />, and{' '}
        <RefLink toId="my-aa-bundler" mode="cite" />, respectively.
      </AppArticle>
      <Implementation />
      <Comparison />
      <Performance />
    </ChapterBox>
  );
}
