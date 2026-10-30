/* eslint-disable quotes */
import { AppArticle, ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/shadcn/table';
import RefLink from 'src/components/Thesis/RefLink';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';
import TableBox from 'src/components/Thesis/TableBox';

export default function SetupProcess() {
  return (
    <SubsectionBox id="setup-process" title="Setup process">
      <AppArticle isFirst>
        {
          'The setup stage occurs only the first time when the owner needs to initialize the guardian configuration parameters, which are listed in the Table~\ref{table:setup-configuration-parameters}. Only the owner can execute the setup stage, but unlike other transactions that are only executed by the owner, the setup stage does not have to wait for a delay; it is activated immediately after the owner executes it. In addition, the initial parameters must follow some characteristics:'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          {
            'Threshold must be greater than 0 and less than or equal to the total number of guardians.'
          }
        </ArticleLI>
        <ArticleLI>
          {
            'Number of guardians must be less than or equal to the predefined constant maxGuardian in the smart contract.'
          }
        </ArticleLI>
        <ArticleLI>{'Each guardian must be distinct, and none can be the zero address.'}</ArticleLI>
      </ArticleUL>
      <TableBox id="setup-configuration-parameters" title="Setup configuration parameters">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2}>Parameter</TableHead>
              <TableHead colSpan={2}>Type</TableHead>
              <TableHead colSpan={8}>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2}>
                <p className="italic">guardians</p>
              </TableCell>
              <TableCell colSpan={2}>uint[]</TableCell>
              <TableCell colSpan={8}>
                <p>
                  {
                    'The list of initial guardians. Instead of the list of addresses, guardians is a list of units because we store the hash of the guardians account address instead of the plain addresses (the feature will be demonstrated in more detail in '
                  }
                  <RefLink toId="zkp-based-guardian-mechanism" mode="section" />)
                </p>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>
                <p className="italic">threshold</p>
              </TableCell>
              <TableCell colSpan={2}>uint256</TableCell>
              <TableCell colSpan={8}>
                <p>{"The minimum amount of guardian's confirmations to change ownership."}</p>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>
                <p className="italic">expirePeriod</p>
              </TableCell>
              <TableCell colSpan={2}>uint256</TableCell>
              <TableCell colSpan={8}>
                <p>
                  {
                    "Expire time, after this time, owners can't execute their queue transactions. The expiration time variable is the maximum time a queue transaction can be executed."
                  }
                </p>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>
                <p className="italic">delay</p>
              </TableCell>
              <TableCell colSpan={2}>uint256</TableCell>
              <TableCell colSpan={8}>
                <p>
                  {
                    "Owners aren't allowed to execute queue transactions immediately, they must wait a delay time and execute it after instead. The delay variable is the minimum value that owners must wait for."
                  }
                </p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableBox>
      <AppArticle isFirst>
        {'According to '}
        <RefLink toId="sok" mode="cite" />
        {
          ', only two out of three properties: usability, strong security, and high availability, can be achieved at the same time. In the context of a (t, n)-guardian mechanism, where t represents the threshold and n the number of guardians, we consider three possible configurations:'
        }
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">Usability and availability</span>
          {
            ' (t=2, n=5): This setup is usable (as recovery requires only five guardians) and available (only two confirmations are needed for recovery). However, it lacks strong security because an attacker only needs to compromise two guardians to take control of the account.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Security and usability</span>
          {
            ' (t=4, n=5): It is usable (recovery requires only five guardians) and secure (attacker must compromise four guardians to take control of the account). However, it may be unavailable because requiring four guardians to be ready at the same time is difficult.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="italic">Security and availability</span>
          {
            ' (t=4, n=10): This setup provides both high security and availability, but it loses usability. Finding ten secure and reliable guardians can be impractical for most users.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        {
          'Considering this trade-off, we define maxGuardian as a constant in the smart contract to balance usability, security, and availability effectively.'
        }
      </AppArticle>
    </SubsectionBox>
  );
}
