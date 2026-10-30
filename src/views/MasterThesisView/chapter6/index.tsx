/* eslint-disable quotes */
import { AppArticle } from 'src/components/box/ArticleBox';
import ChapterBox from 'src/components/Thesis/ChapterBox';
import RefLink from 'src/components/Thesis/RefLink';

export default function Chapter6() {
  return (
    <ChapterBox id="chapter6" title="CONCLUSION AND FUTURE WORK">
      <AppArticle isFirst>
        {
          'This thesis has demonstrated several problems with the current account model, EOA, and CA, how the problems can be addressed by account abstraction, and proposed an approach to secure and privacy-preserving wallet recovery by guardian-based recovery and zero-knowledge proof in the context of account abstraction wallet. Traditional social recovery, while effective, may expose potential vulnerabilities. By leveraging zero-knowledge proof, this research demonstrates how users can prove ownership to recover their assets without revealing sensitive information, ensuring a robust balance between usability, privacy, and security.'
        }
      </AppArticle>
      <AppArticle>
        {
          "The proposed wallet focuses on storing hashes of the guardians' addresses on-chain, rather than storing the plain-text addresses directly. To verify that a guardian is valid, we use zero-knowledge proofs. Each guardian generates a proof using a ZKP, which is then submitted to the smart contract system to verify that the guardian is authorized. Once the smart contract collects enough valid proofs, it unlocks a special transaction to change ownership. At this point, the transaction can be executed by anyone, as all verifications have already been completed. Additionally, we also provide evaluations to select the hash function and elliptic curve algorithm that are friendly in the zero-knowledge circuit and suitable for the application requirements. In this thesis, we use the Poseidon hash function and the BabyJubJub elliptic curve to implement and evaluate our system."
        }
      </AppArticle>
      <AppArticle>
        However, the proposed wallet still has several drawbacks. A significant issue is in the
        change owner process (<RefLink toId="change-ownership-process" mode="subsection" />
        ), the transaction of submission of the new owner address can only be performed by the
        current owner. However, if the current owner lost her/his private key and is unable to sign
        the submission transaction, so the current mechanism does not work. As a result, the current
        mechanism only works in situations that the owner still controls her/his account, such as in
        cases of key compromise or leakage to a hacker. The proposed solution is to remove this
        restriction, allowing anyone to submit the new owner address. This solution is based on the
        assumption that guardians are trusted and will only participate in the change owner process
        if they are confident that the authorized owner initiated the request.
      </AppArticle>
      <AppArticle>
        {
          'The proposed architecture has much potential for improvement and development. The future works will focus on fixing existing problems and improving the gas cost and the time a transaction takes to execute. We will implement some novel features, such as paymaster, maximum amount of special transactions, or delay time after a massive transaction. Moreover, we will use zero-knowledge proof more extensively in the architecture. For example, in the current design, zero-knowledge proof is used to hide guardian addresses, but in the future version, zero-knowledge proof can be used to hide transaction parameters, such as amount, token address, and receive address.'
        }
      </AppArticle>
    </ChapterBox>
  );
}
