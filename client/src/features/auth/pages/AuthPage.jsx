/**
 * CLYRO — AuthPage
 * ──────────────────────────────────────────────────────────────
 * Full-screen split layout (no sidebar nav).
 *
 * Desktop: dark left panel (quote + logo) / cream right panel (form)
 * Mobile:  only the cream right panel
 *
 * Animated tab toggle between Login and Register.
 * Visual reference: clyro_v4.html .auth-wrap section + referencialogin.jpg
 * ──────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast, Toaster } from 'sonner'
import { IconEye, IconEyeOff, IconLoader2 } from '@tabler/icons-react'
import { useAuth } from '../../../context/AuthContext'

/* ── Inline styles extracted from clyro_v4.html ─────────── */
const S = {
  wrap: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    background: 'var(--c)',
    fontFamily: "'DM Sans', sans-serif",
  },
  left: {
    background: 'var(--ink)',
    padding: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 16,
    fontWeight: 300,
    letterSpacing: '.4em',
    color: 'var(--c)',
    textDecoration: 'none',
  },
  quote: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(22px, 2.4vw, 34px)',
    fontWeight: 400,
    fontStyle: 'italic',
    color: 'rgba(244,242,237,.55)',
    lineHeight: 1.5,
  },
  foot: {
    fontSize: 10,
    letterSpacing: '.2em',
    textTransform: 'uppercase',
    color: 'rgba(244,242,237,.25)',
  },
  right: {
    padding: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 20,
    background: 'var(--c)',
  },
  tabs: { display: 'flex', gap: 4, marginBottom: 4 },
  tab: {
    fontSize: 13,
    color: 'var(--i4)',
    padding: '8px 20px',
    borderRadius: 'var(--rp)',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all .2s',
  },
  tabActive: { background: 'var(--c2)', color: 'var(--ink)' },
  title: { fontSize: 22, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-.01em' },
  sub:   { fontSize: 13, color: 'var(--i4)', marginTop: -12 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: {
    fontSize: 10,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    color: 'var(--i4)',
  },
  input: {
    background: 'var(--c2)',
    border: '0.5px solid var(--b)',
    borderRadius: 12,
    padding: '13px 18px',
    fontSize: 14,
    color: 'var(--ink)',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color .2s, background .2s',
    width: '100%',
  },
  inputError: { borderColor: '#c0392b' },
  inputFocus: { borderColor: 'var(--ink)', background: 'var(--c)' },
  inputWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--i4)',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  errorText: {
    fontSize: 11,
    color: '#c0392b',
    marginTop: 2,
    letterSpacing: '.01em',
  },
  btn: {
    width: '100%',
    background: 'var(--ink)',
    color: 'var(--c)',
    border: 'none',
    borderRadius: 'var(--rp)',
    padding: 15,
    fontSize: 13,
    letterSpacing: '.07em',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s cubic-bezier(.16,1,.3,1)',
  },
  divider: { height: .5, background: 'var(--b)', margin: '4px 0' },
  switchText: { textAlign: 'center', fontSize: 12, color: 'var(--i4)' },
  switchLink: { color: 'var(--i3)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontSize: 12, fontFamily: "'DM Sans', sans-serif" },
}

/* ── Field component ─────────────────────────────────────── */
function Field({ label, id, error, children }) {
  return (
    <div style={S.fieldGroup}>
      <label htmlFor={id} style={S.label}>{label}</label>
      {children}
      {error && <span style={S.errorText} role="alert">{error}</span>}
    </div>
  )
}

/* ── Controlled input with focus ring ────────────────────── */
function ClyroInput({ id, type = 'text', value, onChange, placeholder, error, autoComplete, maxLength, right }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={S.inputWrap}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...S.input,
          ...(focused ? S.inputFocus : {}),
          ...(error ? S.inputError : {}),
          paddingRight: right ? 44 : undefined,
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {right}
    </div>
  )
}

/* ── Password field with show/hide ───────────────────────── */
function PasswordInput({ id, value, onChange, error, label, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <Field label={label} id={id} error={error}>
      <ClyroInput
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        autoComplete={autoComplete}
        error={error}
        right={
          <button
            type="button"
            style={S.eyeBtn}
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible
              ? <IconEyeOff size={16} stroke={1.5} />
              : <IconEye   size={16} stroke={1.5} />}
          </button>
        }
      />
    </Field>
  )
}

/* ════════════════════════════════════════════════════════════
   LOGIN FORM
   ════════════════════════════════════════════════════════════ */
function LoginForm({ onSwitch }) {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Correo inválido'
    if (!password)        e.password = 'La contraseña es obligatoria'
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e_ = validate()
    if (Object.keys(e_).length) { setErrors(e_); return }

    setLoading(true)
    setErrors({})

    try {
      await login(email, password)
      toast.success('¡Bienvenido de vuelta!')
      const redirect = searchParams.get('redirect') || '/catalog'
      navigate(redirect, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Credenciales incorrectas'
      toast.error(msg)
      setErrors({ api: msg })
    } finally {
      setLoading(false)
      // Clear password from state after attempt
      setPassword('')
    }
  }

  return (
    <form id="login-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={S.title}>Iniciar sesión</h1>
        <p style={{ ...S.sub, marginTop: 6 }}>Bienvenido de vuelta a CLYRO</p>
      </div>

      <Field label="Correo electrónico" id="login-email" error={errors.email}>
        <ClyroInput
          id="login-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          autoComplete="email"
          error={errors.email}
        />
      </Field>

      <PasswordInput
        id="login-password"
        label="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      {errors.api && (
        <p style={{ ...S.errorText, textAlign: 'center' }} role="alert">{errors.api}</p>
      )}

      <button
        id="login-submit"
        type="submit"
        disabled={loading}
        style={{ ...S.btn, opacity: loading ? .7 : 1 }}
        onMouseEnter={e => !loading && Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(26,25,24,.18)' })}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'translateY(0)', boxShadow: 'none' })}
      >
        {loading && <IconLoader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
        {loading ? 'Entrando…' : 'Iniciar sesión'}
      </button>

      <div style={S.divider} />
      <p style={S.switchText}>
        ¿No tienes cuenta?{' '}
        <button type="button" style={S.switchLink} onClick={onSwitch}>
          Regístrate
        </button>
      </p>
    </form>
  )
}

/* ════════════════════════════════════════════════════════════
   REGISTER FORM
   ════════════════════════════════════════════════════════════ */
function RegisterForm({ onSwitch }) {
  const { register: doRegister } = useAuth()
  const navigate = useNavigate()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)

  const validate = () => {
    const e = {}
    if (!name.trim())  e.name = 'El nombre es obligatorio'
    if (!email.trim()) e.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Correo inválido'
    if (!password)         e.password = 'La contraseña es obligatoria'
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e_ = validate()
    if (Object.keys(e_).length) { setErrors(e_); return }

    setLoading(true)
    setErrors({})

    try {
      await doRegister({ name: name.trim(), email, password })
      toast.success('¡Cuenta creada! Bienvenido a CLYRO.')
      navigate('/catalog', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'No se pudo crear la cuenta'
      toast.error(msg)
      setErrors({ api: msg })
    } finally {
      setLoading(false)
      setPassword('')
    }
  }

  return (
    <form id="register-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={S.title}>Crear cuenta</h1>
        <p style={{ ...S.sub, marginTop: 6 }}>Únete a la comunidad CLYRO</p>
      </div>

      <Field label="Nombre completo" id="reg-name" error={errors.name}>
        <ClyroInput
          id="reg-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre"
          autoComplete="name"
          maxLength={60}
          error={errors.name}
        />
      </Field>

      <Field label="Correo electrónico" id="reg-email" error={errors.email}>
        <ClyroInput
          id="reg-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          autoComplete="email"
          error={errors.email}
        />
      </Field>

      <PasswordInput
        id="reg-password"
        label="Contraseña (mín. 6 caracteres)"
        value={password}
        onChange={e => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="new-password"
      />

      {errors.api && (
        <p style={{ ...S.errorText, textAlign: 'center' }} role="alert">{errors.api}</p>
      )}

      <button
        id="register-submit"
        type="submit"
        disabled={loading}
        style={{ ...S.btn, opacity: loading ? .7 : 1 }}
        onMouseEnter={e => !loading && Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(26,25,24,.18)' })}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'translateY(0)', boxShadow: 'none' })}
      >
        {loading && <IconLoader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <div style={S.divider} />
      <p style={S.switchText}>
        ¿Ya tienes cuenta?{' '}
        <button type="button" style={S.switchLink} onClick={onSwitch}>
          Inicia sesión
        </button>
      </p>
    </form>
  )
}

/* ════════════════════════════════════════════════════════════
   AUTH PAGE  (combines both panels)
   ════════════════════════════════════════════════════════════ */
export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('login')  // 'login' | 'register'

  // Redirect already-authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/catalog'
      navigate(redirect, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, searchParams])

  // Responsive: hide left panel on narrow viewports
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c)' }}>
        <IconLoader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--i4)' }} />
      </div>
    )
  }

  return (
    <>
      {/* Sonner toast container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            borderRadius: 'var(--rp)',
            border: '0.5px solid var(--b)',
          },
        }}
      />

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ ...S.wrap, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>

        {/* ── Left panel — dark, quote ── */}
        {!isMobile && (
          <aside style={S.left}>
            <Link to="/" style={S.logo}>CLYRO</Link>

            <blockquote style={S.quote}>
              "Todo claro en{' '}
              <strong style={{ color: 'var(--c)', fontStyle: 'normal', fontWeight: 400 }}>
                tu camino
              </strong>
              .<br />
              Productos que importan,<br />
              nada que sobre."
            </blockquote>

            <span style={S.foot}>Everything is clear · on my way</span>
          </aside>
        )}

        {/* ── Right panel — form ── */}
        <section
          style={{
            ...S.right,
            padding: isMobile ? '40px 24px' : '80px',
          }}
          aria-label="Formulario de autenticación"
        >
          {/* Tabs */}
          <div style={S.tabs} role="tablist" aria-label="Modo de acceso">
            <button
              id="tab-login"
              role="tab"
              aria-selected={tab === 'login'}
              style={{ ...S.tab, ...(tab === 'login' ? S.tabActive : {}) }}
              onClick={() => setTab('login')}
            >
              Iniciar sesión
            </button>
            <button
              id="tab-register"
              role="tab"
              aria-selected={tab === 'register'}
              style={{ ...S.tab, ...(tab === 'register' ? S.tabActive : {}) }}
              onClick={() => setTab('register')}
            >
              Crear cuenta
            </button>
          </div>

          {/* Animated form swap */}
          <div
            key={tab}
            style={{ animation: 'clyro-fadein .35s cubic-bezier(.16,1,.3,1) both' }}
            role="tabpanel"
          >
            {tab === 'login'
              ? <LoginForm    onSwitch={() => setTab('register')} />
              : <RegisterForm onSwitch={() => setTab('login')}    />
            }
          </div>
        </section>
      </div>
    </>
  )
}
