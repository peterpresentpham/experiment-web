import Image from 'next/image';
import { ContainerClipboard } from 'src/components/CopyClipboard';
import { IMAGES } from 'src/configs/images';
import { F2LConfig } from 'src/configs/rubik3x3.config';

export default function F2lView() {
  return (
    <div>
      {F2LConfig.map((group) => {
        return (
          <div key={group.title} className="mt-20">
            <p className="text-2xl font-bold">{group.title}</p>
            <div className="mt-3 flex flex-wrap gap-5">
              {group.data.map((item, index) => {
                return (
                  <div
                    key={item.id}
                    className="border-border relative flex min-w-[250px] flex-col items-center gap-2 rounded-md border p-3"
                  >
                    <p className="absolute top-3 left-3 font-bold underline">{index + 1}.</p>
                    <Image
                      src={IMAGES.rubik3x3.byId(item.id)}
                      alt={item.id}
                      width={100}
                      height={100}
                    />
                    <div>
                      {item.methods.map((method) => {
                        return (
                          <ContainerClipboard
                            key={method}
                            className="border-border mt-2 border p-2"
                            copyText={method}
                          >
                            <p className="text-2xl font-semibold">{method}</p>
                          </ContainerClipboard>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
