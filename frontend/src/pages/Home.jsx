import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import InfiniteMenu from '../components/InfiniteMenu'
import heroImg from '../assets/hero.png'
import api from '../api/axiosInstance'
import './Home.css'

/* ─── Wikipedia link mapping by sport name ────────────────── */
const WIKI_LINKS = {
  football: 'https://en.wikipedia.org/wiki/Association_football',
  tennis: 'https://en.wikipedia.org/wiki/Tennis',
  padel: 'https://en.wikipedia.org/wiki/Padel',
  basketball: 'https://en.wikipedia.org/wiki/Basketball',
  volleyball: 'https://en.wikipedia.org/wiki/Volleyball',
  handball: 'https://en.wikipedia.org/wiki/Handball',
}

function wikiLinkFor(sportName) {
  const key = (sportName || '').toLowerCase().trim()
  return WIKI_LINKS[key] || `https://en.wikipedia.org/wiki/${encodeURIComponent(sportName || '')}`
}

/* ─── Feature cards ──────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🏆',
    title: 'Tournaments & Cups',
    text: 'Compete in knockout cups and organized leagues. Track standings, fixtures and results live.',
  },
  {
    icon: '⚽',
    title: 'Local Leagues',
    text: 'Join a seasonal league, build your squad and fight for the trophy. Regular matches guaranteed.',
  },
  {
    icon: '🤝',
    title: 'Community First',
    text: 'More than a platform. A living community of players, coaches and sports lovers in Sfax.',
  },
]

/* ─── Home page ──────────────────────────────────────────── */
function Home() {
  const navigate = useNavigate()

  // Refs for smooth-scroll from Navbar
  const heroRef = useRef(null)
  const aboutRef = useRef(null)
  const featuresRef = useRef(null)
  const communityRef = useRef(null)

  const refs = {
    hero: heroRef,
    about: aboutRef,
    features: featuresRef,
    community: communityRef,
  }

  // Fetch sports from backend (name, scoring rule, image, wiki link only)
  const [sports, setSports] = useState([])
  const [sportsLoading, setSportsLoading] = useState(true)
  const [sportsError, setSportsError] = useState(false)

  useEffect(() => {
    let cancelled = false

    api
      .get('/api/sports')
      .then(res => {
        if (cancelled) return
        setSports(Array.isArray(res.data) ? res.data : [])
        setSportsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setSports([])
        setSportsLoading(false)
        setSportsError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Build the sport's image URL from its iconFileId (served by your file/GridFS endpoint)
  const imageForSport = sport => {
    if (sport.iconUrl) return sport.iconUrl
    if (sport.iconFileId) return `${api.defaults.baseURL || ''}/api/files/${sport.iconFileId}`
    return 'https://picsum.photos/600/600?grayscale'
  }

  // Transform sports data into InfiniteMenu items: name, scoring rule, image, wiki link
  const menuItems = sports.map(sport => ({
    image: imageForSport(sport),
    link: wikiLinkFor(sport.sportName),
    title: sport.sportName,
    description: sport.scoringRule,
  }))

  return (
    <>
      <Navbar refs={refs} />

      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg" style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="hero-overlay" />
        <div className="hero-glow" />

        <div className="hero-content" ref={aboutRef}>
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />
            <span>Vamos Sport Sfax</span>
            <span className="eyebrow-line" />
          </div>

          <h1 className="hero-title">
            More Than a Club,
            <span className="hero-title-gold"> It's a Family.</span>
          </h1>

          <div className="hero-divider" />

          <p className="hero-description">
            Vamos Sport Sfax aims to be more than just a place to rent sports
            facilities. Regularly organizing tournaments, knockout cups and local
            leagues is a major strategic pillar to retain users and energize its
            community.
          </p>

          <div className="hero-actions">
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
              <LoginIcon /> Login
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/discover')}>
              <DiscoverIcon /> Discover
            </button>
          </div>
        </div>

        <div className="scroll-hint">
          <div className="scroll-mouse">
            <div className="scroll-dot" />
          </div>
          <span>Scroll</span>
        </div>
      </section>

      {/* ── JOIN SECTION ── */}
      <section className="join-section">
        <div className="section-header">
          <span className="section-tag">Get Started</span>
          <h2 className="section-title">Join the Community</h2>
          <p className="section-subtitle">
            Whether you want to lead a team or compete as a player, there's a place for you.
          </p>
        </div>

        <div className="join-cards">
          <div className="join-card">
            <span className="join-card-icon">👥</span>
            <h3 className="join-card-title">Join as Captain</h3>
            <p className="join-card-text">
              Lead your own team, manage your roster, and compete in tournaments.
              Captains organize, recruit, and represent their squad on the leaderboard.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              <CaptainIcon /> Become a Captain
            </button>
          </div>

          <div className="join-card">
            <span className="join-card-icon">⚡</span>
            <h3 className="join-card-title">Join as Player</h3>
            <p className="join-card-text">
              Sign up as an individual player to join a team or compete solo in
              tennis and padel. Track your stats and climb the rankings.
            </p>
            <button className="btn btn-secondary" onClick={() => navigate('/join-player')}>
              Become a Player
            </button>
          </div>
        </div>
      </section>

      {/* ── THIRD SECTION: SPORTS SHOWCASE (InfiniteMenu, full width & height) ── */}
      <section className="sports-showcase-section">
        <div className="section-header">
          <span className="section-tag">Explore Sports</span>
          <h2 className="section-title">Discover Our Sports</h2>
          <p className="section-subtitle">
            Drag to explore the sports we offer. Click a sport to read more on Wikipedia.
          </p>
        </div>

        <div className="sports-showcase-container">
          {sportsLoading ? (
            <div className="sports-loading">
              <span>Loading sports…</span>
            </div>
          ) : sportsError || menuItems.length === 0 ? (
            <div className="sports-empty">
              <span>No sports available right now.</span>
            </div>
          ) : (
            <InfiniteMenu items={menuItems} scale={1} />
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section" ref={featuresRef}>
        <div className="section-header">
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Everything Your Game Needs</h2>
          <p className="section-subtitle">
            From booking a pitch to lifting a trophy — all under one roof.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" ref={communityRef}>
        <div className="cta-glow" />
        <span className="section-tag">Ready to Play?</span>
        <h2 className="cta-title">Join the Vamos Family Today</h2>
        <p className="cta-text">
          Create your account, pick your sport, and become part of Sfax's
          fastest-growing sports community.
        </p>
        <div className="cta-buttons">
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
            <LoginIcon /> Login
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/discover')}>
            <DiscoverIcon /> Discover
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-brand">
          <span className="footer-brand-name">Vamos Sport Sfax</span>
        </div>
        <ul className="footer-links">
          <li><button onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}>About</button></li>
          <li><button onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}>Features</button></li>
          <li><button onClick={() => communityRef.current?.scrollIntoView({ behavior: 'smooth' })}>Community</button></li>
          <li><button onClick={() => navigate('/login')}>Login</button></li>
          <li><button onClick={() => navigate('/register')}>Join</button></li>
        </ul>
        <p className="footer-copy">© {new Date().getFullYear()} Vamos Sport Sfax. All rights reserved.</p>
      </footer>
    </>
  )
}

/* ─── Inline SVG icons ───────────────────────────────────── */
function LoginIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  )
}

function CaptainIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}

function DiscoverIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}

export default Home