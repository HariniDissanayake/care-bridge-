import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake, MessageSquare, CalendarDays, Users,
  Globe, Mail, Smile, Brain, Sprout,
  Sparkles, Star, LogOut, ChevronDown, LayoutDashboard, ArrowRight,
  ShieldAlert,
  Share2,
  CheckCircle2
} from 'lucide-react';

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

export default function Landing() {
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
          padding: 0 8vw; height: 80px;
          background: transparent; 
          position: absolute; top: 0; left: 0; z-index: 200; transition: all .3s ease;
          line-height: 1; color: #15423C;
        }
        .cb-header.scrolled { 
          position: fixed; height: 70px;
          background: rgba(220, 245, 238, 0.85); 
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 30px rgba(21, 66, 60, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.4);
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
        .cb-btn-ghost:hover { background: rgba(255, 255, 255, 0.4); }
        
        /* ══ USER MENU ══ */
        .cb-user-menu { position: relative; }
        .cb-user-btn { display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.5); border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 50px; padding: 6px 16px 6px 6px; cursor: pointer; transition: all .2s; }
        .cb-user-btn:hover { background: rgba(255, 255, 255, 0.8); }
        .cb-avatar { width: 32px; height: 32px; border-radius: 50%; background: #1D5F55; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .cb-user-name { font-size: 14px; font-weight: 600; color: #15423C; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cb-chevron { color: #15423C; transition: transform .2s; }
        .cb-chevron.open { transform: rotate(180deg); }
        .cb-dropdown { position: absolute; top: calc(100% + 10px); right: 0; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 16px; box-shadow: 0 10px 30px rgba(21,66,60,.08); min-width: 200px; overflow: hidden; z-index: 300; animation: dropIn .2s ease; }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .cb-dropdown-header { padding: 16px 20px 12px; border-bottom: 1px solid rgba(21, 66, 60, 0.05); }
        .cb-dropdown-greeting { font-size: 12px; color: #7A8F8B; }
        .cb-dropdown-name { font-size: 15px; font-weight: 700; color: #15423C; margin-top: 2px; }
        .cb-dropdown-item { display: flex; align-items: center; gap: 10px; padding: 12px 20px; font-size: 14px; color: #4A6360; cursor: pointer; transition: all .15s; border: none; background: none; width: 100%; text-align: left; font-family: inherit; }
        .cb-dropdown-item.dashboard { color: #1D5F55; font-weight: 500; }
        .cb-dropdown-item.dashboard:hover { background: rgba(29, 95, 85, 0.06); }
        .cb-dropdown-item.signout:hover { background: rgba(229, 57, 53, 0.06); color: #e53935; }

        /* ══ HERO CONTAINER ══ */
        .cb-hero-section {
          width: 100%; min-height: 100vh; position: relative; 
          background: radial-gradient(circle at 80% 20%, #E0F5F0 0%, #D8F0EA 35%, #EAF6F3 70%, #E4F3EF 100%);
          display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;
        }
        
        .cb-hero-bg-wave {
          position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0.7;
          background: radial-gradient(circle at 90% 50%, rgba(255,255,255,0.6) 0%, transparent 60%),
                      radial-gradient(circle at 10% 90%, rgba(255,255,255,0.4) 0%, transparent 50%);
        }

        /* Subtle decorative circles in background */
        .cb-hero-decor {
          position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
        }
        .cb-hero-decor::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          border: 1px solid rgba(29, 95, 85, 0.07);
          right: -80px; top: -100px;
        }
        .cb-hero-decor::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          border: 1px solid rgba(29, 95, 85, 0.05);
          right: 60px; top: 20px;
        }

        .cb-hero-content {
          flex: 1; display: flex; align-items: center; justify-content: space-between;
          padding: 120px 8vw 40px; position: relative; z-index: 2; gap: 40px;
        }

        .cb-hero-left { flex: 1; max-width: 560px; display: flex; flex-direction: column; justify-content: center; }
        
        .cb-badge { 
          display: inline-flex; align-items: center; gap: 8px; 
          background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.8); 
          border-radius: 100px; padding: 6px 16px; font-size: 13px; color: #4A6360; font-weight: 500; 
          margin-bottom: 24px; width: fit-content; box-shadow: 0 4px 15px rgba(21, 66, 60, 0.02);
        }
        .cb-badge svg { color: #1D5F55; }
        
        .cb-hero-h1 { font-size: clamp(40px, 4.5vw, 64px); line-height: 1.15; color: #15423C; margin-bottom: 24px; font-weight: 700; letter-spacing: -0.02em; }
        .cb-hero-sub { font-size: 15.5px; color: #536C68; line-height: 1.65; margin-bottom: 36px; max-width: 460px; }
        
        .cb-cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 36px; }
        .cb-btn-secondary {
          background: transparent; color: #15423C; border: 1px solid rgba(21, 66, 60, 0.2); padding: 12px 24px; border-radius: 12px;
          font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
          white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
        }
        .cb-btn-secondary:hover { background: rgba(255, 255, 255, 0.4); border-color: rgba(21, 66, 60, 0.4); }

        .cb-trust { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #536C68; font-weight: 500; }
        .cb-avatars { display: flex; }
        .cb-avatars span { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #D8F0EA; margin-left: -8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
        .cb-avatars span:first-child { margin-left: 0; }
        .cb-stars { display: flex; gap: 2px; color: #E29A5B; }

        /* ══ HERO RIGHT — 3D MASCOT ══ */
        .cb-hero-right { 
          flex: 1; display: flex; align-items: center; justify-content: center; 
          position: relative; max-width: 560px; min-height: 460px;
        }
        
        .cb-mascot-scene {
          position: relative; width: 100%; height: 460px;
          display: flex; align-items: center; justify-content: center;
        }

        /* Ground shadow ellipse */
        .cb-mascot-shadow {
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
          width: 180px; height: 22px; background: radial-gradient(ellipse, rgba(21,66,60,0.10) 0%, transparent 70%);
          border-radius: 50%; z-index: 1;
          animation: shadowPulse 6s ease-in-out infinite;
        }
        @keyframes shadowPulse { 0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 1; } 50% { transform: translateX(-50%) scaleX(0.88); opacity: 0.75; } }

        .cb-mascot-wrap { 
          position: relative; z-index: 2; width: 400px;
          animation: floatY 6s ease-in-out infinite;
          filter: drop-shadow(0 24px 40px rgba(21, 66, 60, 0.10));
        }
        @keyframes floatY { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }

        /* ══ FLOATING CARDS (matching screenshot) ══ */
        .fc { 
          position: absolute;
          background: rgba(255, 255, 255, 0.55); 
          backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px); 
          border: 1px solid rgba(255, 255, 255, 0.75); border-radius: 16px; 
          padding: 14px 18px; display: flex; align-items: center; gap: 12px; 
          box-shadow: 0 8px 32px rgba(21, 66, 60, 0.05); white-space: nowrap; z-index: 10; 
          min-width: 220px;
        }
        .fc-icon { 
          width: 36px; height: 36px; border-radius: 10px; 
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: rgba(52, 160, 146, 0.12);
        }
        .fc-text { display: flex; flex-direction: column; gap: 2px; }
        .fc-title { font-size: 13px; font-weight: 700; color: #15423C; line-height: 1.2; }
        .fc-sub { font-size: 11.5px; color: #536C68; font-weight: 500; }
        .fc-check { 
          width: 20px; height: 20px; border-radius: 50%; 
          background: #1D5F55; display: flex; align-items: center; justify-content: center;
          margin-left: auto; flex-shrink: 0;
        }

        /* Card positions matching the screenshot */
        .fc1 { top: 6%; right: -4%; animation: floatCard1 7s ease-in-out infinite; }
        .fc2 { bottom: 28%; right: -8%; animation: floatCard2 8s ease-in-out infinite 1s; }
        .fc3 { bottom: 16%; left: -12%; animation: floatCard3 9s ease-in-out infinite 0.5s; }

        @keyframes floatCard1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes floatCard2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatCard3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

        /* ══ COMPACT GLASS STATS GRID ══ */
        .cb-stats-strip {
          width: 84vw; margin: 0 auto 40px; position: relative; z-index: 10;
          display: grid; grid-template-columns: repeat(4, 1fr);
          background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.7); border-radius: 24px;
          box-shadow: 0 20px 50px rgba(21, 66, 60, 0.04); overflow: hidden;
        }
        .cb-stat-box { 
          padding: 32px 24px; text-align: center; display: flex; flex-direction: column; gap: 6px;
          border-right: 1px solid rgba(255, 255, 255, 0.5); position: relative;
        }
        .cb-stat-box:last-child { border-right: none; }
        .cb-stat-num { font-size: 38px; font-weight: 700; color: #15423C; letter-spacing: -0.02em; }
        .cb-stat-lbl { font-size: 12px; color: #536C68; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
        .cb-stat-graphic { margin-bottom: 8px; display: flex; justify-content: center; color: #1D5F55; opacity: 0.8; }

        .cb-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; z-index: 210; }
        .cb-hamburger span { width: 22px; height: 2px; background: #15423C; border-radius: 2px; display: block; transition: all .3s ease; }
        .cb-mobile-menu { position: fixed; top: 0; inset: 0; background: #E4F3EF; padding: 100px 8vw 40px; z-index: 190; display: flex; flex-direction: column; gap: 24px; }
        .cb-mobile-menu a { font-size: 18px; color: #15423C; font-weight: 600; text-decoration: none; }
        
        /* ══ RESPONSIVE BREAKPOINTS ══ */
        @media (max-width: 1100px) {
          .cb-hero-content { flex-direction: column; text-align: center; padding-top: 140px; }
          .cb-hero-left { align-items: center; max-width: 100%; }
          .cb-hero-sub { max-width: 520px; }
          .cb-cta-row { justify-content: center; }
          .cb-trust { justify-content: center; }
          .cb-hero-right { width: 100%; margin-top: 20px; margin-bottom: 40px; }
          .cb-stats-strip { grid-template-columns: repeat(2, 1fr); gap: 0; width: 92vw; }
          .cb-stat-box:nth-child(2) { border-right: none; }
          .cb-stat-box:nth-child(1), .cb-stat-box:nth-child(2) { border-bottom: 1px solid rgba(255, 255, 255, 0.5); }
          .fc1 { right: 0; } .fc2 { right: -2%; } .fc3 { left: -2%; }
        }
        @media (max-width: 768px) {
          .cb-nav { display: none; }
          .cb-header-right .cb-btn-ghost, .cb-header-right .cb-btn-primary { display: none; }
          .cb-hamburger { display: flex; }
          .fc { padding: 10px 14px; font-size: 12px; min-width: 180px; }
          .fc-title { font-size: 12px; }
          .fc-sub { font-size: 10.5px; }
        }
        @media (max-width: 520px) {
          .cb-stats-strip { grid-template-columns: 1fr; width: 92vw; }
          .cb-stat-box { border-right: none !important; border-bottom: 1px solid rgba(255, 255, 255, 0.5); }
          .cb-stat-box:last-child { border-bottom: none; }
          .fc1 { top: 5%; right: -2%; }
          .fc2 { bottom: 28%; right: -5%; }
          .fc3 { bottom: 12%; left: -5%; }
          .fc { min-width: 160px; }
        }

        /* ══ REIFIED BASICS ══ */
        .cb-section-label { 
          display: inline-flex; align-items: center; gap: 6px; 
          background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.8); 
          border-radius: 100px; padding: 6px 14px; font-size: 11px; font-weight: 600; 
          color: #1D5F55; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 18px;
          box-shadow: 0 4px 15px rgba(21, 66, 60, 0.02);
        }
        .cb-section-label svg { color: #34A092; }

        /* ══ MISSION SECTION ══ */
        .cb-mission { 
          width: 100%; display: flex; align-items: center; gap: 64px; 
          padding: 100px 8vw; background: radial-gradient(circle at 10% 20%, #F0FAf7 0%, #E4F3EF 100%); 
          flex-wrap: wrap; position: relative;
        }
        .cb-mission-text { flex: 1; min-width: 300px; }
        .cb-mission-h2 { font-size: clamp(32px, 3.8vw, 48px); font-weight: 700; color: #15423C; margin-bottom: 20px; line-height: 1.2; letter-spacing: -0.02em; }
        .cb-mission-p { font-size: 15px; color: #536C68; line-height: 1.75; margin-bottom: 28px; max-width: 480px; }
        .cb-tags { display: flex; flex-wrap: wrap; gap: 10px; }
        .cb-tag { 
          padding: 8px 18px; background: rgba(255, 255, 255, 0.5); 
          border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 100px; 
          font-size: 13px; font-weight: 500; color: #1D5F55; backdrop-filter: blur(5px);
          box-shadow: 0 2px 10px rgba(21, 66, 60, 0.01);
        }
        .cb-mission-img { 
          flex: 1; min-width: 300px; max-width: 520px; border-radius: 28px; overflow: hidden; 
          box-shadow: 0 25px 55px rgba(21, 66, 60, 0.06); aspect-ratio: 4/3; 
          border: 1px solid rgba(255, 255, 255, 0.5); background: rgba(255,255,255,0.2);
        }

        /* ══ HOW IT WORKS SECTION ══ */
        .cb-how { width: 100%; padding: 100px 8vw; background: #EBF7F4; text-align: center; }
        .cb-how-h2 { font-size: clamp(30px, 3.5vw, 44px); font-weight: 700; color: #15423C; margin-bottom: 12px; letter-spacing: -0.02em; }
        .cb-how-sub { font-size: 15px; color: #536C68; margin-bottom: 56px; }
        .cb-steps { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }
        .cb-step { 
          flex: 1; min-width: 260px; max-width: 340px; 
          background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.7); border-radius: 24px; 
          padding: 40px 28px; text-align: center; 
          box-shadow: 0 15px 40px rgba(21, 66, 60, 0.03); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
          position: relative; overflow: hidden; 
        }
        .cb-step:hover { transform: translateY(-6px); background: rgba(255, 255, 255, 0.6); box-shadow: 0 22px 50px rgba(21, 66, 60, 0.06); }
        .cb-step-num { position: absolute; top: 12px; right: 20px; font-size: 48px; font-weight: 800; color: rgba(21, 66, 60, 0.03); line-height: 1; pointer-events: none; }
        .cb-step-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 22px; box-shadow: inset 0 2px 8px rgba(255,255,255,0.4); }
        .cb-step-title { font-weight: 700; color: #15423C; font-size: 18px; margin-bottom: 10px; }
        .cb-step-desc { font-size: 14px; color: #536C68; line-height: 1.65; }

        /* ══ TESTIMONIALS SECTION ══ */
        .cb-testimonials { 
          width: 100%; padding: 100px 8vw; 
          background: radial-gradient(circle at 50% 50%, #1D5F55 0%, #15423C 100%); 
          text-align: center; position: relative;
        }
        .cb-test-h2 { font-size: clamp(28px, 3.5vw, 42px); font-weight: 700; color: #FFFFFF; margin-bottom: 52px; letter-spacing: -0.01em; }
        .cb-test-grid { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }
        .cb-test-card { 
          flex: 1; min-width: 260px; max-width: 350px; 
          background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.12); 
          border-radius: 24px; padding: 36px 28px; text-align: left; 
          backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
          transition: all 0.25s ease; 
        }
        .cb-test-card:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }
        .cb-test-stars { display: flex; gap: 4px; margin-bottom: 16px; color: #E29A5B; }
        .cb-test-quote { font-size: 14.5px; color: rgba(255, 255, 255, 0.88); line-height: 1.7; margin-bottom: 20px; font-weight: 400; }
        .cb-test-author { font-size: 13px; font-weight: 600; color: #AEE4DB; letter-spacing: 0.02em; }

        /* ══ CRISIS ADVISORY SECTION ══ */
        .cb-crisis { width: 100%; background: #EBF7F4; padding: 40px 8vw 80px; }
        .cb-crisis-inner { 
          background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(10px);
          border: 1px solid rgba(229, 57, 53, 0.15); border-radius: 20px; 
          padding: 24px 32px; display: flex; align-items: flex-start; gap: 16px; 
          box-shadow: 0 10px 30px rgba(229, 57, 53, 0.01);
        }
        .cb-crisis-text { font-size: 14px; color: #536C68; line-height: 1.7; }
        .cb-crisis-text strong { color: #15423C; font-weight: 600; }
        .cb-crisis-highlight { color: #D32F2F; font-weight: 700; }

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

        /* ══ INLINE SECTIONAL RESPONSIVENESS ══ */
        @media (max-width: 1024px) {
          .cb-footer-top { grid-template-columns: 1.5fr 1fr; gap: 40px; }
          .cb-mission { gap: 40px; padding: 80px 6vw; justify-content: center; }
          .cb-mission-text { text-align: center; }
          .cb-mission-p { margin-left: auto; margin-right: auto; }
          .cb-tags { justify-content: center; }
          .cb-mission-img { max-width: 100%; }
        }
        @media (max-width: 768px) {
          .cb-mission, .cb-how, .cb-testimonials { padding: 70px 6vw; }
          .cb-crisis { padding: 20px 6vw 60px; }
          .cb-steps { gap: 16px; }
          .cb-step { min-width: 100%; max-width: 100%; padding: 32px 24px; }
          .cb-test-card { min-width: 100%; max-width: 100%; }
          .cb-footer-top { grid-template-columns: 1fr; gap: 36px; }
          .cb-footer-bottom { flex-direction: column; text-align: center; gap: 12px; }
        }
      `}</style>

      <div className="cb-hero-section">
        <div className="cb-hero-bg-wave" />
        <div className="cb-hero-decor" />

        {/* ══ HEADER ══ */}
        <header className={`cb-header${scrolled ? ' scrolled' : ''}`}>
          <Link className="cb-logo" to="/">
            <div className="cb-logo-icon"><HeartHandshake size={22} strokeWidth={2.5} /></div>
            <span className="cb-logo-text">CareBridge</span>
          </Link>

          <nav className="cb-nav">
            <Link to="/" className="active">Home</Link>
            <Link to="/about">About Us</Link>
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

        {/* ══ MOBILE NAVIGATION MENU ══ */}
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
              <>
                <Link className="cb-btn-primary" to="/auth" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>Get Started</Link>
              </>
            )}
          </div>
        )}

        {/* ══ HERO BODY ══ */}
        <section className="cb-hero-content">
          <div className="cb-hero-left">
            <div className="cb-badge"><Sparkles size={14} fill="currentColor" opacity={0.2} /> Trusted Mental Wellness Platform</div>
            <h1 className="cb-hero-h1">Your Journey to<br />Healing Starts Here</h1>
            <p className="cb-hero-sub">
              Experience psychological safety with CareBridge. A gentle, modern platform designed to reduce cognitive load and prioritize your mental well-being.
            </p>
            <div className="cb-cta-row">
              {firstname ? (
                <Link className="cb-btn-primary" to="/dashboard">Go to Dashboard <ArrowRight size={15} /></Link>
              ) : (
                <>
                  <Link className="cb-btn-primary" to="/auth">Begin Your Path</Link>
                  <Link className="cb-btn-secondary" to="/about">Learn More <ArrowRight size={14} /></Link>
                </>
              )}
            </div>
            
            <div className="cb-trust">
              <div className="cb-avatars">
                {[{bg:'#2A9D8F',t:'A'},{bg:'#6EB4F7',t:'M'},{bg:'#E29A5B',t:'K'}].map((a,i) => (
                  <span key={i} style={{background:a.bg}}>{a.t}</span>
                ))}
                <span style={{background:'#AEE4DB', color:'#1D5F55'}}>+</span>
              </div>
              <div className="cb-stars">
                {[...Array(5)].map((_,i) => <Star key={i} size={14} fill="currentColor" stroke="none" />)}
              </div>
              <span>50K+ journeys started</span>
            </div>
          </div>

          {/* ══ HERO RIGHT — 3D Mascot with new floating cards ══ */}
          <div className="cb-hero-right">
            <div className="cb-mascot-scene">

              {/* Ground shadow */}
              <div className="cb-mascot-shadow" />

              {/* 3D-style mascot SVG */}
              <div className="cb-mascot-wrap">
                <svg viewBox="0 0 260 320" xmlns="http://www.w3.org/2000/svg" style={{width:'100%', height:'auto'}}>
                  <defs>
                    {/* Main body gradient - glossy white-mint */}
                    <radialGradient id="bodyG3D" cx="38%" cy="28%" r="65%">
                      <stop offset="0%" stopColor="#FFFFFF"/>
                      <stop offset="50%" stopColor="#EEF9F6"/>
                      <stop offset="85%" stopColor="#C8E9E3"/>
                      <stop offset="100%" stopColor="#A8D9D1"/>
                    </radialGradient>
                    {/* Head gradient */}
                    <radialGradient id="headG3D" cx="36%" cy="25%" r="62%">
                      <stop offset="0%" stopColor="#FFFFFF"/>
                      <stop offset="45%" stopColor="#F5FBFA"/>
                      <stop offset="80%" stopColor="#D2EEE9"/>
                      <stop offset="100%" stopColor="#B8DED8"/>
                    </radialGradient>
                    {/* Arm gradient */}
                    <radialGradient id="armG3D" cx="30%" cy="20%" r="70%">
                      <stop offset="0%" stopColor="#F8FDFC"/>
                      <stop offset="60%" stopColor="#DDF0EC"/>
                      <stop offset="100%" stopColor="#BBDDD7"/>
                    </radialGradient>
                    {/* Leg gradient */}
                    <radialGradient id="legG3D" cx="35%" cy="20%" r="65%">
                      <stop offset="0%" stopColor="#FFFFFF"/>
                      <stop offset="55%" stopColor="#E4F4F1"/>
                      <stop offset="100%" stopColor="#C0E4DE"/>
                    </radialGradient>
                    {/* Specular highlight */}
                    <radialGradient id="specular" cx="40%" cy="25%" r="40%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.9)"/>
                      <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                    </radialGradient>
                    {/* Drop shadow filter */}
                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(21,66,60,0.12)"/>
                    </filter>
                    <filter id="innerGlow" x="-5%" y="-5%" width="110%" height="110%">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                  </defs>

                  {/* ── LEFT ARM (behind body) ── */}
                  <ellipse cx="52" cy="195" rx="22" ry="13" fill="url(#armG3D)" transform="rotate(25 52 195)" filter="url(#softShadow)" opacity="0.9"/>

                  {/* ── BODY ── */}
                  <ellipse cx="130" cy="230" rx="72" ry="78" fill="url(#bodyG3D)" filter="url(#softShadow)"/>
                  {/* Body specular highlight */}
                  <ellipse cx="108" cy="195" rx="28" ry="22" fill="url(#specular)" opacity="0.6"/>

                  {/* ── HEAD ── */}
                  <ellipse cx="130" cy="118" rx="74" ry="72" fill="url(#headG3D)" filter="url(#softShadow)"/>
                  {/* Head specular */}
                  <ellipse cx="108" cy="90" rx="28" ry="20" fill="url(#specular)" opacity="0.7"/>

                  {/* ── EYES ── */}
                  {/* Eye whites */}
                  <ellipse cx="108" cy="114" rx="16" ry="19" fill="white"/>
                  <ellipse cx="152" cy="114" rx="16" ry="19" fill="white"/>
                  {/* Pupils */}
                  <ellipse cx="110" cy="116" rx="10" ry="13" fill="#1A2E2B"/>
                  <ellipse cx="154" cy="116" rx="10" ry="13" fill="#1A2E2B"/>
                  {/* Iris highlight */}
                  <circle cx="113" cy="110" r="4" fill="white" opacity="0.9"/>
                  <circle cx="157" cy="110" r="4" fill="white" opacity="0.9"/>
                  {/* Small catchlight */}
                  <circle cx="107" cy="120" r="2" fill="white" opacity="0.5"/>
                  <circle cx="151" cy="120" r="2" fill="white" opacity="0.5"/>

                  {/* ── BLUSH CHEEKS ── */}
                  <ellipse cx="86" cy="138" rx="14" ry="8" fill="#FFB3C6" opacity="0.38"/>
                  <ellipse cx="174" cy="138" rx="14" ry="8" fill="#FFB3C6" opacity="0.38"/>

                  {/* ── SMILE ── */}
                  <path d="M 108 154 Q 130 174 152 154" stroke="#1A2E2B" strokeWidth="4.5" fill="none" strokeLinecap="round"/>

                  {/* ── RIGHT ARM (front) ── */}
                  <ellipse cx="204" cy="192" rx="22" ry="13" fill="url(#armG3D)" transform="rotate(-22 204 192)" filter="url(#softShadow)"/>

                  {/* ── LEFT FOOT ── */}
                  <ellipse cx="106" cy="302" rx="30" ry="14" fill="url(#legG3D)" filter="url(#softShadow)"/>
                  {/* Left foot sheen */}
                  <ellipse cx="98" cy="297" rx="10" ry="5" fill="url(#specular)" opacity="0.5"/>

                  {/* ── RIGHT FOOT ── */}
                  <ellipse cx="158" cy="302" rx="30" ry="14" fill="url(#legG3D)" filter="url(#softShadow)"/>
                  {/* Right foot sheen */}
                  <ellipse cx="150" cy="297" rx="10" ry="5" fill="url(#specular)" opacity="0.5"/>
                </svg>
              </div>

              {/* ── FLOATING CARD 1: Open Aria (top right) ── */}
              <div className="fc fc1">
                <div className="fc-icon" style={{background:'rgba(52,160,146,0.13)'}}>
                  <MessageSquare size={17} color="#1D5F55" />
                </div>
                <div className="fc-text">
                  <div className="fc-title">Open Aria &amp; Ask a Question</div>
                  <div className="fc-sub">— Get Your Task Done</div>
                </div>
                <div className="fc-check">
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>

              {/* ── FLOATING CARD 2: Book Appointment (middle right) ── */}
              <div className="fc fc2">
                <div className="fc-icon" style={{background:'rgba(110,180,247,0.13)'}}>
                  <CalendarDays size={17} color="#3A78C9" />
                </div>
                <div className="fc-text">
                  <div className="fc-title">Book an Appointment Now</div>
                  <div className="fc-sub">— Lock in Your Session</div>
                </div>
                <div className="fc-check">
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>

              {/* ── FLOATING CARD 3: Explore Community (bottom left) ── */}
              <div className="fc fc3">
                <div className="fc-icon" style={{background:'rgba(226,154,91,0.13)'}}>
                  <Users size={17} color="#E29A5B" />
                </div>
                <div className="fc-text">
                  <div className="fc-title">Explore &amp; Join Community</div>
                  <div className="fc-sub">— Find Support Today</div>
                </div>
                <div className="fc-check" style={{background:'#34A092'}}>
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ COMPACT GRID STATS ══ */}
        <section className="cb-stats-strip">
          <div className="cb-stat-box">
            <div className="cb-stat-graphic"><Sprout size={20} /></div>
            <div className="cb-stat-num">50k+</div>
            <div className="cb-stat-lbl">Active Journeys</div>
          </div>
          <div className="cb-stat-box">
            <div className="cb-stat-graphic"><Brain size={20} /></div>
            <div className="cb-stat-num">1.2k+</div>
            <div className="cb-stat-lbl">Certified Experts</div>
          </div>
          <div className="cb-stat-box">
            <div className="cb-stat-graphic"><Smile size={20} /></div>
            <div className="cb-stat-num">4.9/5</div>
            <div className="cb-stat-lbl">Care Rating</div>
          </div>
          <div className="cb-stat-box">
            <div className="cb-stat-graphic"><Globe size={20} /></div>
            <div className="cb-stat-num">24/7</div>
            <div className="cb-stat-lbl">Safe Support</div>
          </div>
        </section>
      </div>

      {/* ══ MISSION ══ */}
      <section className="cb-mission">
        <div className="cb-mission-text">
          <div className="cb-section-label"><Sparkles size={12} fill="currentColor" opacity={0.2} /> Our Purpose</div>
          <h2 className="cb-mission-h2">Our Mission:<br />Peace of Mind</h2>
          <p className="cb-mission-p">We believe mental health care should be as calming as the relief it provides. Our platform uses tonal layering and minimalist design to ensure your focus remains entirely on your healing journey.</p>
          <div className="cb-tags">
            {['Safe Space', 'No Pressure', 'Human-Centric', 'Accessible Care'].map(t => (
              <span key={t} className="cb-tag">{t}</span>
            ))}
          </div>
        </div>
        <div className="cb-mission-img">
          <img src="https://media.northwesternmutual.com/images/article/featured/2400x1350/2098-multigenerational-family-talking-about-money-1077528666.webp" alt="CareBridge Mission" style={{width:'100%', height:'100%', objectFit:'cover'}} />
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="cb-how">
        <div className="cb-section-label"><Sparkles size={12} fill="currentColor" opacity={0.2} /> The Process</div>
        <h2 className="cb-how-h2">How CareBridge Works</h2>
        <p className="cb-how-sub">Three simple steps to start your wellness journey</p>
        <div className="cb-steps">
          {[
            {num:'1',title:'Check In',desc:"Use our simple mood tracker to help Aria understand how you're feeling today.",Icon:Smile,bg:'rgba(52, 160, 146, 0.12)',color:'#1D5F55'},
            {num:'2',title:'Connect',desc:'Get matched with a therapist who aligns with your specific needs and goals.',Icon:Brain,bg:'rgba(110, 180, 247, 0.12)',color:'#3A78C9'},
            {num:'3',title:'Grow',desc:'Access personalised tools and community support to sustain your long-term healing.',Icon:Sprout,bg:'rgba(226, 154, 91, 0.12)',color:'#E07B29'},
          ].map(s => (
            <div key={s.num} className="cb-step">
              <div className="cb-step-num">0{s.num}</div>
              <div className="cb-step-icon" style={{background:s.bg}}><s.Icon size={24} color={s.color} /></div>
              <div className="cb-step-title">{s.title}</div>
              <p className="cb-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="cb-testimonials">
        <h2 className="cb-test-h2">Voices from Our Community</h2>
        <div className="cb-test-grid">
          {[
            {q:'"CareBridge helped me find calm during the hardest period of my life. Aria felt like a real, caring presence."',name:'Amara K., 28'},
            {q:'"The mood check-ins are so simple but powerful. I finally feel like I understand my own patterns."',name:'Michael T., 34'},
            {q:'"Booking my therapist took less than 2 minutes. No pressure, no judgment — just support."',name:'Kavya R., 22'},
          ].map((t,i) => (
            <div key={i} className="cb-test-card">
              <div className="cb-test-stars">
                {[...Array(5)].map((_,j) => <Star key={j} size={13} fill="currentColor" stroke="none" />)}
              </div>
              <p className="cb-test-quote">{t.q}</p>
              <div className="cb-test-author">— {t.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CRISIS ADVISORY ══ */}
      <section className="cb-crisis">
        <div className="cb-crisis-inner">
          <ShieldAlert size={22} color="#E53935" style={{marginTop:2, flexShrink:0}} />
          <p className="cb-crisis-text">
            <strong className="cb-crisis-highlight">Crisis Support: </strong>
            If you are in immediate danger, please reach out to emergency services or a crisis hotline. We are here to support your journey, but some situations require urgent professional intervention. Call <strong>988</strong> (Suicide &amp; Crisis Lifeline) for immediate help.
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