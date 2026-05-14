/* ─────────────────────────────────────────────────────────────
   Placeholder page component factory
   Renders a minimal "en construcción" screen in CLYRO style.
   ───────────────────────────────────────────────────────────── */

export default function PlaceholderPage({ title, emoji = '🚧', description }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center page-enter"
      style={{ background: 'var(--c)' }}
    >
      <div className="text-center max-w-sm px-6">
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-clyro-lg flex items-center justify-center text-4xl"
          style={{ background: 'var(--c2)' }}
          aria-hidden="true"
        >
          {emoji}
        </div>

        <h1
          className="font-display mb-3"
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 400,
            color: 'var(--ink)',
            letterSpacing: '-.01em',
            lineHeight: 1.15,
          }}
        >
          {title}
        </h1>

        <p style={{ fontSize: 13, color: 'var(--i4)', lineHeight: 1.8 }}>
          {description ?? 'Vista en construcción — próximamente disponible.'}
        </p>

        {/* subtle CLYRO divider */}
        <div
          className="mx-auto mt-8"
          style={{ width: 40, height: .5, background: 'var(--b2)' }}
        />
        <p
          className="mt-4"
          style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--i4)' }}
        >
          CLYRO · On My Way
        </p>
      </div>
    </div>
  )
}
