/* eslint-disable react/no-unescaped-entities */
import { AppArticle } from 'src/components/box/ArticleBox';
import SectionBox from 'src/components/Thesis/SectionBox';

export default function Section1Sub1() {
  return (
    <SectionBox id="section1_1" title="Motivation">
      <AppArticle isFirst>
        EOAs are the most widely used type of blockchain wallet today. An EOA wallet allows users to
        control their accounts and assets. There are two main types of EOA wallets: (1) hardware
        wallets (cold wallets), such as Ledger or Trezor, and (2) software wallets (hot wallets),
        such as MetaMask or Fire. A hardware wallet is a physical device that stores the user's
        private key offline. Because each transaction requires approval from the physical device,
        hardware wallets are a highly secure option for EOA. In contrast, a software wallet is an
        application or browser extension that allows users to quickly and conveniently access their
        assets.
      </AppArticle>
      <AppArticle>
        All EOA wallets are controlled by a private key, which serves as the user's unique signature
        and key to accessing the EOA wallet. EOAs are easy to use, making account creation and
        management straightforward. In addition, they provide users with complete control: only the
        person who holds the private key can manage and control the wallet, all associated assets,
        and transaction execution.
      </AppArticle>
      <AppArticle>
        However, EOA wallets have several limitations. Because they are based entirely on a private
        key for security and ownership verification, there is no way to recover a lost private key.
        If users lose their private key, they lose access to all assets in the wallet, a problem
        that is nearly impossible to solve in practice. Some recovery methods, such as mnemonic seed
        phrases, have been implemented to reduce this risk. However, while seed phrases help users
        recover a lost private key, they do not provide a solution to recover ownership of the
        wallet itself.
      </AppArticle>
      <AppArticle>
        Furthermore, while EOAs are suitable for basic transfers and dApp interactions, implementing
        advanced functionality or custom logic within EOAs is a challenge. EOAs basically only
        consist of a key pair and a few cryptographic algorithms for verifying ownership when users
        interact with their assets. Moreover, it is impossible to integrate a new signature
        algorithm or implement a recovery mechanism.
      </AppArticle>
      <AppArticle>
        In contrast, smart contract wallets, which operate based on predefined logic defined in the
        smart contract code, can implement advanced functionality and custom logic. By using
        flexible predefined logic, smart contract wallets can support various functionalities,
        including gas fee optimization, transaction batching, multi-sig management, and complex
        security structures. Unlike EOAs, smart contract wallets can implement mechanisms for
        account recovery when a lost or compromised private key occurs.{' '}
      </AppArticle>
      <AppArticle>
        Despite their advantages, smart contract wallets still face challenges such as usability and
        security concerns. This thesis aims to address the drawbacks of EOA wallets by proposing a
        novel wallet mechanism that improves user experience and introduces a secure recovery model.
      </AppArticle>
    </SectionBox>
  );
}
