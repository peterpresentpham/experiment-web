/* eslint-disable quotes */
import { AppArticle } from 'src/components/box/ArticleBox';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';

export default function Bundler() {
  return (
    <SubsectionBox id="bundler" title="Bundler">
      <AppArticle>
        {
          'A bundler is a specialized node or actor in the ERC-4337 architecture that aggregates multiple UserOperations into a single transaction. Instead of submitting individual transactions to the blockchain network, the bundler groups several UserOperations into a batch and submits them as a single transaction. This batching mechanism reduces transaction costs, network congestion, and enables advanced account functionality beyond the limitations of EOAs.'
        }
      </AppArticle>
      <AppArticle>
        {
          'The operation of a bundler typically consists of four stages: (1) monitoring UserOperations, (2) batching UserOperations, (3) submitting the batch to the EntryPoint contract, and (4) receiving incentives.'
        }
      </AppArticle>
      <AppArticle>
        {
          'To monitor the UserOperation, the bundler uses a dedicated mempool, an off-chain queue specific to ERC-4337, to hold pending UserOperations. When a user submits a UserOperation, it is placed in this mempool, waits to be selected by the bundler. The ERC-4337 mempool operates off-chain and is intended to follow its own protocol rules.'
        }
      </AppArticle>
      <AppArticle>
        {
          'Once the bundler detects valid UserOperations, it aggregates multiple operations into a single transaction. Normally, both before add a UserOperation to the mempool and before batching a single transaction, the bundler uses simulateValidation function of EntryPoint contract to validate UserOperation parameters and ensure UserOperation can be executed at the time it is validated.'
        }
      </AppArticle>
      <AppArticle>
        {
          "When one of the predefined events occurs (typically defined by developers, such as when the number of UserOperations on mempool or the pending time is enough), the bundler will submit a batch of UserOperations into EntryPoint contract. EntryPoint will verify each UserOperation and execute them according to the specified logic in the user's contract account."
        }
      </AppArticle>
      <AppArticle>
        {
          'Bundlers are incentivized to perform this aggregation task by earning gas fees and potential additional rewards from the users whose operations they include in the batch. These fees are typically paid in ERC-20 tokens or other assets, depending on the account abstraction logic.'
        }
      </AppArticle>
    </SubsectionBox>
  );
}
