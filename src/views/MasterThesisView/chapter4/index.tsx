import { AppArticle } from 'src/components/box/ArticleBox';
import ChapterBox from 'src/components/Thesis/ChapterBox';
import ArchitecturalOverview from './ArchitecturalOverview';
import RecoveryMechanism from './RecoveryMechanism';
import ZKPMechanism from './ZKPMechanism';

export default function Chapter4() {
  return (
    <ChapterBox id="chapter4" title="DESIGNING THE WALLET ARCHITECTURE">
      <AppArticle isFirst>
        {
          'In this chapter, we propose an account abstraction wallet design that implements a guardian mechanism as a recovery solution. The mechanism operates with a threshold system and a time delay to enhance security. Additionally, we integrate zero-knowledge proofs into this design to continuously improve its privacy.'
        }
      </AppArticle>
      <ArchitecturalOverview />
      <RecoveryMechanism />
      <ZKPMechanism />
    </ChapterBox>
  );
}
