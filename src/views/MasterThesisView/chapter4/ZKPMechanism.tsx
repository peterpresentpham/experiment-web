/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import SectionBox from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';
import Choosing from './Choosing';
import ProposedProcess from './ProposedProcess';

export default function ZKPMechanism() {
  return (
    <SectionBox title="Zero-Knowledge-Based Guardian Mechanism" id="zkp-based-guardian-mechanism">
      <AppArticle isFirst>
        {
          'In this section, we describe how ZKPs are implemented in our architecture and the reason behind several key design decisions.'
        }
      </AppArticle>
      <AppArticle>
        {'As discussed in '}
        <RefLink toId="change-ownership-process" mode="subsection" />
        {
          ", storing plain guardian addresses on-chain is insecure. To eliminate this, we store only the hashed form of each guardian's address. However, verifying a guardian's authorization by comparing a submitted hash with a stored hash is not sufficient because everyone has access to the guardian's address, and they can compute the hash of the guardian's address. Even if they are equal, we cannot be certain that the sender actually controls the corresponding guardian account."
        }
      </AppArticle>
      <FigureBox
        src={IMAGES.master.chapter4.overallConfirmOwner}
        id="overall-confirm-change-owner-process"
        alt="overall-confirm-change-owner-process"
        title="Overall confirm change owner process."
      />
      <AppArticle isFirst>
        <RefLink toId="overall-confirm-change-owner-process" />
        {
          ' illustrates the overall confirm change owner process. The process has two primary phases:'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          {
            'in the off-chain phase, a valid guardian signs a message and uses the signature to produce a proof.'
          }
        </ArticleLI>
        <ArticleLI>
          {
            'in the on-chain phase, the proof is verified, and if it is valid, the change owner process will be run.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        To ensure the verification does not reveal any information about the guardians, the process
        is implemented through ZKPs (the dashed rectangle in{' '}
        <RefLink toId="overall-confirm-change-owner-process" />
        ). By using ZKPs, the on-chain phase only needs to verify the proof, that is not reveal data
        about guardians.
      </AppArticle>
      <AppArticle>
        {
          "The proof must include the guardian's address. This requirement exists for two reasons. First, the smart contract must compare the hash from the submitted proof to the hashes it stores to ensure that the guardian is an authorized guardian. Since the ZKP protocol does not have access to the list of hashes stored in the smart contract, the hash must be submitted to the contract. Second, the guardian's address should not be submitted directly to the smart contract without going through the ZKP protocol. If a guardian's address is compromised, an attacker could submit the guardian's address hash along with their own signature, which would be a valid signature but from an invalid guardian, to the smart contract. Based on the above argument, the proposed ZKP protocol must have three characteristics:"
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          {'It receives the signature and the guardian public key as the inputs.'}
        </ArticleLI>
        <ArticleLI>
          {
            'It verifies the signature to ensure that the guardian is the owner of the valid key pair.'
          }
        </ArticleLI>
        <ArticleLI>
          {
            'It hashes the guardian public key and returns it as public output to the smart contract can perform the comparison process. '
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          "The proposed ZKP protocol must perform two massive operations: (1) verifying the guardian's signature and (2) hashing the guardian's address. Inefficient cryptography can significantly reduce performance, so selecting the right components is critical. In particular, we faced two major design challenges:"
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>{'Choosing a sufficient hash function.'}</ArticleLI>
        <ArticleLI>{'Choosing a sufficient curve signature algorithm.'}</ArticleLI>
      </ArticleUL>
      <Choosing />
      <ProposedProcess />
    </SectionBox>
  );
}
