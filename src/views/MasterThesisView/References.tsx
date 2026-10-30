import CiteBox from 'src/components/Thesis/CiteBox';
import SameChapterBox from 'src/components/Thesis/SameChapterBox';
import { MasterReferences } from 'src/configs/master-thesis.config';

export default function References() {
  return (
    <SameChapterBox id="reference" mode="reference">
      {MasterReferences.map((reference) => {
        return <CiteBox key={reference.id} cite={reference} />;
      })}
    </SameChapterBox>
  );
}
