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
  // Leer la imagen localmente
  const logoPath = join(process.cwd(), 'public', 'logo.jpg');
  const logoData = readFileSync(logoPath);
  const logoBase64 = `data:image/jpeg;base64,${logoData.toString('base64')}`;

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
          background: '#0a0b0e',
          overflow: 'hidden',
          border: '1px solid #8882dc',
        }}
      >
        <img
          src={logoBase64}
          width="32"
          height="32"
          style={{
            objectFit: 'cover',
            borderRadius: '50%',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
