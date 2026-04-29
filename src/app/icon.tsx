import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  try {
    const logoPath = join(process.cwd(), 'public', 'logo_complejo.png');
    const logoData = readFileSync(logoPath);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'transparent',
            overflow: 'hidden',
            border: '2px solid #8882dc',
          }}
        >
          {/* @ts-ignore */}
          <img
            src={logoData}
            width="32"
            height="32"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (e) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', background: '#8882dc', borderRadius: '50%' }} />
      ),
      { ...size }
    );
  }
}
