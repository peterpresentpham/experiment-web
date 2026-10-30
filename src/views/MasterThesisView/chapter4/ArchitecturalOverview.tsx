/* eslint-disable quotes */
import { AppArticle } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';

export default function ArchitecturalOverview() {
  return (
    <SectionBox id="architectural-overview" title="Architectural Overview">
      <FigureBox
        id="common-architecture"
        alt="common-architecture"
        title="Overview architecture of the proposed system"
        src={IMAGES.master.chapter4.commonArchitecture}
      />
      <AppArticle isFirst>
        <RefLink toId="common-architecture" />
        {
          ' illustrates the proposed architecture of the guardian-based recovery mechanism based on ERC-4337 with a zero-knowledge proof to improve privacy. Overall, users interact with the system through a user interface, which constructs UserOperations according to ERC-4337. The UserOperations is then sent to a bundler. The bundler stores UserOperations in the alternative mempool and uses internal services to batch, validate, and submit valid UserOperations to EntryPoint contract.'
        }
      </AppArticle>
      <AppArticle>
        {
          "The architecture's on-chain system has four primary smart contracts: EntryPoint, AccountFactory, Account, and the ZKRecovery} smart contract. The EntryPoint contract is the central component for executing and verifying UserOperations on-chain. It performs two primary functions: verifying UserOperation and executing UserOperation ("
        }
        <RefLink toId="entrypoint" mode="subsection" />
        {
          '). Additionally, the system introduces ZKRecovery, a different component compared to the original ERC-4337 structure. The ZKRecovery smart contract enables all functionalities that are relevant to ZKPs in the system.'
        }
      </AppArticle>
      <AppArticle>
        {
          'The system implements a privacy-preserving recovery mechanism that involves a group of n guardians, each holding a secret key pair. When owners want to change ownership, they notify their guardians. The guardians combine the notification with their key pairs to generate a credential, and then they submit it to ZKRecovery contract. ZKRecovery verifies the submitted credential using ZKPs. If the ZKGuardian collects enough valid proofs, it unlocks the ownership change function, allowing the owner, or any valid account, to fulfill the ownership transfer.'
        }
      </AppArticle>
    </SectionBox>
  );
}
