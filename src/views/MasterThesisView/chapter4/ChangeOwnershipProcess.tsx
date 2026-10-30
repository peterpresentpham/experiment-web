/* eslint-disable react/no-unescaped-entities */
/* eslint-disable quotes */

import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import AlgorithmBox from 'src/components/Thesis/AlgorithmBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';
import { submitNewOwnerCode } from './code';

export default function ChangeOwnershipProcess() {
  return (
    <SubsectionBox id="change-ownership-process" title="Change ownership process">
      <FigureBox
        id="the-change-ownership-process"
        alt="the-change-ownership-process"
        title="The change ownership process."
        src={IMAGES.master.chapter4.changeOwnershipProcess}
      />
      <AppArticle isFirst>
        The final action supported by the guardian mechanism is the change of ownership, as
        illustrated in <RefLink toId="the-change-ownership-process" />. This process is divided into
        three steps:
      </AppArticle>
      <ArticleUL className="ml-4 list-decimal">
        <ArticleLI>
          {'The owner submits a new owner address. The step is only executed by the owner.'}
        </ArticleLI>
        <ArticleLI>
          {
            'The guardians generate their zero-knowledge proofs and submit their proofs to the smart contract system.'
          }
        </ArticleLI>
        <ArticleLI>
          {
            'Once the required number of valid proofs from guardians is collected, the smart contract system unlocks a special transaction to change ownership. It is important to note that at this stage, anyone can execute the transaction, as all validations and verifications have already been completed in the previous steps. The transaction simply updates the owner to the new address designated by the old owner in Step 1.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'Because it is a sensitive process, it is irreversible and blocks all other actions until they are completed.'
        }
      </AppArticle>
      <AppArticle>
        {
          "If the current owner notices that their ownership may have been compromised, the owner can initiate the ownership transfer by submitting a new owner address, stored temporarily on-chain in the ZKRecovery smart contract. The new owner's address must satisfy the following conditions:"
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>{'It must not be zero address.'}</ArticleLI>
        <ArticleLI>
          {"The new owner's address must be different from the current owner's address."}
        </ArticleLI>
        <ArticleLI>
          {
            'The account address calculated from the new owner address by the account factory smart contract is an undeployed address.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          "The first and second conditions ensure the validity of the new owner's address, and the third condition makes sure that the new owner's address is unique and available. "
        }
        <RefLink toId="submitNewOwner" mode="algorithm" />
        {' illustrates the logic behind the submitNewOwner function.'}
      </AppArticle>
      <AlgorithmBox
        id="submitNewOwner"
        title="submitNewOwner function"
        algorithm={submitNewOwnerCode}
      />
      <AppArticle isFirst>
        {
          "Submitting a new owner address does not automatically change ownership. Instead, it is a notice to the guardians. Traditionally, each guardian signs a message, including the new owner's address, and submits it to the smart contract. Once the threshold is reached, the smart contract verifies all signatures and processes the transfer of ownership. The traditional approach is easy to implement, but it has several drawbacks"
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          {
            'If any guardian provides an invalid signature, all guardians may have to sign again, or the batch signature must be recalculated, reducing reliability.'
          }
        </ArticleLI>
        <ArticleLI>
          {
            'To verify signatures on-chain, the smart contract must store guardian addresses in plain form to compare with the address in the signature, which risks leaking sensitive information.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        The proposed design uses ZKPs to overcome the limitations of the traditional approach. The
        smart contract stores the hash of each guardian's address instead of the plaintext address.
        Each guardian independently creates and submits their proof on-chain. The proof creation and
        verification process (referred to as the confirm change owner process, represented by the
        green square in <RefLink toId="the-change-ownership-process" /> is discussed in detail in{' '}
        <RefLink toId="zkp-based-guardian-mechanism" mode="section" />. The smart contract verifies
        each proof and records its validity. Once the number of valid confirmations reaches the
        required threshold, the smart contract unlocks the ownership change function.
      </AppArticle>
    </SubsectionBox>
  );
}
