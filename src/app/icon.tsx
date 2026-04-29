import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
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
          background: '#1a2235',
          overflow: 'hidden',
          border: '1px solid rgba(200, 255, 0, 0.3)',
        }}
      >
        <img
          src="https://raw.githubusercontent.com/SimonEtchegno/Paddle/main/public/logo.jpg"
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
