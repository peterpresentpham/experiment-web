import { AppArticle } from 'src/components/box/ArticleBox';
import AppendixBox from 'src/components/Thesis/AppendixBox';
import RecoveryMethods from './recovery-methods';
import RecoveryWallets from './recovery-wallets';

export default function RecoverySolution() {
  return (
    <AppendixBox id="recovery-solution" title="Recovery Methods and Wallets">
      <AppArticle>
        {
          'This appendix outlines several important account recovery methods and existing recovery wallets currently used in blockchain systems.'
        }
      </AppArticle>
      <RecoveryMethods />
      <RecoveryWallets />
    </AppendixBox>
  );
}
