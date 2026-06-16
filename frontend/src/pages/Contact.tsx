import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake, MapPin, Mail, Share2, Globe,
  Send, ShieldCheck, Phone, Sparkles, ChevronDown,
  LayoutDashboard, LogOut, ShieldAlert
} from 'lucide-react';

export default function Contact() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [firstname, setFirstname] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [sent, setSent] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('firstname');
    if (token && stored) { setFirstname(stored); }
    else { setFirstname(null); if (!token) localStorage.removeItem('firstname'); }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token'); localStorage.removeItem('firstname');
    localStorage.removeItem('email'); localStorage.removeItem('role');
    setFirstname(null); setUserDropdownOpen(false); navigate('/');
  };

  const handleSubmit = () => {
    if (form.name && form.email && form.message) setSent(true);
  };

  const initials = firstname ? firstname.charAt(0).toUpperCase() : '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root {
          width: 100%; min-height: 100vh; overflow-x: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #c5f0e5; color: #2C3E3B;
        }

        /* ══ HEADER — identical to Landing ══ */
        .cb-header {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 0 8vw; height: 80px;
          background: rgba(247, 247, 247, 0.85);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 30px rgba(21,66,60,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.4);
          position: fixed; top: 0; left: 0; z-index: 200;
          transition: all .3s ease;
        }
        .cb-header.scrolled {
          background: rgba(248, 252, 251, 0.95);
          box-shadow: 0 4px 30px rgba(21,66,60,0.08);
        }
        .cb-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .cb-logo-icon { color: #1D5F55; display: flex; align-items: center; justify-content: center; }
        .cb-logo-text { color: #15423C; font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
        .cb-nav { display: flex; gap: 32px; margin-left: auto; margin-right: 40px; }
        .cb-nav a, .cb-nav span {
          font-size: 14px; color: #4A6360; transition: color .2s;
          font-weight: 500; text-decoration: none; cursor: pointer;
        }
        .cb-nav a:hover, .cb-nav span:hover { color: #1D5F55; }
        .cb-nav a.active, .cb-nav span.active { color: #15423C; font-weight: 600; }
        .cb-header-right { display: flex; align-items: center; gap: 12px; }
        .cb-btn-primary {
          background: #1D5F55; color: #fff; border: none; padding: 12px 24px;
          border-radius: 12px; font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all .25s ease; white-space: nowrap;
          text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
        }
        .cb-btn-primary:hover { background: #15423C; transform: translateY(-1px); }

        /* ══ USER MENU — identical to Landing ══ */
        .cb-user-menu { position: relative; }
        .cb-user-btn { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.6); border-radius: 50px; padding: 6px 16px 6px 6px; cursor: pointer; transition: all .2s; }
        .cb-user-btn:hover { background: rgba(255,255,255,0.8); }
        .cb-avatar { width: 32px; height: 32px; border-radius: 50%; background: #1D5F55; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .cb-user-name { font-size: 14px; font-weight: 600; color: #15423C; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cb-chevron { color: #15423C; transition: transform .2s; }
        .cb-chevron.open { transform: rotate(180deg); }
        .cb-dropdown { position: absolute; top: calc(100% + 10px); right: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.5); border-radius: 16px; box-shadow: 0 10px 30px rgba(21,66,60,.08); min-width: 200px; overflow: hidden; z-index: 300; animation: dropIn .2s ease; }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .cb-dropdown-header { padding: 16px 20px 12px; border-bottom: 1px solid rgba(21,66,60,0.05); }
        .cb-dropdown-greeting { font-size: 12px; color: #7A8F8B; }
        .cb-dropdown-name { font-size: 15px; font-weight: 700; color: #15423C; margin-top: 2px; }
        .cb-dropdown-item { display: flex; align-items: center; gap: 10px; padding: 12px 20px; font-size: 14px; color: #4A6360; cursor: pointer; transition: all .15s; border: none; background: none; width: 100%; text-align: left; font-family: inherit; }
        .cb-dropdown-item.dashboard { color: #1D5F55; font-weight: 500; }
        .cb-dropdown-item.dashboard:hover { background: rgba(29,95,85,0.06); }
        .cb-dropdown-item.signout:hover { background: rgba(229,57,53,0.06); color: #e53935; }

        /* ══ HAMBURGER ══ */
        .cb-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; z-index: 210; }
        .cb-hamburger span { width: 22px; height: 2px; background: #15423C; border-radius: 2px; display: block; transition: all .3s ease; }
        .cb-mobile-menu { position: fixed; top: 0; inset: 0; background: #E4F3EF; padding: 100px 8vw 40px; z-index: 190; display: flex; flex-direction: column; gap: 24px; }
        .cb-mobile-menu a, .cb-mobile-menu span { font-size: 18px; color: #15423C; font-weight: 600; text-decoration: none; cursor: pointer; }

        /* ══ PAGE BG ══ */
        .contact-page {
          padding-top: 80px;
          background: radial-gradient(circle at 80% 20%, #E0F5F0 0%, #D8F0EA 35%, #EAF6F3 70%, #E4F3EF 100%);
          min-height: 100vh;
        }

        /* ══ HERO SECTION ══ */
        .contact-hero {
          width: 100%; display: grid; grid-template-columns: 1fr 1.15fr;
          align-items: center; gap: 0;
          padding: 80px 8vw 72px; position: relative; overflow: visible;
        }
        .contact-hero-ring1 {
          position: absolute; top: -100px; right: -80px;
          width: 480px; height: 480px; border-radius: 50%;
          border: 56px solid rgba(255,255,255,0.08); pointer-events: none;
        }
        .contact-hero-ring2 {
          position: absolute; bottom: -60px; left: 40%;
          width: 280px; height: 280px; border-radius: 50%;
          border: 36px solid rgba(255,255,255,0.06); pointer-events: none;
        }

        /* ── LEFT ── */
        .contact-left { position: relative; z-index: 2; }
        .cb-section-label {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.8);
          border-radius: 100px; padding: 6px 14px; font-size: 11px; font-weight: 600;
          color: #1D5F55; letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 20px; box-shadow: 0 4px 15px rgba(21,66,60,0.02);
        }
        .contact-h1 {
          font-size: clamp(40px, 4.5vw, 62px); line-height: 1.12;
          color: #15423C; font-weight: 700; letter-spacing: -0.02em;
          margin-bottom: 20px;
        }
        .contact-sub {
          font-size: 15px; color: #536C68; line-height: 1.75;
          font-weight: 400; margin-bottom: 36px; max-width: 420px;
        }

        /* Info cards — glass style matching Landing testimonials */
        .info-cards { display: flex; flex-direction: column; gap: 14px; max-width: 420px; }
        .info-card {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px; padding: 16px 20px;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(21,66,60,0.03);
        }
        .info-card:hover {
          background: rgba(255,255,255,0.6);
          border-color: rgba(255,255,255,0.9);
          transform: translateX(4px);
          box-shadow: 0 12px 32px rgba(21,66,60,0.05);
        }
        .info-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: #1D5F55;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .info-label { font-size: 10px; font-weight: 700; color: #1D5F55; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 3px; }
        .info-val { font-size: 14px; color: #15423C; font-weight: 500; line-height: 1.45; }

        /* Mascot — floats in the gap between left panel and form card */
        .mascot-wrap {
          position: absolute;
          left: calc(45% - 6vw);
          bottom: 50%;
          transform: translateX(-50%);
          z-index: 10;
          width: clamp(260px, 15vw, 210px);
          height: clamp(220px, 10vw, 248px);
          animation: floatY 6s ease-in-out infinite;
          filter: drop-shadow(0 16px 32px rgba(21,66,60,0.12));
          pointer-events: none;
        }
        @keyframes floatY { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-12px)} }

        /* ── RIGHT — form card ── */
        .contact-right {
          display: flex; align-items: center; justify-content: flex-end;
          position: relative; z-index: 2;
        }
        .form-card {
          width: 100%; max-width: 520px;
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 28px; padding: 44px 40px;
          box-shadow: 0 20px 60px rgba(21,66,60,0.06);
        }
        .form-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.9);
          border-radius: 100px; padding: 5px 14px; font-size: 11px; font-weight: 600;
          color: #1D5F55; letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 16px;
        }
        .form-title {
          font-size: clamp(22px, 2.5vw, 28px); font-weight: 700;
          color: #15423C; margin-bottom: 28px; line-height: 1.2; letter-spacing: -0.02em;
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; }
        .form-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; }
        .form-group.in-row { margin-bottom: 0; }
        .form-label {
          font-size: 11px; font-weight: 700; color: #15423C;
          text-transform: uppercase; letter-spacing: .07em;
        }
        .form-input, .form-select, .form-textarea {
          width: 100%; padding: 12px 16px;
          background: rgba(255,255,255,0.55);
          border: 1.5px solid rgba(255,255,255,0.75);
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: #15423C;
          transition: all .2s; outline: none;
          backdrop-filter: blur(8px);
        }
        .form-input::placeholder, .form-textarea::placeholder { color: #7A9E97; }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          background: rgba(255,255,255,0.8);
          border-color: #1D5F55;
          box-shadow: 0 0 0 3px rgba(29,95,85,0.1);
        }
        .form-select {
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A9E97' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 15px center;
          background-color: rgba(255,255,255,0.55); padding-right: 40px;
        }
        .form-textarea { resize: vertical; min-height: 130px; line-height: 1.7; }
        .form-submit {
          width: 100%; padding: 14px;
          background: #1D5F55; color: #fff; border: none;
          border-radius: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 600; cursor: pointer;
          transition: all .25s ease; margin-top: 6px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 28px rgba(21,95,85,0.25);
        }
        .form-submit:hover { background: #15423C; transform: translateY(-1px); box-shadow: 0 12px 36px rgba(21,95,85,0.3); }

        /* Success state */
        .form-success {
          text-align: center; padding: 40px 0;
          display: flex; flex-direction: column; align-items: center; gap: 18px;
        }
        .form-success-icon {
          width: 68px; height: 68px; border-radius: 50%; background: #1D5F55;
          display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .form-success h3 { font-size: 26px; font-weight: 700; color: #15423C; letter-spacing: -0.02em; }
        .form-success p { font-size: 14px; color: #536C68; max-width: 280px; line-height: 1.7; }

        /* ══ CRISIS SECTION — matches Landing ══ */
        .cb-crisis { width: 100%; background: #EBF7F4; padding: 40px 8vw 80px; }
        .cb-crisis-inner {
          background: rgba(255,255,255,0.5); backdrop-filter: blur(10px);
          border: 1px solid rgba(229,57,53,0.15); border-radius: 20px;
          padding: 24px 32px; display: flex; align-items: center;
          justify-content: space-between; gap: 24px; flex-wrap: wrap;
          box-shadow: 0 10px 30px rgba(229,57,53,0.01);
        }
        .cb-crisis-left { display: flex; align-items: center; gap: 16px; }
        .cb-crisis-icon-wrap {
          width: 48px; height: 48px; border-radius: 14px; background: #1D5F55;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff;
        }
        .cb-crisis-title { font-size: 17px; font-weight: 700; color: #15423C; margin-bottom: 4px; }
        .cb-crisis-desc { font-size: 13px; color: #536C68; line-height: 1.6; }
        .cb-crisis-right { text-align: right; }
        .cb-crisis-num { font-size: 52px; font-weight: 700; color: #15423C; line-height: 1; letter-spacing: -0.02em; }
        .cb-crisis-label { font-size: 11px; font-weight: 700; color: #1D5F55; text-transform: uppercase; letter-spacing: .08em; }
        .cb-crisis-avail { font-size: 12px; color: #536C68; margin-top: 2px; }

        /* ══ FOOTER — identical to Landing ══ */
        .cb-footer {
          width: 100%; background: #0c0c0c;
          padding: 80px 8vw 32px; border-top: 1px solid rgba(255,255,255,0.05);
        }
        .cb-footer-top { display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr; gap: 56px; margin-bottom: 64px; }
        .cb-footer-brand-name { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .cb-footer-brand-name span { color: #FFFFFF; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
        .cb-footer-brand-p { font-size: 14px; color: #7A9E97; line-height: 1.7; max-width: 260px; }
        .cb-footer-col h4 { font-size: 11px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; opacity: 0.9; }
        .cb-footer-col a { display: block; font-size: 14px; color: #7A9E97; margin-bottom: 12px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .cb-footer-col a:hover { color: #AEE4DB; }
        .cb-footer-connect { display: flex; gap: 12px; margin-top: 4px; }
        .cb-footer-icon { width: 38px; height: 38px; border-radius: 11px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
        .cb-footer-icon:hover { background: rgba(52,160,146,0.15); border-color: rgba(52,160,146,0.3); transform: translateY(-1px); }
        .cb-footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #4E6E68; }
        .cb-footer-links { display: flex; gap: 20px; }
        .cb-footer-links a { color: #4E6E68; text-decoration: none; transition: color .2s; }
        .cb-footer-links a:hover { color: #7A9E97; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1024px) {
          .cb-footer-top { grid-template-columns: 1.5fr 1fr; gap: 40px; }
          .contact-hero { gap: 32px; }
        }
        @media (max-width: 900px) {
          .contact-hero { grid-template-columns: 1fr; padding: 60px 6vw; gap: 40px; }
          .contact-right { justify-content: center; }
          .form-card { max-width: 100%; }
          .mascot-wrap {
            position: relative;
            left: 0; bottom: 0;
            transform: none;
            margin-top: 28px;
            width: clamp(100px, 28vw, 130px);
            animation: floatYm 6s ease-in-out infinite;
          }
          @keyframes floatYm { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        }
        @media (max-width: 768px) {
          .cb-nav { display: none; }
          .cb-header-right .cb-btn-primary { display: none; }
          .cb-hamburger { display: flex; }
          .cb-footer-top { grid-template-columns: 1fr; gap: 36px; }
          .cb-footer-bottom { flex-direction: column; text-align: center; }
          .cb-crisis-right { text-align: left; }
        }
        @media (max-width: 560px) {
          .form-row { grid-template-columns: 1fr; }
          .form-card { padding: 28px 22px; }
        }
      `}</style>

      {/* ══ HEADER ══ */}
      <header className={`cb-header${scrolled ? ' scrolled' : ''}`}>
        <Link className="cb-logo" to="/">
          <div className="cb-logo-icon"><HeartHandshake size={22} strokeWidth={2.5} /></div>
          <span className="cb-logo-text">CareBridge</span>
        </Link>

        <nav className="cb-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <span className="active">Contact Us</span>
        </nav>

        <div className="cb-header-right">
          {firstname ? (
            <div className="cb-user-menu" ref={dropdownRef}>
              <div className="cb-user-btn" onClick={() => setUserDropdownOpen(o => !o)}>
                <div className="cb-avatar">{initials}</div>
                <span className="cb-user-name">{firstname}</span>
                <ChevronDown size={14} className={`cb-chevron${userDropdownOpen ? ' open' : ''}`} />
              </div>
              {userDropdownOpen && (
                <div className="cb-dropdown">
                  <div className="cb-dropdown-header">
                    <div className="cb-dropdown-greeting">Signed in as</div>
                    <div className="cb-dropdown-name">{firstname}</div>
                  </div>
                  <button className="cb-dropdown-item dashboard" onClick={() => { setUserDropdownOpen(false); navigate('/dashboard'); }}>
                    <LayoutDashboard size={15} /> Dashboard
                  </button>
                  <button className="cb-dropdown-item signout" onClick={handleSignOut}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="cb-btn-primary" to="/auth">Get Started</Link>
          )}

          <div className="cb-hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(5px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-5px)' : 'none' }} />
          </div>
        </div>
      </header>

      {/* ══ MOBILE MENU ══ */}
      {menuOpen && (
        <div className="cb-mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
          <span onClick={() => setMenuOpen(false)}>Contact Us</span>
          {firstname ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <span style={{ color: '#e53935' }} onClick={() => { handleSignOut(); setMenuOpen(false); }}>Sign Out</span>
            </>
          ) : (
            <Link className="cb-btn-primary" to="/auth" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>Get Started</Link>
          )}
        </div>
      )}

      <div className="contact-page">

        {/* ══ HERO + FORM ══ */}
        <section className="contact-hero">
          <div className="contact-hero-ring1" />
          <div className="contact-hero-ring2" />

          {/* LEFT */}
          <div className="contact-left">
            <div className="cb-section-label">
              <Sparkles size={12} fill="currentColor" opacity={0.2} /> Get in Touch
            </div>
            <h1 className="contact-h1">We're Here<br />For You</h1>
            <p className="contact-sub">
              We're here to provide a safe space for your questions. Reach out and let's start your journey toward digital serenity.
            </p>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon"><MapPin size={17} color="#fff" /></div>
                <div>
                  <div className="info-label">Our Sanctuary</div>
                  <div className="info-val">No.473 ,colombo 08, Sri Lanaka</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon"><Mail size={17} color="#fff" /></div>
                <div>
                  <div className="info-label">Email Us</div>
                  <div className="info-val">support@carebridge.com</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon"><Phone size={17} color="#fff" /></div>
                <div>
                  <div className="info-label">Call Us</div>
                  <div className="info-val">0112 465 871</div>
                </div>
              </div>
            </div>

          </div>

          {/* Mascot — absolutely placed in the gap between left and right columns */}
          <svg className="mascot-wrap" viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="bGc" cx="42%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                <stop offset="70%" stopColor="#d4f0ea" stopOpacity=".96"/>
                <stop offset="100%" stopColor="#a8dada" stopOpacity=".88"/>
              </radialGradient>
              <radialGradient id="hGc" cx="40%" cy="30%" r="62%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                <stop offset="60%" stopColor="#e2f6f2" stopOpacity=".98"/>
                <stop offset="100%" stopColor="#b8e4de" stopOpacity=".9"/>
              </radialGradient>
              <filter id="ssc" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <ellipse cx="150" cy="372" rx="75" ry="9" fill="rgba(21,95,90,.14)"/>
            <ellipse cx="150" cy="268" rx="90" ry="100" fill="url(#bGc)" filter="url(#ssc)"/>
            <ellipse cx="135" cy="248" rx="30" ry="42" fill="white" opacity=".22"/>
            <ellipse cx="150" cy="140" rx="88" ry="92" fill="url(#hGc)" filter="url(#ssc)"/>
            <ellipse cx="124" cy="108" rx="26" ry="30" fill="white" opacity=".28" transform="rotate(-15 124 108)"/>
            <ellipse cx="122" cy="136" rx="13" ry="16" fill="#1A2220"/>
            <ellipse cx="178" cy="136" rx="13" ry="16" fill="#1A2220"/>
            <ellipse cx="126" cy="130" rx="5" ry="5" fill="white" opacity=".85"/>
            <ellipse cx="182" cy="130" rx="5" ry="5" fill="white" opacity=".85"/>
            <ellipse cx="118" cy="140" rx="2.5" ry="2.5" fill="white" opacity=".5"/>
            <ellipse cx="174" cy="140" rx="2.5" ry="2.5" fill="white" opacity=".5"/>
            <ellipse cx="100" cy="158" rx="14" ry="8" fill="#fda4af" opacity=".3"/>
            <ellipse cx="200" cy="158" rx="14" ry="8" fill="#fda4af" opacity=".3"/>
            <path d="M 122 170 Q 150 192 178 170" stroke="#1A2220" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <ellipse cx="226" cy="210" rx="18" ry="48" fill="url(#bGc)" filter="url(#ssc)" transform="rotate(-35 226 210)"/>
            <ellipse cx="232" cy="188" rx="18" ry="18" fill="url(#hGc)" filter="url(#ssc)"/>
            <ellipse cx="72" cy="240" rx="16" ry="40" fill="url(#bGc)" filter="url(#ssc)" transform="rotate(20 72 240)"/>
            <ellipse cx="122" cy="366" rx="28" ry="12" fill="url(#bGc)" filter="url(#ssc)"/>
            <ellipse cx="178" cy="366" rx="28" ry="12" fill="url(#bGc)" filter="url(#ssc)"/>
          </svg>

          {/* RIGHT — FORM */}
          <div className="contact-right">
            <div className="form-card">
              {sent ? (
                <div className="form-success">
                  <div className="form-success-icon"><ShieldCheck size={30} /></div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button className="form-submit" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => setSent(false)}>
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-badge">
                    <Sparkles size={11} fill="currentColor" opacity={0.3} /> Send a Message
                  </div>
                  <div className="form-title">How can we help you?</div>

                  <div className="form-row">
                    <div className="form-group in-row">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" placeholder="arie" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group in-row">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" placeholder="hello@carebridge.io" type="email" value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-select" value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                      <option>General Inquiry</option>
                      <option>Book a Therapist</option>
                      <option>Technical Support</option>
                      <option>Crisis Support</option>
                      <option>Feedback</option>
                      <option>Partnership</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" placeholder="How can we help you today?"
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>

                  <button className="form-submit" onClick={handleSubmit}>
                    <Send size={16} /> Send Message
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ══ CRISIS SECTION ══ */}
        <section className="cb-crisis">
          <div className="cb-crisis-inner">
            <div className="cb-crisis-left">
              <div className="cb-crisis-icon-wrap"><ShieldAlert size={22} /></div>
              <div>
                <div className="cb-crisis-title">Immediate Support</div>
                <p className="cb-crisis-desc">If you are experiencing a crisis or need immediate assistance, please don't wait. Reach out now.</p>
              </div>
            </div>
            <div className="cb-crisis-right">
              <div className="cb-crisis-num">988</div>
              <div className="cb-crisis-label">Suicide &amp; Crisis Lifeline</div>
              <div className="cb-crisis-avail">Available 24/7 · Free · Confidential</div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="cb-footer">
          <div className="cb-footer-top">
            <div>
              <div className="cb-footer-brand-name">
                <HeartHandshake size={20} color="#34A092" />
                <span>CareBridge</span>
              </div>
              <p className="cb-footer-brand-p">Building a future where digital serenity is accessible to everyone. Your mental well-being is our priority.</p>
              <div className="cb-footer-connect" style={{ marginTop: '20px' }}>
                <div className="cb-footer-icon"><Share2 size={15} color="#7A9E97" /></div>
                <div className="cb-footer-icon"><Mail size={15} color="#7A9E97" /></div>
                <div className="cb-footer-icon"><Globe size={15} color="#7A9E97" /></div>
              </div>
            </div>
            <div className="cb-footer-col">
              <h4>Resources</h4>
              <a href="#help">Help Center</a>
              <a href="#docs">Documentation</a>
              <a href="#crisis">Crisis Support</a>
              <a href="#community">Community</a>
            </div>
            <div className="cb-footer-col">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <a href="#careers">Careers</a>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
            <div className="cb-footer-col">
              <h4>Contact</h4>
              <a href="mailto:hello@carebridge.io">hello@carebridge.io</a>
              <div style={{ color: '#7A9E97', fontSize: '13.5px', marginTop: '4px' }}>San Francisco, CA</div>
            </div>
          </div>
          <div className="cb-footer-bottom">
            <span>© 2026 CareBridge. All rights reserved.</span>
            <div className="cb-footer-links">
              <a href="#twitter">Twitter</a>
              <a href="#linkedin">LinkedIn</a>
              <a href="#instagram">Instagram</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}