import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import './Navbar.css'

function Navbar({ refs }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (ref) => {
    setMenuOpen(false)
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <a href="#" className="navbar-logo" onClick={() => scrollTo(refs.hero)}>
        <img src={logo} alt="Vamos Sport Sfax" />
        <span className="navbar-logo-text">
          Vamos <span>Sport</span>
        </span>
      </a>

      {/* Desktop links */}
      <ul className="navbar-links">
        <li><button onClick={() => scrollTo(refs.about)}>About</button></li>
        <li><button onClick={() => scrollTo(refs.features)}>Features</button></li>
        <li><button onClick={() => scrollTo(refs.community)}>Community</button></li>
      </ul>

      {/* CTA buttons */}
      <div className="navbar-cta">
        <button className="btn btn-outline" onClick={() => navigate('/login')}>
          Login
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/register')}>
          Join as Captain
        </button>
      </div>

      {/* Hamburger */}
      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-menu">
          <button onClick={() => scrollTo(refs.about)}>About</button>
          <button onClick={() => scrollTo(refs.features)}>Features</button>
          <button onClick={() => scrollTo(refs.community)}>Community</button>
          <div className="mobile-menu-cta">
            <button className="btn btn-outline" onClick={() => { setMenuOpen(false); navigate('/login') }}>Login</button>
            <button className="btn btn-primary" onClick={() => { setMenuOpen(false); navigate('/register') }}>Join as Captain</button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
