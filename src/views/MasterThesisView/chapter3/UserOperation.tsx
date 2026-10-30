/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';

export default function UserOperation() {
  return (
    <SubsectionBox id="user-operation" title="UserOperation">
      <AppArticle isFirst>
        {
          "A UserOperation is a new data structure that packages the user's intended actions. Unlike traditional Ethereum transactions, it is not sent directly to the network, but instead stored in a mempool. A UserOperation contains various fields that are different from traditional transactions. Some of the important fields of a UserOperation include the following:"
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">sender</span>:{' '}
          {'The address of the account that will execute and validate the operation.'}
        </ArticleLI>
        <ArticleLI>
          <span className="italic">nonce</span>
          {': A unique identifier to prevent replay attacks and ensure operation order.'}
        </ArticleLI>
        <ArticleLI>
          <span className="italic">initCode</span>
          {
            ': Initialization code for deploying a new smart account (if it does not yet exist). Empty if the account already exists.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">callData</span>
          {
            ': The data specifying the function call and its arguments defines the actual operation the user wants to perform.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">signature</span>
          {
            ": A cryptographic signature or other proof mechanism to validate the operation's authenticity."
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">callGasLimit</span>
          {': The amount of gas that the sender is willing to spend for the main execution.'}
        </ArticleLI>
        <ArticleLI>
          <span className="italic">verificationGasLimit</span>
          {': The amount of gas that the sender is willing to spend for the verification step.'}
        </ArticleLI>
      </ArticleUL>
    </SubsectionBox>
  );
}
