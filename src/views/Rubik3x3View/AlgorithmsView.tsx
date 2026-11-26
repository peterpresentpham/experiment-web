import { F2LConfig } from 'src/configs/rubik3x3.config';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { OLL_CASES, PLL_CASES } from 'src/configs/rubikLL.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { TCaseKind } from 'src/services/rubik/search.utils';
import AlgorithmBrowser, { TBrowserItem, TBrowserLabels } from './AlgorithmBrowser';
import { CaseCard } from './parts';

const TEXT = defineMessages<{
  title: string;
  intro: string;
  labels: TBrowserLabels;
  group: (index: number, basic: boolean) => string;
  probability: (value?: string) => string;
}>({
  en: {
    title: 'Rubik 3x3 algorithm lookup',
    intro:
      'Every OLL, PLL and F2L case of the guide with its picture and algorithms. Click an algorithm to copy it. For how and when to learn them, read the guide.',
    labels: {
      placeholder: 'Search: Sune, T-perm, OLL 27, F2L 3.1, or moves like R U R′ U′',
      hint: 'You can search by name, number, group, or paste the moves you remember: brackets and curly primes are ignored.',
      kinds: { all: 'All', oll: 'OLL', pll: 'PLL', f2l: 'F2L' },
      sets: { full: 'All cases', core: 'Intermediate set only (2-look, basic F2L)' },
      results: '{count} cases',
      empty:
        'No case matches. Try a shorter word, or check that the moves are spelled like R U R′ U′.',
      clear: 'Clear the search',
    },
    group: (index, basic) => `Group ${index}${basic ? ': basic F2L' : ''}`,
    probability: (value) => `Probability ${value}`,
  },
  vi: {
    title: 'Tra cứu công thức Rubik 3x3',
    intro:
      'Mọi ca OLL, PLL và F2L của hướng dẫn, kèm hình và công thức. Bấm vào công thức để sao chép. Muốn biết học thế nào và khi nào, hãy đọc hướng dẫn.',
    labels: {
      placeholder: 'Tìm: Sune, T-perm, OLL 27, F2L 3.1, hoặc các nước như R U R′ U′',
      hint: 'Tìm theo tên, số, nhóm, hoặc dán các nước bạn còn nhớ: dấu ngoặc và dấu phẩy cong được bỏ qua.',
      kinds: { all: 'Tất cả', oll: 'OLL', pll: 'PLL', f2l: 'F2L' },
      sets: { full: 'Mọi ca', core: 'Chỉ bộ trung cấp (2-look, F2L cơ bản)' },
      results: '{count} ca',
      empty:
        'Không có ca nào khớp. Thử từ ngắn hơn, hoặc kiểm tra các nước viết đúng dạng R U R′ U′.',
      clear: 'Xoá tìm kiếm',
    },
    group: (index, basic) => `Nhóm ${index}${basic ? ': F2L cơ bản' : ''}`,
    probability: (value) => `Xác suất ${value}`,
  },
});

/** Lookup page: every OLL, PLL and F2L case as a card, with a search box over them. */
export default async function AlgorithmsView({
  query,
  kind,
}: {
  query?: string;
  kind?: TCaseKind;
}) {
  const locale = await getLocale();
  const t = TEXT[locale];
  const { ollGroupLabels, pllGroupLabels, ollCorners2Look, pll2Look } = RUBIK_GUIDE[locale];
  const ollNames = new Map(ollCorners2Look.map((c) => [c.id, c.name]));
  const pllCore = new Set(pll2Look.map((c) => c.id));

  const items: Array<TBrowserItem> = [
    ...OLL_CASES.map((c): TBrowserItem => {
      const name = ollNames.get(c.id);
      const title = `OLL ${c.id}`;
      return {
        key: `oll-${c.id}`,
        kind: 'oll',
        set: name ? 'core' : 'full',
        texts: [title, c.code ?? '', name ?? '', ollGroupLabels[c.group] ?? c.group],
        algs: c.algs,
        node: (
          <CaseCard
            title={name ? `${title} · ${name}` : title}
            subtitle={`${c.code} · ${c.probability}`}
            image={{ kind: 'top', alg: c.algs[0], mask: 'oll' }}
            algs={c.algs}
          />
        ),
      };
    }),
    ...PLL_CASES.map((c): TBrowserItem => ({
      key: `pll-${c.id}`,
      kind: 'pll',
      set: pllCore.has(c.id) ? 'core' : 'full',
      texts: [`${c.id}-perm`, pllGroupLabels[c.group] ?? c.group],
      algs: c.algs,
      node: (
        <CaseCard
          title={`${c.id}-perm`}
          subtitle={t.probability(c.probability)}
          image={{ kind: 'top', alg: c.algs[0], arrows: true }}
          algs={c.algs}
        />
      ),
    })),
    ...F2LConfig.flatMap((group, groupIndex) =>
      group.data.map((c): TBrowserItem => ({
        key: `f2l-${c.id}`,
        kind: 'f2l',
        set: group.basic ? 'core' : 'full',
        texts: [`F2L ${c.id}`, t.group(groupIndex + 1, !!group.basic)],
        algs: c.methods,
        node: (
          <CaseCard
            title={`F2L ${c.id}`}
            subtitle={t.group(groupIndex + 1, !!group.basic)}
            image={{ kind: 'iso', alg: c.methods[0], mask: 'f2l' }}
            algs={c.methods}
          />
        ),
      }))
    ),
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">{t.title}</h1>
      <p className="mt-3 leading-relaxed">{t.intro}</p>
      <div className="mt-6">
        <AlgorithmBrowser
          items={items}
          labels={t.labels}
          initialQuery={query ?? ''}
          initialKind={kind}
        />
      </div>
    </div>
  );
}
