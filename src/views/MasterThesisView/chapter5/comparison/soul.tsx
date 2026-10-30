/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import FigureBox from 'src/components/Thesis/FigureBox';
import ProgramBox from 'src/components/Thesis/ProgramBox';
import RefLink from 'src/components/Thesis/RefLink';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';
import { IMAGES } from 'src/configs/images';
import { soulCode } from '../code';

export default function Soul() {
  return (
    <SubsectionBox id="soul" title="Soul wallet vs. the proposed wallet">
      <AppArticle isFirst>
        {
          'Soul Wallet is a guardian-based ERC-4337 wallet that uses Web3 accounts as guardians. Similar to the proposed wallet in this thesis, guardians in Soul Wallet only participate when the owner initiates a change to a new address. Both wallets adopt a delayed execution mechanism, meaning that actions such as adding or removing a guardian are not performed immediately but instead require a predefined waiting period.'
        }
      </AppArticle>
      <AppArticle>
        {
          'However, in Soul Wallet, the guardian addresses are stored in the smart contract in a hashed form (using the Keccak256 hash function) and are only revealed during the ownership change process. In contrast, the proposed wallet uses ZKP to verify guardians without ever revealing their identities on-chain, thereby enhancing privacy.'
        }
      </AppArticle>
      <FigureBox
        id="common-recovery-process"
        alt="common-recovery-process"
        title="Common recovery process used by Soul wallet and the proposed wallet"
        src={IMAGES.master.chapter5.soulWallet}
      />
      <AppArticle isFirst>
        <RefLink toId="common-recovery-process" /> shows the common recovery process used by Soul
        wallet and the proposed wallet. Both wallets divide the recovery process into three steps,
        with several differences:
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">Submit new owner</span>
          {
            ': A transaction is executed to store the new address in the smart contract. In Soul wallet, the transaction can be executed by anyone instead of only by the owner in the proposed wallet.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Confirm change owner</span>
          {
            ': In both Soul Wallet and the proposed wallet, guardians perform the recovery process by submitting proof or a signature. Specifically, in the proposed wallet, guardians submit zero-knowledge proofs, whereas in Soul Wallet, they provide signatures. Once the threshold is met, both wallets unlock a function that allows the owner address to be changed.'
          }
          <AppArticle>
            An important difference is how guardian identities are handled during this process. In
            Soul Wallet, guardians must reveal their raw addresses (as shown in Program{' '}
            <RefLink toId="schedule-a-recovery-operation" mode="program" />, where the rawGuardian
            parameter and signature are used to verify their identity). This approach exposes
            guardian information on-chain, which can potentially be linked to the owner through
            external analysis. In contrast, the proposed wallet hides guardian identities by using
            ZKP, ensuring that guardian identities remain hidden even during the recovery process.
          </AppArticle>
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Change owner</span>
          {
            ': In both wallets, the transaction to change owner can be executed by anyone. The difference is the delay time before executing the transaction in Soul wallet. In the proposed wallet, the delay time is unnecessary because enough valid guardians agree to change owner, so a delay time is inconvenient.'
          }
        </ArticleLI>
      </ArticleUL>
      <ProgramBox
        id="schedule-a-recovery-operation"
        title="Schedules a recovery operation for a wallet"
        code={{ language: 'solidity', code: soulCode }}
      />
      <AppArticle>{'In conclusion, the two wallets differ in three key aspects:'}</AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          {
            'In Soul Wallet, anyone can execute the submission of a new owner, whereas in the proposed wallet, only the current owner can perform this action.'
          }
        </ArticleLI>
        <ArticleLI>
          {
            "In Soul Wallet, guardians' addresses are revealed after they confirm the ownership change, while in the proposed wallet, this does not occur."
          }
        </ArticleLI>
        <ArticleLI>
          {
            'Soul Wallet enforces a delay before the ownership change transaction can be executed, whereas the proposed wallet does not.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'Difference (1) is an advantage of Soul wallet, as guardians are considered trusted entities and only confirm when they recognize that the submission comes from an authorized owner. Differences (2) and (3) are advantages of the proposed wallet, as they enhance privacy and improve user convenience.'
        }
      </AppArticle>
    </SubsectionBox>
  );
}
