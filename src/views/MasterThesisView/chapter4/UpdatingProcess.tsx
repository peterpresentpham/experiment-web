/* eslint-disable react/no-unescaped-entities */
/* eslint-disable quotes */
import { AppArticle } from 'src/components/box/ArticleBox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/shadcn/table';
import FigureBox from 'src/components/Thesis/FigureBox';
import RefLink from 'src/components/Thesis/RefLink';
import { SubsectionBox } from 'src/components/Thesis/SectionBox';
import TableBox from 'src/components/Thesis/TableBox';
import { IMAGES } from 'src/configs/images';

export default function UpdatingProcess() {
  return (
    <SubsectionBox id="updating-process" title="Updating process">
      <FigureBox
        src={IMAGES.master.chapter4.updatingProcess}
        id="the-updating-process"
        alt="the-updating-process"
        title="The updating process"
      />
      <AppArticle isFirst>
        {
          'Once the guardian parameters are configured, owners can change them. Similar to the initial setup phase, only the owner can execute these changes. However, transactions can be executed after a time delay. This delay gives the account owner an opportunity to detect and respond to any malicious activities before the transaction is executed. The updating process consists of two phases: queuing and execution ( including aborting), as illustrated in '
        }
        <RefLink toId="the-updating-process" />.
      </AppArticle>
      <AppArticle>
        {
          "Queuing is the process of packing the owner's transaction data into an OwnerTransaction (details in "
        }
        <RefLink toId="variables-owner-transaction" mode="table" />
        {
          '). Queuing process assigns executedType value as 0, and pushes it to a list of OwnerTransactions. The variable eta of each OwnerTransaction defines the nearest time in the future when the owner can execute their transaction. It must be greater than or equal to the current time plus the delay defined in the setup process.'
        }
      </AppArticle>
      <TableBox id="variables-owner-transaction" title="Variables of OwnerTransaction">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <p>Variable</p>
              </TableHead>
              <TableHead>
                <p>Type</p>
              </TableHead>
              <TableHead>
                <p>Description</p>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <span className="italic">value</span>
              </TableCell>
              <TableCell>uint256</TableCell>
              <TableCell>Value of token sent with a transaction.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <span>data</span>
              </TableCell>
              <TableCell>bytes</TableCell>
              <TableCell>Transaction's callData.</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                <span>eta</span>
              </TableCell>
              <TableCell>uint256</TableCell>
              <TableCell>The closest time the owner can execute his transaction.</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                <span>executedType</span>
              </TableCell>
              <TableCell>uint8</TableCell>
              <TableCell>
                {
                  'Executed transaction status. 0 - queue status, the transaction is pending to execute; 1 - success; 2 - fail; 3 - cancel.'
                }
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                <span>_type</span>
              </TableCell>
              <TableCell>uint8</TableCell>
              <TableCell>
                {'Transaction type. 0 - add a guardian; 1 - remove a guardian; 2 - set threshold.'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableBox>
      <AppArticle isFirst>
        {
          'Execution is the phase where owners execute their transactions and save changes to the smart contract. If an owner chooses to cancel a transaction, the executedType of the OwnerTransaction is set to 3 (indicating canceled), preventing further execution of that transaction. For other cases, depending on the execution result, the executedType can be updated to 1 (success) or 2 (failure).'
        }
      </AppArticle>
      <AppArticle>
        {
          'Transactions can not be executed until the time delay has expired. Once this delay has expired, owners have a period defined by the expirePeriod (set during the initial setup phase) to execute their transaction. The combination of the delay, expirePeriod, and eta parameters creates a flexible mechanism for managing time delays in owner transactions. The relationship between the three parameters is illustrated in '
        }
        <RefLink toId="relation-time-delay" />.
      </AppArticle>
      <FigureBox
        id="relation-time-delay"
        alt="relation-time-delay"
        title="The relation between delay, expirePeriod and eta."
        src={IMAGES.master.chapter4.relationTimeDelay}
      />
      <AppArticle isFirst isMath>
        {
          'delay defines the minimum wait time before a transaction can be executed. eta defines the exact time when the owner can execute the transaction (eta $\\geq$ the time owner queue transaction + delay). expirePeriod} is the valid period during which the owner can execute the transaction. After this period, the transaction is considered expired and can no longer be executed.'
        }
      </AppArticle>
      <AppArticle>
        In <RefLink toId="relation-time-delay" />
        {
          ', the green period indicates the time when the owner can execute the transaction. The yellow period is the waiting period, and the gray period represents the expired period, after which the transaction can no longer be executed.'
        }
      </AppArticle>
    </SubsectionBox>
  );
}
