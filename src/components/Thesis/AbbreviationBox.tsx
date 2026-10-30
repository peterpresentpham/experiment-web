import { TDivProps } from 'src/types/global';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../shadcn/table';

export type TAbbreviationType = { short: string; full: string };

interface TProps extends TDivProps {
  data: Array<TAbbreviationType>;
}

export default function AbbreviationBox({ data, ...props }: TProps) {
  return (
    <div {...props}>
      <p className="text-center text-[20px] font-semibold">LIST OF ABBREVIATIONS</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Abbreviation</TableHead>
            <TableHead className="font-bold">Full Expression</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            return (
              <TableRow key={item.short}>
                <TableCell>{item.short}</TableCell>
                <TableCell>{item.full}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
