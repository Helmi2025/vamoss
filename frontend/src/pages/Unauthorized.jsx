import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Unauthorized() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '16px', fontFamily: 'Montserrat, sans-serif',
      textAlign: 'center', padding: '24px',
    }}>
      <span style={{
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#e07070',
        border: '1px solid rgba(220,53,69,0.4)', borderRadius: '100px',
        padding: '6px 20px', background: 'rgba(220,53,69,0.07)',
      }}>
        403 — Forbidden
      </span>
      <h1 style={{
        fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,5vw,3rem)',
        color: '#fff', fontWeight: 700,
      }}>
        Access Denied
      </h1>
      <p style={{ fontSize: '0.88rem', color: '#555' }}>
        You don't have permission to view this page.
      </p>
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 28px', background: 'transparent',
            border: '1px solid rgba(198,168,75,0.35)', borderRadius: '2px',
            color: '#c6a84b', fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Go Back
        </button>
        <button
          onClick={() => { logout(); navigate('/login', { replace: true }) }}
          style={{
            padding: '10px 28px', background: '#c6a84b',
            border: '1px solid #c6a84b', borderRadius: '2px',
            color: '#000', fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  )
}

export default Unauthorized
