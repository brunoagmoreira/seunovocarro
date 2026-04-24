import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

/** Ícone PWA / favicon — área segura para maskable (Android). */
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
          background: 'linear-gradient(160deg, #268052 0%, #346739 100%)',
          padding: '14%',
        }}
      >
        <span
          style={{
            fontSize: 200,
            fontWeight: 800,
            color: 'white',
            letterSpacing: -6,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}
        >
          SNC
        </span>
      </div>
    ),
    { ...size },
  );
}
