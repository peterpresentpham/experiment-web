// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AlgorithmBrowser, {
  TBrowserItem,
  TBrowserLabels,
} from 'src/views/Rubik3x3View/AlgorithmBrowser';
import RubikToc from 'src/views/Rubik3x3View/RubikToc';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

const LABELS: TBrowserLabels = {
  placeholder: 'Search',
  hint: 'hint',
  kinds: { all: 'All', oll: 'OLL', pll: 'PLL', f2l: 'F2L' },
  sets: { full: 'All cases', core: 'Core only' },
  results: '{count} cases',
  empty: 'Nothing found',
  clear: 'Clear',
};

const ITEMS: Array<TBrowserItem> = [
  {
    key: 'oll-27',
    kind: 'oll',
    set: 'core',
    texts: ['OLL 27', 'Sune'],
    algs: ["R U R' U R U2' R'"],
    node: <p>card OLL 27</p>,
  },
  {
    key: 'oll-30',
    kind: 'oll',
    set: 'full',
    texts: ['OLL 30'],
    algs: ["F U R U2 R' U' R U2 R' U' F'"],
    node: <p>card OLL 30</p>,
  },
  {
    key: 'pll-T',
    kind: 'pll',
    set: 'full',
    texts: ['T-perm'],
    algs: ["R U R' U' R' F R2 U' R' U' R U R' F'"],
    node: <p>card T-perm</p>,
  },
];

function renderBrowser(props: Partial<{ initialQuery: string }> = {}) {
  return render(<AlgorithmBrowser items={ITEMS} labels={LABELS} initialQuery="" {...props} />);
}

describe('AlgorithmBrowser', () => {
  it('shows every card and the count at first', () => {
    renderBrowser();
    expect(screen.getAllByText(/^card /)).toHaveLength(3);
    expect(screen.getByText('3 cases')).toBeTruthy();
  });

  it('narrows by a typed name', () => {
    renderBrowser();
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'sune' } });
    expect(screen.getAllByText(/^card /).map((node) => node.textContent)).toEqual(['card OLL 27']);
    expect(screen.getByText('1 cases')).toBeTruthy();
  });

  it('narrows by pasted moves', () => {
    renderBrowser();
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: "R U R' U'" } });
    expect(screen.getAllByText(/^card /).map((node) => node.textContent)).toEqual(['card T-perm']);
  });

  it('narrows by kind and by the core set', () => {
    renderBrowser();
    fireEvent.click(screen.getByRole('button', { name: /^OLL/ }));
    expect(screen.getAllByText(/^card /)).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Core only' }));
    expect(screen.getAllByText(/^card /).map((node) => node.textContent)).toEqual(['card OLL 27']);
  });

  it('starts from the query it is given and offers a way out of an empty result', () => {
    renderBrowser({ initialQuery: 'zzz' });
    expect(screen.getByText('Nothing found')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getAllByText(/^card /)).toHaveLength(3);
  });
});

describe('RubikToc', () => {
  const chapters = [
    {
      id: 'cross',
      title: 'Cross',
      sections: [
        { id: 'cross-direct', title: 'Straight to the bottom' },
        { id: 'cross-inspection', title: 'Inspection' },
      ],
    },
    { id: 'f2l', title: 'F2L', sections: [{ id: 'f2l-corners', title: 'Corners' }] },
  ];

  function renderToc() {
    const ids = [chapters[0], ...chapters[0].sections, chapters[1], ...chapters[1].sections].map(
      (entry) => entry.id
    );
    // jsdom has no layout: put each heading 1000px below the previous one, the first at the top.
    ids.forEach((id, index) => {
      const heading = document.createElement('h2');
      heading.id = id;
      heading.getBoundingClientRect = () => ({ top: index * 1000 }) as DOMRect;
      document.body.append(heading);
    });
    return render(<RubikToc chapters={chapters} labels={{ contents: 'Contents', open: 'Open' }} />);
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('links every chapter and opens the sections of the current one only', () => {
    renderToc();
    // The first chapter is current while nothing has scrolled.
    expect(screen.getAllByRole('link', { name: 'Cross' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Inspection' }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('link', { name: 'Corners' })).toHaveLength(0);
    const link = screen.getAllByRole('link', { name: 'F2L' })[0];
    expect(link.getAttribute('href')).toBe('#f2l');
  });

  it('opens the phone list from the bar and closes it after a click', () => {
    renderToc();
    const bar = screen.getByRole('button', { name: 'Open' });
    expect(bar.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(bar);
    expect(bar.getAttribute('aria-expanded')).toBe('true');
    const phoneLinks = screen.getAllByRole('link', { name: 'F2L' });
    fireEvent.click(phoneLinks[0]);
    expect(bar.getAttribute('aria-expanded')).toBe('false');
  });
});
