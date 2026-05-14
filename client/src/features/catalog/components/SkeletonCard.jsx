/**
 * CLYRO — SkeletonCard
 * Animated pulse placeholder while products are loading.
 * Matches the exact dimensions and proportions of ProductCard.
 */
export function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--c2)',
        borderRadius: 'var(--rl)',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <div style={{ height: 200, background: 'var(--c3)', position: 'relative', overflow: 'hidden' }}>
        <div style={shimmerStyle} />
      </div>

      {/* Body placeholders */}
      <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...pill, width: '40%', height: 8, background: 'var(--c3)', position: 'relative', overflow: 'hidden' }}>
          <div style={shimmerStyle} />
        </div>
        <div style={{ ...pill, width: '80%', height: 12, background: 'var(--c3)', position: 'relative', overflow: 'hidden' }}>
          <div style={shimmerStyle} />
        </div>
        <div style={{ ...pill, width: '55%', height: 12, background: 'var(--c3)', position: 'relative', overflow: 'hidden' }}>
          <div style={shimmerStyle} />
        </div>
        <div style={{ ...pill, width: '30%', height: 16, background: 'var(--c3)', marginTop: 4, position: 'relative', overflow: 'hidden' }}>
          <div style={shimmerStyle} />
        </div>
      </div>
    </div>
  )
}

const pill    = { borderRadius: 8 }
const shimmerStyle = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.4) 50%, transparent 100%)',
  animation: 'clyro-shimmer 1.6s infinite',
}

/* Inject shimmer keyframe once */
if (typeof document !== 'undefined' && !document.getElementById('clyro-shimmer-style')) {
  const s = document.createElement('style')
  s.id = 'clyro-shimmer-style'
  s.textContent = `
    @keyframes clyro-shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `
  document.head.appendChild(s)
}
