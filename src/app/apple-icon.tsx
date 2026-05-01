import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#dc2626',
          borderRadius: 36,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            color: '#ffffff',
            fontSize: 100,
            fontWeight: 900,
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            letterSpacing: '-3px',
          }}
        >
          N
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 90 }}>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.7)', borderRadius: 3 }} />
          <div style={{ height: 5, background: 'rgba(255,255,255,0.5)', borderRadius: 3, width: '70%' }} />
        </div>
      </div>
    ),
    { ...size },
  )
}
