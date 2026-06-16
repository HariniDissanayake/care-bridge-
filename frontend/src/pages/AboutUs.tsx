import { Link } from 'react-router-dom';
import {
  HeartHandshake, MessageSquare, Users, Shield,
  Sparkles, Info, Globe, Mail, Brain, Sprout,
  Share2,
  Star, ChevronDown, LogOut, LayoutDashboard, ArrowRight
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const T = {
  mint900: '#15423C',
  mint700: '#1D5F55',
  mint600: '#267A6E',
  mint500: '#34A092',
  mint200: '#AEE4DB',
  mint100: '#D5F2EC',
  mint50: '#F0FAf7',
  white: '#FFFFFF',
};

export default function AboutUs() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [firstname, setFirstname] = useState<string | null>(null);
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

  const initials = firstname ? firstname.charAt(0).toUpperCase() : '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; overflow-x: hidden; font-family: 'Plus Jakarta Sans', sans-serif; background: #EBF7F4; color: #2C3E3B; }

        /* ══ HEADER ══ */
        .cb-header {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 0 8vw; height: 80px; background: transparent;
          position: fixed; top: 0; left: 0; z-index: 200; transition: all .3s ease;
        }
        .cb-header.scrolled {
          height: 70px;
          background: rgba(208,243,236,0.85);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 30px rgba(21,66,60,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.4);
        }
        .cb-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .cb-logo-icon { color: #1D5F55; display: flex; align-items: center; justify-content: center; }
        .cb-logo-text { color: #15423C; font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
        .cb-nav { display: flex; gap: 32px; margin-left: auto; margin-right: 40px; }
        .cb-nav a { font-size: 14px; color: #4A6360; transition: color .2s; font-weight: 500; text-decoration: none; }
        .cb-nav a:hover { color: #1D5F55; }
        .cb-nav a.active { color: #15423C; font-weight: 600; }
        .cb-header-right { display: flex; align-items: center; gap: 12px; }
        .cb-btn-primary {
          background: #1D5F55; color: #fff; border: none; padding: 12px 24px; border-radius: 12px;
          font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .25s ease;
          white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
        }
        .cb-btn-primary:hover { background: #15423C; transform: translateY(-1px); }
        .cb-btn-ghost {
          background: transparent; color: #15423C; border: none; padding: 12px 20px; border-radius: 12px;
          font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
          white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center;
        }
        .cb-btn-ghost:hover { background: rgba(255,255,255,0.4); }
        .cb-btn-secondary {
          background: transparent; color: #15423C; border: 1px solid rgba(21,66,60,0.2); padding: 12px 24px; border-radius: 12px;
          font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
          white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
        }
        .cb-btn-secondary:hover { background: rgba(255,255,255,0.4); border-color: rgba(21,66,60,0.4); }

        /* ══ USER MENU ══ */
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
        .cb-mobile-menu a { font-size: 18px; color: #15423C; font-weight: 600; text-decoration: none; }

        /* ══ SECTION LABEL ══ */
        .cb-section-label {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.8);
          border-radius: 100px; padding: 6px 14px; font-size: 11px; font-weight: 600;
          color: #1D5F55; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 18px;
          box-shadow: 0 4px 15px rgba(21,66,60,0.02);
        }
        .cb-section-label svg { color: #34A092; }

        /* ══ BADGE ══ */
        .cb-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.8);
          border-radius: 100px; padding: 6px 16px; font-size: 13px; color: #4A6360; font-weight: 500;
          margin-bottom: 24px; width: fit-content; box-shadow: 0 4px 15px rgba(21,66,60,0.02);
        }
        .cb-badge svg { color: #1D5F55; }

        /* ══ ABOUT HERO ══ */
        .ab-hero {
          width: 100%; min-height: 100vh; position: relative;
          background: radial-gradient(circle at 80% 20%, #E0F5F0 0%, #D8F0EA 35%, #EAF6F3 70%, #E4F3EF 100%);
          display: flex; align-items: center; justify-content: space-between;
          padding: 120px 8vw 80px; gap: 40px; overflow: hidden;
        }
        .ab-hero-bg {
          position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0.7;
          background: radial-gradient(circle at 90% 50%, rgba(255,255,255,0.6) 0%, transparent 60%),
                      radial-gradient(circle at 10% 90%, rgba(255,255,255,0.4) 0%, transparent 50%);
        }
        .ab-hero-left { flex: 1; max-width: 580px; position: relative; z-index: 2; }
        .ab-hero-right { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; max-width: 560px; }
        .ab-h1 { font-size: clamp(40px, 4.5vw, 64px); line-height: 1.15; color: #15423C; margin-bottom: 24px; font-weight: 700; letter-spacing: -0.02em; }
        .ab-sub { font-size: 16px; color: #536C68; line-height: 1.65; margin-bottom: 36px; max-width: 480px; }
        .ab-cta-row { display: flex; gap: 14px; flex-wrap: wrap; }

        /* ══ MASCOT + FLOAT CARDS ══ */
        .ab-mascot-wrap {
          position: relative; z-index: 2; width: 68%; max-width: 360px;
          animation: floatY 6s ease-in-out infinite;
          filter: drop-shadow(0 20px 40px rgba(21,66,60,0.08));
        }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .fc {
          position: absolute; background: rgba(255,255,255,0.4);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.6); border-radius: 14px;
          padding: 12px 20px; display: flex; align-items: center; gap: 10px;
          font-size: 14px; font-weight: 600; color: #15423C;
          box-shadow: 0 10px 30px rgba(21,66,60,0.03); white-space: nowrap; z-index: 10;
        }
        .fc-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fc1 { top: 10%; right: -5%; }
        .fc2 { bottom: 38%; right: -10%; }
        .fc3 { bottom: 28%; left: -10%; }

        /* ══ MISSION SECTION ══ */
        .cb-mission {
          width: 100%; display: flex; align-items: flex-start; gap: 64px;
          padding: 100px 8vw; background: radial-gradient(circle at 10% 20%, #F0FAf7 0%, #E4F3EF 100%);
          flex-wrap: wrap; position: relative;
        }
        .cb-mission-text { flex: 1.4; min-width: 300px; }
        .cb-mission-h2 { font-size: clamp(32px, 3.8vw, 48px); font-weight: 700; color: #15423C; margin-bottom: 20px; line-height: 1.2; letter-spacing: -0.02em; }
        .cb-mission-p { font-size: 15px; color: #536C68; line-height: 1.75; margin-bottom: 28px; max-width: 480px; }

        .cb-info-row-card {
          background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7); border-radius: 20px;
          padding: 22px 26px; display: flex; gap: 16px; align-items: flex-start;
          margin-bottom: 16px; box-shadow: 0 10px 30px rgba(21,66,60,0.03);
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .cb-info-row-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.6); box-shadow: 0 16px 40px rgba(21,66,60,0.06); }
        .cb-row-card-title { font-size: 11px; font-weight: 700; color: #1D5F55; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
        .cb-row-card-p { font-size: 14px; color: #536C68; line-height: 1.65; }

        .cb-mission-grid-col { flex: 1; min-width: 240px; display: flex; flex-direction: column; gap: 20px; }
        .cb-square-card {
          background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7); border-radius: 24px; padding: 32px 28px;
          display: flex; flex-direction: column; gap: 12px;
          box-shadow: 0 10px 30px rgba(21,66,60,0.03);
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .cb-square-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.6); box-shadow: 0 16px 40px rgba(21,66,60,0.06); }
        .cb-square-card-title { font-size: 20px; font-weight: 700; color: #15423C; letter-spacing: -0.01em; }
        .cb-square-card-p { font-size: 14px; color: #536C68; line-height: 1.65; }

        /* ══ PILLARS SECTION ══ */
        .cb-pillars-section {
          width: 100%; padding: 70px 8vw;
          background: radial-gradient(circle at 80% 20%, #E0F5F0 0%, #D8F0EA 35%, #EAF6F3 70%, #E4F3EF 100%);
          text-align: center;
        }
        .cb-pillars-header h2 { font-size: clamp(26px,3.5vw,38px); font-weight: 700; color: #15423C; margin-bottom: 10px; letter-spacing: -0.02em; }
        .cb-pillars-header p { font-size: 14px; color: #536C68; margin-bottom: 36px; max-width: 560px; margin-left: auto; margin-right: auto; line-height: 1.7; }

        /* Top two-col grid */
        .cb-pillars-grid { display: grid; grid-template-columns: 1.6fr 1.1fr; gap: 18px; margin-bottom: 18px; text-align: left; }

        /* ── REDUCED: Big card ── */
        .cb-pillar-big-card {
          background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; padding: 28px 30px;
          display: flex; flex-direction: column; justify-content: space-between; min-height: 200px;
          box-shadow: 0 10px 30px rgba(21,66,60,0.03);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .cb-pillar-big-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.6); box-shadow: 0 18px 40px rgba(21,66,60,0.06); }

        .cb-pillar-icon-wrap { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        /* ── REDUCED: Pillar title ── */
        .cb-pillar-title { font-size: clamp(18px,1.8vw,22px); font-weight: 700; color: #15423C; margin-top: 12px; margin-bottom: 8px; letter-spacing: -0.01em; }
        .cb-pillar-p { font-size: 13.5px; color: #536C68; line-height: 1.7; }

        /* Avatar group */
        .cb-avatar-group { display: flex; align-items: center; gap: 10px; margin-top: 18px; }
        .cb-avatar-circles { display: flex; align-items: center; }
        .cb-avatar-circle { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); margin-left: -8px; display: flex; align-items: center; justify-content: center; }
        .cb-avatar-circle:first-child { margin-left: 0; }
        .cb-avatar-text { font-size: 12px; color: #536C68; }

        /* ── REDUCED: Side card ── */
        .cb-pillar-side-card {
          background: rgba(174,228,219,0.25); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.6); border-radius: 20px; padding: 24px 22px;
          display: flex; flex-direction: column; justify-content: space-between; gap: 14px;
          box-shadow: 0 10px 30px rgba(21,66,60,0.03);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .cb-pillar-side-card:hover { transform: translateY(-4px); background: rgba(174,228,219,0.4); box-shadow: 0 18px 40px rgba(21,66,60,0.06); }

        .cb-integrity-img {
          width: 100%; border-radius: 12px; overflow: hidden; aspect-ratio: 2.8;
          background: rgba(21,66,60,0.06); display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,0.5);
        }

        /* Sub-grid three-col */
        .cb-pillars-subgrid { display: grid; grid-template-columns: 1.1fr 1.6fr 0.6fr; gap: 18px; text-align: left; }

        /* ── REDUCED: Sub cards ── */
        .cb-subcard-clean {
          background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7); border-radius: 16px; padding: 20px 18px;
          display: flex; flex-direction: column; justify-content: flex-start; gap: 8px;
          position: relative; box-shadow: 0 8px 24px rgba(21,66,60,0.03);
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .cb-subcard-clean:hover { transform: translateY(-3px); background: rgba(255,255,255,0.6); box-shadow: 0 14px 36px rgba(21,66,60,0.06); }

        .cb-subcard-dark {
          background: radial-gradient(circle at 50% 50%, #1D5F55 0%, #15423C 100%);
          border-radius: 16px; padding: 20px;
          display: flex; align-items: center; justify-content: center; color: #FFFFFF;
          box-shadow: 0 12px 32px rgba(21,66,60,0.15);
        }

        /* ══ NOTICE BANNER ══ */
        .cb-notice-section { width: 100%; background: radial-gradient(circle at 80% 20%, #E0F5F0 0%, #D8F0EA 35%, #EAF6F3 70%, #E4F3EF 100%); padding: 0 8vw 80px; }
        .cb-notice-inner {
          background: rgba(255,255,255,0.5); backdrop-filter: blur(10px);
          border: 1px solid rgba(42,157,143,0.2); border-radius: 20px;
          padding: 24px 32px; display: flex; align-items: flex-start; gap: 16px;
          box-shadow: 0 10px 30px rgba(21,66,60,0.02);
        }
        .cb-notice-text { font-size: 14px; color: #536C68; line-height: 1.7; }
        .cb-notice-text strong { color: #15423C; font-weight: 600; }

        /* ══ FOOTER ══ */
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
        @media (max-width: 1100px) {
          .ab-hero { flex-direction: column; text-align: center; padding-top: 140px; padding-bottom: 60px; }
          .ab-hero-left { max-width: 100%; display: flex; flex-direction: column; align-items: center; }
          .ab-sub { max-width: 520px; }
          .ab-cta-row { justify-content: center; }
          .ab-hero-right { margin-top: 40px; }
          .cb-pillars-grid { grid-template-columns: 1fr; }
          .cb-pillars-subgrid { grid-template-columns: 1fr 1fr; }
          .cb-mission { gap: 40px; }
          .cb-footer-top { grid-template-columns: 1.5fr 1fr; gap: 40px; }
        }
        @media (max-width: 768px) {
          .cb-nav { display: none; }
          .cb-header-right .cb-btn-ghost, .cb-header-right .cb-btn-primary { display: none; }
          .cb-hamburger { display: flex; }
          .cb-mission { flex-direction: column; padding: 70px 6vw; text-align: center; }
          .cb-mission-text { min-width: 100%; }
          .cb-mission-p { margin-left: auto; margin-right: auto; }
          .cb-mission-grid-col { min-width: 100%; }
          .cb-pillars-section { padding: 50px 6vw; }
          .cb-pillars-subgrid { grid-template-columns: 1fr; }
          .cb-notice-section { padding: 0 6vw 60px; }
          .cb-footer-top { grid-template-columns: 1fr; gap: 36px; }
          .cb-footer-bottom { flex-direction: column; text-align: center; gap: 12px; }
          .fc1 { right: 0; } .fc2 { right: -2%; } .fc3 { left: -2%; }
        }
        @media (max-width: 520px) {
          .fc { padding: 10px 14px; font-size: 12px; }
          .fc1 { top: 5%; right: -2%; } .fc2 { bottom: 28%; right: -3%; } .fc3 { bottom: 18%; left: -3%; }
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
          <Link to="/about" className="active">About Us</Link>
          <Link to="/contact">Contact Us</Link>
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
            <>
              <Link className="cb-btn-primary" to="/auth">Get Started</Link>
            </>
          )}
          <div className="cb-hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(5px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-5px)' : 'none' }} />
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="cb-mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          {firstname ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <span style={{ cursor: 'pointer', fontWeight: 600, color: '#e53935' }} onClick={() => { handleSignOut(); setMenuOpen(false); }}>Sign Out</span>
            </>
          ) : (
            <Link className="cb-btn-primary" to="/auth" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>Get Started</Link>
          )}
        </div>
      )}

      {/* ══ ABOUT HERO ══ */}
      <section className="ab-hero">
        <div className="ab-hero-bg" />

        <div className="ab-hero-left">
          <div className="cb-badge"><HeartHandshake size={14} /> EMPATHY FIRST</div>
          <h1 className="ab-h1">About CareBridge</h1>
          <p className="ab-sub">
            We believe that mental health is a human right, not a luxury. CareBridge is built to be the companion you need when navigating life's complex emotional landscapes.
          </p>
          <div className="ab-cta-row">
            {firstname ? (
              <Link className="cb-btn-primary" to="/dashboard">Go to Dashboard <ArrowRight size={15} /></Link>
            ) : (
              <>
                <Link className="cb-btn-primary" to="/auth">Join Our Community</Link>
                <Link className="cb-btn-secondary" to="/contact">Contact Us <ArrowRight size={14} /></Link>
              </>
            )}
          </div>
        </div>

        <div className="ab-hero-right">
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <div className="ab-mascot-wrap">
              <svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
                <defs>
                  <radialGradient id="bodyG_ab" cx="42%" cy="32%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                    <stop offset="70%" stopColor="#d4f0ea" stopOpacity=".96"/>
                    <stop offset="100%" stopColor="#a8dada" stopOpacity=".88"/>
                  </radialGradient>
                  <radialGradient id="headG_ab" cx="40%" cy="30%" r="62%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                    <stop offset="60%" stopColor="#e2f6f2" stopOpacity=".98"/>
                    <stop offset="100%" stopColor="#b8e4de" stopOpacity=".9"/>
                  </radialGradient>
                  <filter id="softShadow_ab" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <ellipse cx="150" cy="372" rx="75" ry="9" fill="rgba(21,95,90,.14)"/>
                <ellipse cx="150" cy="268" rx="90" ry="100" fill="url(#bodyG_ab)" filter="url(#softShadow_ab)"/>
                <ellipse cx="135" cy="248" rx="30" ry="42" fill="white" opacity=".22"/>
                <ellipse cx="150" cy="140" rx="88" ry="92" fill="url(#headG_ab)" filter="url(#softShadow_ab)"/>
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
                <ellipse cx="226" cy="210" rx="18" ry="48" fill="url(#bodyG_ab)" filter="url(#softShadow_ab)" transform="rotate(-35 226 210)"/>
                <ellipse cx="232" cy="188" rx="18" ry="18" fill="url(#headG_ab)" filter="url(#softShadow_ab)"/>
                <ellipse cx="72" cy="240" rx="16" ry="40" fill="url(#bodyG_ab)" filter="url(#softShadow_ab)" transform="rotate(20 72 240)"/>
                <ellipse cx="122" cy="366" rx="28" ry="12" fill="url(#bodyG_ab)" filter="url(#softShadow_ab)"/>
                <ellipse cx="178" cy="366" rx="28" ry="12" fill="url(#bodyG_ab)" filter="url(#softShadow_ab)"/>
              </svg>
            </div>

            <div className="fc fc1">
              <div className="fc-icon" style={{ background: 'rgba(52,160,146,0.15)' }}><MessageSquare size={15} color="#1D5F55" /></div>
              Chat with Aria
            </div>
            <div className="fc fc2">
              <div className="fc-icon" style={{ background: 'rgba(110,180,247,0.15)' }}><Shield size={15} color="#3A78C9" /></div>
              Safe & Private
            </div>
            <div className="fc fc3">
              <div className="fc-icon" style={{ background: 'rgba(226,154,91,0.15)' }}><Users size={15} color="#E29A5B" /></div>
              50k+ Members
            </div>
          </div>
        </div>
      </section>

      {/* ══ MISSION & OBJECTIVES ══ */}
      <section className="cb-mission">
        <div className="cb-mission-text">
          <div className="cb-section-label"><Sparkles size={12} fill="currentColor" opacity={0.2} /> Our Purpose</div>
          <h2 className="cb-mission-h2">Our Mission: Fostering Digital Serenity</h2>
          <p className="cb-mission-p">
            In an era of constant noise, we provide the silence. Our platform is designed to reduce cognitive load, offering a sanctuary for reflection and healing.
          </p>

          <div className="cb-info-row-card">
            <div style={{ color: '#1D5F55', marginTop: '2px', flexShrink: 0 }}><Shield size={18} /></div>
            <div>
              <div className="cb-row-card-title">Psychological Safety</div>
              <div className="cb-row-card-p">A non-judgmental space built on the foundations of privacy and supportive guidance.</div>
            </div>
          </div>

          <div className="cb-info-row-card">
            <div style={{ color: '#1D5F55', marginTop: '2px', flexShrink: 0 }}><HeartHandshake size={18} /></div>
            <div>
              <div className="cb-row-card-title">Accessible Care</div>
              <div className="cb-row-card-p">Breaking down systemic barriers to high-quality mental health support for everyone.</div>
            </div>
          </div>
        </div>

        <div className="cb-mission-grid-col" style={{ justifyContent: 'flex-end', paddingTop: '20px' }}>
          <div className="cb-square-card">
            <div style={{ color: '#1D5F55' }}><Users size={26} /></div>
            <div className="cb-square-card-title">Community</div>
            <p className="cb-square-card-p">Building a collective of shared experiences where no one walks alone.</p>
          </div>
        </div>

        <div className="cb-mission-grid-col" style={{ justifyContent: 'flex-end' }}>
          <div className="cb-square-card">
            <div style={{ color: '#1D5F55' }}><Sparkles size={26} /></div>
            <div className="cb-square-card-title">Innovation</div>
            <p className="cb-square-card-p">Using technology not to replace human connection, but to enhance it.</p>
          </div>
        </div>
      </section>

      {/* ══ PILLARS ══ */}
      <section className="cb-pillars-section">
        <div className="cb-pillars-header">
          <div className="cb-section-label" style={{ margin: '0 auto 18px' }}><Sparkles size={12} fill="currentColor" opacity={0.2} /> Our Values</div>
          <h2>The Pillars of CareBridge</h2>
          <p>Our values are not just words; they are the architectural principles of every interaction we design.</p>
        </div>

        {/* Top row: big card + side card */}
        <div className="cb-pillars-grid">
          <div className="cb-pillar-big-card">
            <div>
              <div className="cb-pillar-icon-wrap" style={{ background: 'rgba(52,160,146,0.12)' }}>
                <Sparkles size={16} color="#1D5F55" />
              </div>
              <h3 className="cb-pillar-title">Always Here for You</h3>
              <p className="cb-pillar-p">
                Emotional support available anytime through thoughtful and understanding AI assistance.
              </p>
            </div>
            <div className="cb-avatar-group">
              <div className="cb-avatar-circles">
                <span className="cb-avatar-circle" style={{ background: '#AEE4DB', color: '#1D5F55', fontSize: '11px', fontWeight: 'bold' }}>✓</span>
                <span className="cb-avatar-circle" style={{ background: '#D5F2EC' }}></span>
                <span className="cb-avatar-circle" style={{ background: '#E29A5B', color: '#fff', fontSize: '10px', fontWeight: '600' }}>+12k</span>
              </div>
              <span className="cb-avatar-text">Supporting a growing global community.</span>
            </div>
          </div>
          </div>

         

        

        {/* Sub-grid row */}
        <div className="cb-pillars-subgrid">
          <div className="cb-subcard-clean">
            <span style={{ color: '#1D5F55' }}><HeartHandshake size={16} /></span>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#15423C' }}>Expert Guidance</h4>
            <img src="https://media.yogauonline.com/app/uploads/2021/04/06052120/5_how_to_promote_resilience_through_supporting_community_organizations_like_yoga_studies-1.webp" alt="Mindful Flow" style={{ width: '100%', borderRadius: '10px', marginTop: '6px', marginBottom: '8px' }} />
            <p style={{ fontSize: '12.5px', color: '#536C68', lineHeight: '1.6' }}>Find qualified therapists and take the next step toward professional mental wellness support.</p>
          </div>

          <div className="cb-subcard-clean">
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#15423C' }}>Stronger Together</h4>
            <p style={{ fontSize: '12.5px', color: '#536C68', lineHeight: '1.6' }}>Connect with people who understand and build confidence through shared experiences and peer support.</p>
            <img src="https://cfhh.ca/wp-content/uploads/Dealing-with-family-and-friends-when-you-are-in-recovery-768x432.jpeg" alt="Two people embracing in support" style={{ width: '100%', borderRadius: '10px', marginTop: '6px', marginBottom: '8px' }} />
          </div>

          
        </div>
      </section>

      {/* ══ NOTICE BANNER ══ */}
      <section className="cb-notice-section">
        <div className="cb-notice-inner">
          <div style={{ marginTop: '2px', flexShrink: 0, color: '#1D5F55' }}><Info size={16} /></div>
          <p className="cb-notice-text">
            <strong>Notice:</strong> CareBridge is a supportive guide and companion. If you are experiencing a crisis, please contact your local emergency services or a crisis hotline immediately. Call <strong>988</strong> (Suicide &amp; Crisis Lifeline) for immediate help.
          </p>
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
    </>
  );
}