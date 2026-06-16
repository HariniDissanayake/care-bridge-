import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, LogOut, ChevronDown } from 'lucide-react';

const T = {
  teal700: '#155F5A', teal600: '#1D7A72', teal500: '#2A9D8F',
  teal200: '#A8DADA', teal100: '#C2EBE0', teal50: '#E8F5F2',
  gray900: '#1A2220', gray600: '#5A6462', gray400: '#8A9492', white: '#FFFFFF',
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [firstname, setFirstname] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('firstname');
    if (stored) setFirstname(stored);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('firstname');
    setFirstname(null);
    setUserDropdownOpen(false);
    navigate('/');
  };

  const initials = firstname ? firstname.charAt(0).toUpperCase() : '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        /* ══ HEADER ══ */
        .cb-header {
          width: 100%; display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 5vw; height: 64px;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(194,235,224,.5);
          position: sticky; top: 0; z-index: 200;
          transition: box-shadow .3s;
        }
        .cb-header.scrolled { box-shadow: 0 2px 20px rgba(21,95,90,.08); }
        .cb-logo { display: flex; align-items: center; gap: 8px; cursor: pointer; text-decoration: none; }
        .cb-logo-text { color: #155F5A; font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; letter-spacing: -.015em; }

        .cb-nav { display: flex; gap: 6px; }
        .cb-nav a {
          font-size: 13.5px; color: #5A6462; cursor: pointer;
          padding: 6px 12px; border-radius: 8px;
          transition: color .2s, background .2s; font-weight: 400;
          text-decoration: none; font-family: 'DM Sans', sans-serif;
        }
        .cb-nav a:hover { color: #155F5A; background: #E8F5F2; }
        .cb-nav a.active { color: #155F5A; font-weight: 500; background: #E8F5F2; }

        .cb-header-right { display: flex; align-items: center; gap: 10px; }

        .cb-btn-primary {
          background: linear-gradient(135deg, #155F5A 0%, #2A9D8F 100%);
          color: #fff; border: none; padding: 10px 22px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
          cursor: pointer; transition: opacity .2s, transform .15s; white-space: nowrap;
          box-shadow: 0 2px 12px rgba(21,95,90,.22); text-decoration: none;
        }
        .cb-btn-primary:hover { opacity: .88; transform: translateY(-1px); }

        .cb-hamburger {
          display: none; flex-direction: column; gap: 4px;
          cursor: pointer; padding: 6px;
        }
        .cb-hamburger span {
          width: 20px; height: 2px; background: #155F5A;
          border-radius: 2px; transition: all .3s; display: block;
        }

        .cb-user-menu { position: relative; }
        .cb-user-btn {
          display: flex; align-items: center; gap: 8px;
          background: #EDF7F5; border: 1px solid rgba(21,95,90,.15);
          border-radius: 50px; padding: 6px 14px 6px 6px;
          cursor: pointer; transition: background .2s;
          font-family: 'DM Sans', sans-serif;
        }
        .cb-user-btn:hover { background: #D6EEEB; }
        .cb-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #155F5A, #2A9D8F);
          color: #fff; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cb-user-name { font-size: 13px; font-weight: 500; color: #155F5A; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cb-chevron { color: #155F5A; transition: transform .2s; }
        .cb-chevron.open { transform: rotate(180deg); }

        .cb-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #fff; border: 1px solid #D1E8E4;
          border-radius: 12px; box-shadow: 0 12px 36px rgba(0,0,0,.12);
          min-width: 185px; overflow: hidden; z-index: 300;
          animation: dropIn .16s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-dropdown-header { padding: 14px 16px 10px; border-bottom: 1px solid #EEF5F4; }
        .cb-dropdown-greeting { font-size: 11.5px; color: #8A9492; }
        .cb-dropdown-name { font-size: 14px; font-weight: 600; color: #1A2220; margin-top: 2px; }
        .cb-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; font-size: 13.5px; color: #5A6462;
          cursor: pointer; transition: background .15s, color .15s;
          border: none; background: none; width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
        }
        .cb-dropdown-item:hover { background: #FFF1F2; color: #E53935; }

        .cb-mobile-menu {
          position: fixed; top: 64px; left: 0; right: 0;
          background: rgba(255,255,255,.97); backdrop-filter: blur(16px);
          padding: 24px 6vw; border-bottom: 1px solid #C2EBE0;
          z-index: 190; display: none; flex-direction: column; gap: 16px;
        }
        .cb-mobile-menu.open { display: flex; }
        .cb-mobile-menu a { font-size: 15px; color: #1A2220; font-weight: 500; cursor: pointer; text-decoration: none; font-family: 'DM Sans', sans-serif; }
        .cb-mobile-signout {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; color: #E53935; font-weight: 500;
          cursor: pointer; background: none; border: none;
          font-family: 'DM Sans', sans-serif; padding: 0;
        }

        @media (max-width: 768px) {
          .cb-nav, .cb-header-right { display: none !important; }
          .cb-hamburger { display: flex !important; }
        }
      `}</style>

      <header className={`cb-header${scrolled ? ' scrolled' : ''}`}>
        <Link className="cb-logo" to="/">
          <HeartHandshake size={20} color={T.teal700} />
          <span className="cb-logo-text">CareBridge</span>
        </Link>

        <nav className="cb-nav">
          <Link to="/">Home</Link>
          <Link to="/about" className="active">About Us</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="cb-header-right">
          {firstname ? (
            <div className="cb-user-menu" ref={dropdownRef}>
              <button
                className="cb-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="cb-avatar">{initials}</div>
                <span className="cb-user-name">{firstname}</span>
                <ChevronDown size={16} className={`cb-chevron${userDropdownOpen ? ' open' : ''}`} />
              </button>
              {userDropdownOpen && (
                <div className="cb-dropdown">
                  <div className="cb-dropdown-header">
                    <div className="cb-dropdown-greeting">Welcome back,</div>
                    <div className="cb-dropdown-name">{firstname}</div>
                  </div>
                  <Link to="/dashboard" className="cb-dropdown-item">Dashboard</Link>
                  <button className="cb-dropdown-item" onClick={handleSignOut}>
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="cb-btn-primary" to="/auth">Get Started</Link>
          )}
        </div>

        <div className="cb-hamburger" onClick={() => setMenuOpen(o => !o)}>
          <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
        </div>
      </header>

      {menuOpen && (
        <div className={`cb-mobile-menu${menuOpen ? ' open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          {firstname ? (
            <button className="cb-mobile-signout" onClick={handleSignOut}>
              <LogOut size={14} /> Sign out
            </button>
          ) : (
            <Link className="cb-btn-primary" to="/auth" onClick={() => setMenuOpen(false)}>Get Started</Link>
          )}
        </div>
      )}
    </>
  );
}
