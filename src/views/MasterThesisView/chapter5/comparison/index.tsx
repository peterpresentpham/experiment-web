/* eslint-disable react/no-unescaped-entities */
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
import SectionBox from 'src/components/Thesis/SectionBox';
import TableBox from 'src/components/Thesis/TableBox';
import { ComparisonTable } from '../code';
import Clave from './clave';
import Kelp from './kelp';
import Okx from './okx';
import Soul from './soul';

export default function Comparison() {
  return (
    <SectionBox
      id="comparison-with-existing-architectures"
      title="Comparison with Existing Architectures"
    >
      <AppArticle>
        This section discusses and compares the differences between the proposed architecture and
        several existing architectures. In detail, we will compare with (we overview the existing
        architectures in appendix <RefLink toId="recovery-solution" mode="appendix" />
        ).
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="font-bold">KELP</span>
          {
            ': a guardian-less smart contract recovery solution. KELP is based on smart contracts without the need for external guardians.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">OKX wallet</span>
          {': an MPC wallet, which divides the private key into three shares to improve tolerance.'}
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Soul wallet</span>
          {
            ': an ERC-4337 smart contract wallet with guardian-based recovery but not ZKP implementation.'
          }
        </ArticleLI>
        <ArticleLI>
          <span className="font-bold">Clave wallet</span>
          {
            ': an ERC-4337 smart contract wallet with guardian-based recovery and ZKP, but using email accounts as guardians instead of web3 accounts.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        We refer <RefLink toId="sok" mode="cite" /> to propose six criteria: (1) Proactive vs.
        Reactive, (2) Account recovery vs. Fund recovery, (3) Standard wallet accounts vs. Smart
        contract accounts, (4) Recovery using guardians, (5) Multi-key recovery, (6) Key-custody.
        Moreover, we propose one more criterion: (7) Zero-knowledge proof.
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>
          <span className="italic">(1) Proactive vs. Reactive</span>: Proactive approaches require
          users to take initial actions to enable recovery, such as off-chain backups. In contrast,
          reactive approaches do not require any initial action from users. Instead, these systems
          are designed to provide recovery with a minimal initial system setup to configure the
          recovery solution.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">(2) Account recovery vs. Fund recovery</span>: Account recovery
          aims to protect and restore the key pair associated with a user's funds, enabling the
          recovery of assets linked to that key pair. In contrast, fund recovery focuses on
          retrieving funds, such as key rotation. In key rotation, the old key must be disabled, and
          any future actions tied to the old key should be revoked.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">(3) Standard accounts vs. Contract accounts</span>
        </ArticleLI>
        <ArticleLI>
          <span className="italic">(4) Recovery using guardians</span>
        </ArticleLI>
        <ArticleLI>
          <span className="italic">(5) Multi-key recovery</span>: In MPC, multi-signature or
          threshold signature wallets, transactions require multiple keys instead of one. If a
          single key is lost, the remaining keys can be used to recover or replace it.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">(6) Key-custody</span>: Referring{' '}
          <RefLink toId="sok" mode="cite" />, we divide wallets into three types: custodial,
          non-custodial, and self-custodial. A custodial wallet is managed entirely by a third
          party, which holds the user's private keys and can restrict access or freeze funds. A
          non-custodial wallet splits control between the user and a service provider, allowing
          shared signing. In contrast, a self-custodial wallet gives the user full control of their
          private keys, with no external party able to block or modify actions.
        </ArticleLI>
        <ArticleLI>
          <span className="italic">(7) Zero-knowledge proof</span>: In the context of wallet
          recovery, ZKPs can be used to improve privacy guarantees and enhance the trustworthiness
          of decentralized recovery systems.
        </ArticleLI>
      </ArticleUL>
      <TableBox
        id="comparison"
        title="Comparison between proposed architecture and existing wallet architectures"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <span className="font-bold">Criteria</span>
              </TableHead>
              <TableHead>
                <span className="font-bold">KELP</span>
              </TableHead>
              <TableHead>
                <span className="font-bold">OKX wallet</span>
              </TableHead>
              <TableHead>
                <span className="font-bold">Soul wallet</span>
              </TableHead>
              <TableHead>
                <span className="font-bold">Clave wallet</span>
              </TableHead>
              <TableHead>
                <span className="font-bold">Proposed wallet</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ComparisonTable.map((item, index) => {
              return (
                <TableRow key={index}>
                  {item.map((cell, index1) => {
                    return <TableCell key={index1}>{cell}</TableCell>;
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableBox>
      <AppArticle>
        <RefLink toId="comparison" mode="table" /> presents the differences between the proposed
        wallet and existing solutions based on seven criteria. As shown in the table, five solutions
        represent different recovery methods. KELP is a guardian-less smart contract wallet, based
        on smart contracts without guardians. Soul wallet, Clave wallet, and the proposed wallet are
        guardian-based ERC-4337 wallets, though each differs in several aspects. In the remainder of
        the section, we will discuss in more detail the differences between the proposed wallet and
        others.
      </AppArticle>
      <Kelp />
      <Okx />
      <Soul />
      <Clave />
    </SectionBox>
  );
}
