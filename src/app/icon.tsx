import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

// Generamos una imagen de alta calidad (96x96 como pidió el usuario)
export const size = {
  width: 96,
  height: 96,
};
export const contentType = 'image/png';

export default function Icon() {
  try {
    const logoPath = join(process.cwd(), 'public', 'logo.jpg');
    const logoBuffer = readFileSync(logoPath);
    
    // IMPORTANTE: Satori requiere un ArrayBuffer puro
    const logoArrayBuffer = logoBuffer.buffer.slice(
      logoBuffer.byteOffset,
      logoBuffer.byteOffset + logoBuffer.byteLength
    );

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
          }}
        >
          <div
            style={{
              width: '90px',
              height: '90px',
              display: 'flex',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(136, 130, 220, 0.5)', // El borde violeta del nav
              boxShadow: '0 0 15px rgba(136, 130, 220, 0.4)', // La sombra del nav
            }}
          >
            <img
              src={logoArrayBuffer as any}
              width="90"
              height="90"
              style={{
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          </div>
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
