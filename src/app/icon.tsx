import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#dc2626',
          borderRadius: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {/* Bold N */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 900,
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            letterSpacing: '-0.5px',
          }}
        >
          N
        </div>
        {/* Newspaper lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 18 }}>
          <div style={{ height: 1.5, background: 'rgba(255,255,255,0.7)', borderRadius: 1 }} />
          <div style={{ height: 1.5, background: 'rgba(255,255,255,0.5)', borderRadius: 1, width: '70%' }} />
        </div>
      </div>
    ),
    { ...size },
  )
}
