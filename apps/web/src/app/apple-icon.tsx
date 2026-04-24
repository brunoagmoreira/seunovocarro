import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Apple touch icon (adicionar à tela inicial). */
export default function AppleIcon() {
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
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            letterSpacing: -2,
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
