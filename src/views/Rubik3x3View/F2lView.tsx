import { F2LConfig } from 'src/configs/rubik3x3.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { AlgText, CubePicture } from './parts';

const TEXT = defineMessages<{ group: (index: number, basic: boolean) => string }>({
  en: { group: (index, basic) => `Group ${index}${basic ? ': basic F2L' : ''}` },
  vi: { group: (index, basic) => `Nhóm ${index}${basic ? ': F2L cơ bản' : ''}` },
});

/** 41 F2L cases. Each picture is generated from the case's own algorithm (front-right slot). */
export default async function F2lView() {
  const t = TEXT[await getLocale()];

  return (
    <div>
      {F2LConfig.map((group, groupIndex) => (
        <div key={groupIndex} className="mt-12">
          <p className="text-2xl font-bold">{t.group(groupIndex + 1, !!group.basic)}</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.data.map((item, index) => (
              <div
                key={item.id}
                className="relative flex flex-col items-center gap-2 rounded-md border border-border p-3"
              >
                <p className="absolute top-3 left-3 font-bold underline">{index + 1}.</p>
                <p className="absolute top-3 right-3 text-xs text-muted-foreground">{item.id}</p>
                <CubePicture
                  image={{ kind: 'iso', alg: item.methods[0], mask: 'f2l' }}
                  size={110}
                />
                <div className="flex flex-col items-center gap-1">
                  {item.methods.map((method) => (
                    <AlgText key={method} alg={method} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
