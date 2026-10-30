/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import ProgramBox from 'src/components/Thesis/ProgramBox';
import RefLink from 'src/components/Thesis/RefLink';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';
import { entryPointCode } from './code';

export default function EntryPoint() {
  return (
    <SubsectionBox id="entrypoint" title="EntryPoint">
      <AppArticle>
        {
          'EntryPoint is a middle layer between bundlers and smart contract wallets. Its primary features are verification, execution, and gas calculation for UserOperation objects. The core interface of the EntryPoint contract is illustrated in the '
        }
        <RefLink toId="interface-of-the-entry-point-contract" mode="program" />
        {
          '. Notably, the keyword UserOperation[] in line 3 denotes an array of UserOperation instances, each of which is processed by the EntryPoint during execution.'
        }
      </AppArticle>
      <ProgramBox
        id="interface-of-the-entry-point-contract"
        title="The core interface of the entry point contract"
        code={{ language: 'solidity', code: entryPointCode }}
      />
      <AppArticle isFirst>
        {'EntryPoint has two significant methods, handleOps and handleAggregatedOps.'}
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">handleOps</span>
          {
            ' processes a UserOperations batch that does not rely on signature aggregation. It follows a strict validation and execution workflow for each operation.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">handleAggregatedOps</span>
          {
            ' extends the logic of handleOps, allowing support for signature aggregators. This enables bundlers to process UserOperations from multiple users who share the same aggregator, improving scalability and reducing gas costs.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'In a typical setting without a Paymaster, the handleOps method operates in two main phases: the verification loop and the execution loop.'
        }
      </AppArticle>
      <AppArticle>
        {
          'For each UserOperation in the batch, the EntryPoint performs the following steps in the verification loop:'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          {
            'Account deployment: If the account does not exist, it deploys the account using initCode parameter. If initCode is empty or the deployment fails, the operation must fail.'
          }
        </ArticleLI>
        <ArticleLI>
          {
            "Validation: The EntryPoint call method validateUserOp for each UserOperation. This method verifies the signature, nonce form, and pre-pays the required gas fees. If any call to validateUserOp fails, the corresponding UserOperation is skipped or reverted, depending on the bundler's architecture and the surrounding configuration."
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'After verification loop, the EntryPoint executes each valid UserOperation in the execution loop. The EntryPoint calls the account contract using the callData parameter provided in the UserOperation. Typically, the wallet includes an execute() function that decodes the data and carries out one or more internal calls accordingly.'
        }
      </AppArticle>
    </SubsectionBox>
  );
}
