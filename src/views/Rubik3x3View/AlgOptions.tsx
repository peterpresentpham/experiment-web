import { TAlgOption, TOptionGroup } from 'src/configs/rubikAlgOptions.config';
import { CubeImage } from 'src/configs/rubikGuide.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { AlgText, CardGrid, CubePicture, SourceTag } from './parts';

const TEXT = defineMessages<{ all: (count: number) => string }>({
  en: {
    all: (count) => `All options found (${count}): pick the one that suits you`,
  },
  vi: {
    all: (count) => `Tất cả phương án tìm được (${count}): chọn cái hợp với bạn`,
  },
});

/** Picture of the case an option solves, drawn in the grip its source uses. */
function optionImage(group: TOptionGroup, option: TAlgOption): CubeImage {
  const { kind, mask, arrows } = group;
  const alg = option.grip ? `${option.grip} ${option.alg} ${option.grip}` : option.alg;
  return { kind, mask, arrows, alg, view: option.grip };
}

/** Collapsible grid with every option found for one step. */
export async function AlgOptionGrid({ group }: { group: TOptionGroup }) {
  const locale = await getLocale();
  const t = TEXT[locale];
  return (
    <details className="mt-4 rounded-md border border-border p-3">
      <summary className="cursor-pointer font-semibold">{t.all(group.options.length)}</summary>
      <CardGrid>
        {group.options.map((o) => (
          <div
            key={o.alg}
            className="flex flex-col items-center gap-2 rounded-md border border-border p-3"
          >
            {!o.noImage && <CubePicture image={optionImage(group, o)} size={96} />}
            <AlgText alg={o.alg} />
            <SourceTag source={o.source} />
            {o.note && (
              <p className="text-center text-xs text-muted-foreground">{o.note[locale]}</p>
            )}
          </div>
        ))}
      </CardGrid>
    </details>
  );
}
