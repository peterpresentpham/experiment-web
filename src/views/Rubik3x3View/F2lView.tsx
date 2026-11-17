import { F2LConfig } from 'src/configs/rubik3x3.config';
import { AlgText, CubePicture } from './parts';

/** 41 F2L cases. Each picture is generated from the case's own algorithm (front-right slot). */
export default function F2lView() {
  return (
    <div>
      {F2LConfig.map((group) => (
        <div key={group.title} className="mt-12">
          <p className="text-2xl font-bold">{group.title}</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.data.map((item, index) => (
              <div
                key={item.id}
                className="border-border relative flex flex-col items-center gap-2 rounded-md border p-3"
              >
                <p className="absolute top-3 left-3 font-bold underline">{index + 1}.</p>
                <p className="text-muted-foreground absolute top-3 right-3 text-xs">{item.id}</p>
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
