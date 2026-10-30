import { ImageResponse } from 'next/og';
import { APP_NAME } from 'src/configs/constance';

export const alt = APP_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 96,
        background: '#fbfaf8',
        color: '#25201c',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: '#d9531e' }} />
        <div style={{ fontSize: 40, fontWeight: 600 }}>{APP_NAME}</div>
      </div>
      <div style={{ fontSize: 84, fontWeight: 700, marginTop: 48, lineHeight: 1.1 }}>
        Small web experiments
      </div>
      <div style={{ fontSize: 36, marginTop: 24, color: '#6b625a' }}>
        Board games · Process scheduler · Chat
      </div>
    </div>,
    size
  );
}
