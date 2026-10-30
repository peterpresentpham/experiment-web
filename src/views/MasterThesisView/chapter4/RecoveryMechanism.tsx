import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import SectionBox from 'src/components/Thesis/SectionBox';
import ChangeOwnershipProcess from './ChangeOwnershipProcess';
import SetupProcess from './SetupProcess';
import UpdatingProcess from './UpdatingProcess';

export default function RecoveryMechanism() {
  return (
    <SectionBox
      id="guardian-based-account-abstraction-recovery-mechanism"
      title="Guardian-based Account Abstraction Recovery Mechanism"
    >
      <AppArticle isFirst>
        {
          'This section explains the proposed guardian-based account abstraction recovery mechanism. It provides a detailed explanation of the complete workflow, including the initialization of guardians, modification of contract parameters, and the process of ownership recovery.'
        }
      </AppArticle>
      <AppArticle>
        {
          'The proposal is based on the guardian mechanism, which allows trusted individuals or entities to assist users in regaining access to their accounts when necessary, providing a secure and decentralized approach to account recovery by implementing smart contracts. The proposal is divided into three processes:'
        }
      </AppArticle>
      <ArticleUL className="list-decimal">
        <ArticleLI>
          <span className="italic">setup process</span>
          {': This process initializes the guardian configuration parameters.'}
        </ArticleLI>
        <ArticleLI>
          <span className="italic">updating process</span>
          {': This process updates the guardian configuration parameters after setting up.'}
        </ArticleLI>
        <ArticleLI>
          <span className="italic">change ownership process</span>
          {': this process supports the owner can change ownership.'}
        </ArticleLI>
      </ArticleUL>
      <SetupProcess />
      <UpdatingProcess />
      <ChangeOwnershipProcess />
    </SectionBox>
  );
}
