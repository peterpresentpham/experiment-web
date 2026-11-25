import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { blogMessages } from 'src/i18n/messages/blog';
import { rubikSolverMessages } from 'src/i18n/messages/rubikSolver';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import SolverView from 'src/views/Rubik3x3View/solver/SolverView';

export async function generateMetadata(): Promise<Metadata> {
  const solver = await getMessages(rubikSolverMessages);
  return generateAppMetadata(solver.title, solver.description);
}

export default async function RubikSolver() {
  const [{ title, rubik }, solver] = await Promise.all([
    getMessages(blogMessages),
    getMessages(rubikSolverMessages),
  ]);
  return (
    <div className="container py-4 pb-20">
      <CssBreadcrumbs
        configs={[
          { label: title, link: '/blog' },
          { label: rubik.title, link: RUBIK_BASE },
          { label: solver.breadcrumb },
        ]}
        className="mb-4"
      />
      <SolverView />
    </div>
  );
}
