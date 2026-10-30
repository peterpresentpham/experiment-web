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
import { bundlerMethods } from '../code';

export default function Bundler() {
  return (
    <SubsectionBox id="bundler-implementation" title="Bundler Implementation">
      <AppArticle isFirst>
        The Bundler service is based on the Eth infinitism bundler{' '}
        <RefLink toId="eth-infinitism-bundler" mode="cite" />. In the scope of this thesis, the
        bundler is implemented following the JSON-RPC model. The bundler supports two types of
        methods:
      </AppArticle>
      <ArticleUL className="list-disc">
        <ArticleLI>{'User methods, prefixed with eth_, are used by users directly.'}</ArticleLI>
        <ArticleLI>
          {
            'Debug methods, prefixed with debug_, are primarily for development and maintenance purposes, used by bundler operators or developers.'
          }
        </ArticleLI>
      </ArticleUL>
      <AppArticle>
        <RefLink toId="bundler-supported-methods" mode="table" /> lists the currently supported
        methods provided by our bundler implementation.
      </AppArticle>
      <TableBox id="bundler-supported-methods" title="Bundler supported methods">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundlerMethods.map((item) => {
              return (
                <TableRow key={item.method}>
                  <TableCell>{item.method}</TableCell>
                  <TableCell>{item.description}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableBox>
    </SubsectionBox>
  );
}
