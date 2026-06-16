import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake, MessageSquare, CalendarDays, Users,
  ShieldAlert, Globe, Mail, Smile, Brain, Sprout,
  Sparkles, Star, LogOut, ChevronDown
} from 'lucide-react';

export default function Landing() {
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root {
          width: 100%; min-height: 100vh; overflow-x: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #fff;
        }
        .cb-page { width: 100%; overflow-x: hidden; }

        /* ══ HEADER — matches your Header.jsx design ══ */
        .cb-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 40px;
          background-color: #f8f9fa;
          border-bottom: 2px solid #000000;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: sticky; top: 0; z-index: 200;
          transition: box-shadow .3s;
        }
        .cb-header.scrolled {
          box-shadow: 0 2px 12px rgba(0,0,0,.08);
        }

        /* Logo */
        .cb-logo {
          display: flex; align-items: center; gap: 8px;
          font-size: 24px; font-weight: 600; color: #2d6a66;
          text-decoration: none;
        }

        /* Nav */
        .cb-nav { display: flex; gap: 24px; align-items: center; }
        .cb-nav a {
          text-decoration: none; color: #4a5568;
          font-size: 16px; font-weight: 500;
          transition: color 0.2s ease; padding-bottom: 4px;
        }
        .cb-nav a:hover { color: #2d6a66; }
        .cb-nav a.active {
          color: #2d6a66; font-weight: 600;
          border-bottom: 2px solid #2d6a66;
        }

        /* Header right */
        .cb-header-right { display: flex; align-items: center; gap: 10px; }

        /* Sign In ghost */
        .cb-btn-signin {
          background: transparent; color: #2d6a66;
          border: 1.5px solid #2d6a66;
          border-radius: 8px; padding: 9px 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 15px; font-weight: 500; cursor: pointer;
          transition: background .2s; text-decoration: none;
          display: inline-flex; align-items: center;
        }
        .cb-btn-signin:hover { background: #f0faf8; }

        /* Get Started primary */
        .cb-btn-getstarted {
          background-color: #2d6a66; color: #fff;
          border: none; border-radius: 8px; padding: 10px 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 15px; font-weight: 500; cursor: pointer;
          transition: background-color 0.2s ease; text-decoration: none;
          display: inline-flex; align-items: center;
        }
        .cb-btn-getstarted:hover { background-color: #23534f; }

        /* ── User avatar + dropdown ── */
        .cb-user-menu { position: relative; }
        .cb-user-btn {
          display: flex; align-items: center; gap: 8px;
          background: #edf7f5; border: 1.5px solid rgba(45,106,102,.25);
          border-radius: 50px; padding: 5px 12px 5px 5px;
          cursor: pointer; transition: background .2s;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .cb-user-btn:hover { background: #d6eeeb; }
        .cb-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #2d6a66, #3a9d8f);
          color: #fff; font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cb-user-name { font-size: 14px; font-weight: 600; color: #2d6a66; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cb-chevron { color: #2d6a66; transition: transform .2s; }
        .cb-chevron.open { transform: rotate(180deg); }

        .cb-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #fff; border: 1px solid #d1e8e4;
          border-radius: 12px; box-shadow: 0 12px 36px rgba(0,0,0,.12);
          min-width: 185px; overflow: hidden; z-index: 300;
          animation: dropIn .16s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-dropdown-header { padding: 14px 16px 10px; border-bottom: 1px solid #eef5f4; }
        .cb-dropdown-greeting { font-size: 11.5px; color: #8a9492; }
        .cb-dropdown-name { font-size: 14px; font-weight: 600; color: #1a2220; margin-top: 2px; }
        .cb-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; font-size: 13.5px; color: #4a5568;
          cursor: pointer; transition: background .15s, color .15s;
          border: none; background: none; width: 100%; text-align: left;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .cb-dropdown-item:hover { background: #fff1f2; color: #e53935; }

        /* Hamburger */
        .cb-hamburger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 4px;
        }
        .cb-hamburger span {
          width: 22px; height: 2px; background: #2d6a66;
          border-radius: 2px; transition: all .3s; display: block;
        }
        .cb-mobile-menu {
          display: none; position: fixed; top: 62px; left: 0; right: 0;
          background: #f8f9fa; border-bottom: 2px solid #000;
          padding: 20px 24px; z-index: 190;
          flex-direction: column; gap: 14px;
        }
        .cb-mobile-menu.open { display: flex; }
        .cb-mobile-menu a { font-size: 15px; color: #1a2220; font-weight: 500; text-decoration: none; }
        .cb-mobile-signout {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; color: #e53935; font-weight: 500;
          cursor: pointer; background: none; border: none;
          font-family: 'Segoe UI', sans-serif; padding: 0;
        }

        /* ══ HERO ══ */
        .cb-hero {
          width: 100%;
          background: linear-gradient(145deg, #BEE3DB 0%, #CBE9E3 30%, #DCF2EE 65%, #EDF8F5 100%);
          display: flex; align-items: flex-start;
          justify-content: space-between;
          padding: 40px 7vw 0 7vw;
          min-height: calc(100vh - 62px);
          position: relative; overflow: hidden; gap: 0;
        }
        .cb-hero::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(21,95,90,.07) 1.2px, transparent 1.2px);
          background-size: 32px 32px;
        }
        .cb-hero-ring {
          position: absolute; top: -120px; right: -120px;
          width: 500px; height: 500px; border-radius: 50%;
          border: 60px solid rgba(255,255,255,.15); pointer-events: none;
        }
        .cb-hero-ring2 {
          position: absolute; bottom: -80px; left: 20%;
          width: 280px; height: 280px; border-radius: 50%;
          border: 40px solid rgba(255,255,255,.10); pointer-events: none;
        }

        /* LEFT */
        .cb-hero-left {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; justify-content: flex-start;
          padding-top: 40px;
          position: relative; z-index: 2; max-width: 520px;
        }

        .cb-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,.75); border: 1px solid rgba(168,218,218,.8);
          border-radius: 100px; padding: 5px 14px; font-size: 11.5px;
          color: #155F5A; font-weight: 500; margin-bottom: 18px;
          backdrop-filter: blur(8px); width: fit-content;
          box-shadow: 0 2px 12px rgba(21,95,90,.08);
        }

        .cb-hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 4.8vw, 62px);
          line-height: 1.08; color: #1A2220; margin-bottom: 16px; font-weight: 600;
        }
        .cb-hero-h1 em { font-style: italic; color: #155F5A; }

        .cb-hero-sub {
          font-size: 14.5px; color: #5A6462; line-height: 1.72;
          max-width: 400px; margin-bottom: 28px; font-weight: 300;
        }

        .cb-cta-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
        .cb-cta-primary {
          background: linear-gradient(135deg, #155F5A 0%, #2A9D8F 100%);
          color: #fff; border: none; padding: 12px 24px; border-radius: 10px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14.5px; font-weight: 600; cursor: pointer;
          transition: opacity .2s, transform .15s;
          box-shadow: 0 2px 12px rgba(21,95,90,.25); text-decoration: none;
          display: inline-flex; align-items: center;
        }
        .cb-cta-primary:hover { opacity: .88; transform: translateY(-1px); }
        .cb-cta-ghost {
          background: rgba(255,255,255,.6); color: #155F5A;
          border: 1.5px solid rgba(21,95,90,.35);
          padding: 12px 24px; border-radius: 10px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14.5px; font-weight: 500; cursor: pointer;
          transition: background .2s; text-decoration: none;
          display: inline-flex; align-items: center; backdrop-filter: blur(6px);
        }
        .cb-cta-ghost:hover { background: rgba(255,255,255,.85); }

        /* ── Inline stats (inside hero, under CTA) ── */
        .cb-inline-stats {
          display: flex; align-items: center; gap: 0;
          flex-wrap: wrap; margin-bottom: 24px;
          background: rgba(255,255,255,.45);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,.6);
          border-radius: 14px; overflow: hidden;
          width: fit-content;
          box-shadow: 0 4px 20px rgba(21,95,90,.08);
        }
        .cb-inline-stat {
          display: flex; flex-direction: column;
          align-items: center; padding: 12px 20px;
          border-right: 1px solid rgba(21,95,90,.12);
        }
        .cb-inline-stat:last-child { border-right: none; }
        .cb-inline-stat-n {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600; color: #155F5A; line-height: 1;
        }
        .cb-inline-stat-l {
          font-size: 10.5px; color: #5A6462; margin-top: 3px;
          letter-spacing: .04em; text-transform: uppercase; white-space: nowrap;
        }

        /* Trust row */
        .cb-trust {
          display: flex; align-items: center; gap: 10px;
          font-size: 12.5px; color: #5A6462;
        }
        .cb-avatars { display: flex; }
        .cb-avatars span {
          width: 28px; height: 28px; border-radius: 50%;
          border: 2px solid white; margin-left: -7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
        }
        .cb-avatars span:first-child { margin-left: 0; }
        .cb-stars { display: flex; gap: 1px; }

        /* RIGHT — mascot */
        .cb-hero-right {
          flex: 0 0 auto;
          width: clamp(320px, 42vw, 560px);
          position: relative;
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 2; overflow: visible;
          align-self: flex-end;
        }
        .cb-mascot-wrap {
          animation: floatY 4.5s ease-in-out infinite;
          width: clamp(260px, 36vw, 460px);
          position: relative; z-index: 3;
          margin-bottom: -4px;
          filter: drop-shadow(0 24px 48px rgba(21,95,90,.18));
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-18px); }
        }
        .cb-mascot-glow {
          position: absolute; bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 70%; height: 55%; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(255,255,255,.55) 0%, transparent 70%);
          pointer-events: none; z-index: 2;
        }

        /* Float cards */
        .fc {
          position: absolute;
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(194,235,224,.8);
          border-radius: 14px; padding: 10px 16px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 500; color: #1A2220;
          box-shadow: 0 8px 32px rgba(21,95,90,.13);
          white-space: nowrap; z-index: 10;
        }
        .fc1 { top: 14%; right: -4%; animation: fc1f 6s ease-in-out infinite; }
        .fc2 { bottom: 28%; right: -6%; animation: fc2f 6s ease-in-out 1.5s infinite; }
        .fc3 { bottom: 22%; left: -2%; animation: fc3f 6s ease-in-out 3s infinite; }
        @keyframes fc1f { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes fc2f { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes fc3f { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fc-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ══ MISSION ══ */
        .cb-mission {
          width: 100%; display: flex; align-items: center; gap: 56px;
          padding: 80px 7vw; background: linear-gradient(135deg, #F0FAF7, #E8F5F2);
          flex-wrap: wrap;
        }
        .cb-mission-text { flex: 1; min-width: 280px; }
        .cb-section-label {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,.8); border: 1px solid #A8DADA;
          border-radius: 100px; padding: 5px 13px;
          font-size: 11px; font-weight: 600; color: #155F5A;
          margin-bottom: 14px; letter-spacing: .08em; text-transform: uppercase;
        }
        .cb-mission-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3.5vw, 42px); color: #155F5A;
          margin-bottom: 16px; line-height: 1.18;
        }
        .cb-mission-p { font-size: 14.5px; color: #5A6462; line-height: 1.8; margin-bottom: 24px; max-width: 420px; }
        .cb-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .cb-tag {
          padding: 6px 14px; background: rgba(255,255,255,.85);
          border: 1px solid #A8DADA; border-radius: 100px;
          font-size: 12px; font-weight: 500; color: #155F5A;
        }
        .cb-mission-img {
          flex: 1; min-width: 280px; max-width: 500px;
          border-radius: 22px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(21,95,90,.14); aspect-ratio: 4/3;
        }

        /* ══ HOW IT WORKS ══ */
        .cb-how { width: 100%; padding: 80px 7vw; background: #fff; text-align: center; }
        .cb-how-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(26px, 3.5vw, 40px); color: #1A2220; margin-bottom: 6px;
        }
        .cb-how-sub { font-size: 13.5px; color: #8A9492; margin-bottom: 48px; }
        .cb-steps { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
        .cb-step {
          flex: 1; min-width: 220px; max-width: 290px;
          background: #fff; border: 1px solid #EDF7F4;
          border-radius: 20px; padding: 32px 24px; text-align: center;
          box-shadow: 0 4px 24px rgba(21,95,90,.06);
          transition: transform .25s, box-shadow .25s; position: relative; overflow: hidden;
        }
        .cb-step::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          border-radius: 20px 20px 0 0;
        }
        .cb-step:nth-child(1)::before { background: linear-gradient(90deg,#155F5A,#2A9D8F); }
        .cb-step:nth-child(2)::before { background: linear-gradient(90deg,#3A78C9,#6EB4F7); }
        .cb-step:nth-child(3)::before { background: linear-gradient(90deg,#E07B29,#F4B96A); }
        .cb-step:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(21,95,90,.12); }
        .cb-step-num {
          position: absolute; top: 14px; right: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px; font-weight: 600; color: rgba(21,95,90,.05); line-height: 1;
        }
        .cb-step-icon {
          width: 52px; height: 52px; border-radius: 15px;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 18px;
        }
        .cb-step-title { font-weight: 600; color: #1A2220; font-size: 16px; margin-bottom: 8px; }
        .cb-step-desc { font-size: 13px; color: #5A6462; line-height: 1.65; }

        /* ══ TESTIMONIALS ══ */
        .cb-testimonials {
          width: 100%; padding: 80px 7vw;
          background: linear-gradient(135deg, #155F5A, #1D7A72); text-align: center;
        }
        .cb-test-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(24px, 3vw, 36px); color: #fff; margin-bottom: 40px;
        }
        .cb-test-grid { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; }
        .cb-test-card {
          flex: 1; min-width: 230px; max-width: 310px;
          background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.14);
          border-radius: 18px; padding: 26px 24px; text-align: left;
          backdrop-filter: blur(10px); transition: background .2s;
        }
        .cb-test-card:hover { background: rgba(255,255,255,.14); }
        .cb-test-stars { display: flex; gap: 3px; margin-bottom: 12px; }
        .cb-test-quote { font-size: 13.5px; color: rgba(255,255,255,.84); line-height: 1.7; margin-bottom: 16px; font-style: italic; }
        .cb-test-author { font-size: 12px; font-weight: 600; color: #A8DADA; letter-spacing: .02em; }

        /* ══ CRISIS ══ */
        .cb-crisis { width: 100%; background: #fff; padding: 56px 7vw; }
        .cb-crisis-inner {
          background: linear-gradient(135deg, #E8F5F2, #EDF9F6);
          border: 1px solid #A8DADA; border-radius: 18px;
          padding: 24px 28px; display: flex; align-items: flex-start; gap: 14px;
        }
        .cb-crisis-text { font-size: 13.5px; color: #5A6462; line-height: 1.7; }
        .cb-crisis-text strong { color: #1A2220; }

        /* ══ FOOTER — matches your Footer.jsx design ══ */
        .cb-footer {
          background-color: #f8f9fa;
          padding: 60px 80px 30px 80px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #4a5568;
          border-top: 1px solid #e2e8f0;
        }
        .cb-footer-top {
          display: flex; justify-content: space-between;
          flex-wrap: wrap; gap: 40px; margin-bottom: 60px;
        }
        .cb-footer-brand { flex: 1 1 250px; max-width: 300px; }
        .cb-footer-logo { font-size: 24px; font-weight: 600; color: #2d6a66; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .cb-footer-tagline { font-size: 14px; line-height: 1.6; margin-bottom: 20px; color: #4a5568; }
        .cb-footer-icon-row { display: flex; gap: 12px; }
        .cb-footer-icon-circle {
          width: 36px; height: 36px; border-radius: 50%;
          background: #edf2f7; display: flex; align-items: center;
          justify-content: center; color: #2d6a66; cursor: pointer;
          transition: background .2s;
        }
        .cb-footer-icon-circle:hover { background: #d6eeeb; }

        .cb-footer-col { flex: 1 1 150px; }
        .cb-footer-col-heading {
          font-size: 14px; font-weight: 600; color: #2d6a66;
          text-transform: uppercase; letter-spacing: .05em; margin-bottom: 25px;
        }
        .cb-footer-col ul { list-style: none; padding: 0; margin: 0; }
        .cb-footer-col li { margin-bottom: 12px; }
        .cb-footer-col a {
          text-decoration: none; color: #4a5568; font-size: 14px;
          transition: color .2s;
        }
        .cb-footer-col a:hover { color: #2d6a66; }
        .cb-footer-contact-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; margin-bottom: 12px; color: #4a5568;
        }
        .cb-footer-contact-icon { color: #2d6a66; flex-shrink: 0; }

        .cb-footer-divider { border: none; border-top: 1px solid #e2e8f0; margin-bottom: 30px; }
        .cb-footer-bottom {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 20px; font-size: 14px; color: #718096;
        }
        .cb-footer-social { display: flex; gap: 24px; }
        .cb-footer-social a { text-decoration: none; color: #718096; transition: color .2s; font-size: 14px; }
        .cb-footer-social a:hover { color: #2d6a66; }

        /* ══ MOBILE ══ */
        @media (max-width: 768px) {
          .cb-nav, .cb-header-cta-group { display: none !important; }
          .cb-hamburger { display: flex !important; }
          .cb-hero { flex-direction: column; padding: 30px 6vw 0; min-height: auto; align-items: center; text-align: center; }
          .cb-hero-left { padding-top: 0; max-width: 100%; }
          .cb-hero-sub { margin: 0 auto 24px; }
          .cb-cta-row { justify-content: center; }
          .cb-trust { justify-content: center; }
          .cb-inline-stats { margin: 0 auto 24px; }
          .cb-hero-right { width: 100%; max-width: 320px; height: 280px; align-self: auto; }
          .cb-mascot-wrap { width: clamp(200px, 60vw, 260px); }
          .fc1 { top: 5%; right: 0; }
          .fc2 { bottom: 30%; right: -4%; }
          .fc3 { bottom: 25%; left: -4%; }
          .cb-user-menu { display: none !important; }
          .cb-mission, .cb-how, .cb-testimonials { padding: 60px 6vw; }
          .cb-crisis { padding: 40px 6vw; }
          .cb-footer { padding: 40px 24px 24px; }
          .cb-footer-bottom { flex-direction: column; text-align: center; }
          .cb-step, .cb-test-card { min-width: 100%; max-width: 100%; }
        }
        @media (max-width: 480px) {
          .cb-header { padding: 15px 20px; }
        }
      `}</style>

      <div className="cb-page">

        {/* ══ HEADER ══ */}
        <header className={`cb-header${scrolled ? ' scrolled' : ''}`}>
          {/* Logo */}
          <Link className="cb-logo" to="/">
            <HeartHandshake size={22} color="#2d6a66" />
            CareBridge
          </Link>

          {/* Nav */}
          <nav className="cb-nav">
            <Link to="/" className="active">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>

          {/* Right side */}
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
                    <button className="cb-dropdown-item" onClick={handleSignOut}>
                      <LogOut size={15} color="#e53935" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="cb-header-cta-group" style={{ display: 'flex', gap: 10 }}>
                <Link className="cb-btn-signin" to="/auth">Sign In</Link>
                <Link className="cb-btn-getstarted" to="/auth">Get Started</Link>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <div className="cb-hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </div>
        </header>

        {/* Mobile menu */}
        <div className={`cb-mobile-menu${menuOpen ? ' open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          {firstname ? (
            <button className="cb-mobile-signout" onClick={() => { handleSignOut(); setMenuOpen(false); }}>
              <LogOut size={16} /> Sign Out ({firstname})
            </button>
          ) : (
            <>
              <Link to="/auth" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link className="cb-btn-getstarted" to="/auth" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>

        {/* ══ HERO ══ */}
        <section className="cb-hero">
          <div className="cb-hero-ring" />
          <div className="cb-hero-ring2" />

          {/* LEFT */}
          <div className="cb-hero-left">
            <div className="cb-badge">
              <Sparkles size={12} />
              <span>AI-powered emotional support</span>
            </div>

            <h1 className="cb-hero-h1">
              Your Journey to<br />
              <em>Healing</em> Starts Here
            </h1>

            <p className="cb-hero-sub">
              Experience psychological safety with CareBridge. A gentle, modern platform designed to reduce cognitive load and prioritize your mental well-being.
            </p>

            <div className="cb-cta-row">
              <Link className="cb-cta-primary" to="/auth">Begin Your Path</Link>
              <button className="cb-cta-ghost">Learn More</button>
            </div>

            {/* Stats pill — inside hero */}
            <div className="cb-inline-stats">
              {[
                { n: '50k+', l: 'Active Journeys' },
                { n: '1.2k+', l: 'Experts' },
                { n: '4.9★', l: 'Care Rating' },
                { n: '24/7', l: 'Support' },
              ].map((s, i) => (
                <div key={i} className="cb-inline-stat">
                  <span className="cb-inline-stat-n">{s.n}</span>
                  <span className="cb-inline-stat-l">{s.l}</span>
                </div>
              ))}
            </div>

            {/* Trust */}
            <div className="cb-trust">
              <div className="cb-avatars">
                {[
                  { bg: '#2A9D8F', c: '#fff', t: 'A' },
                  { bg: '#6EB4F7', c: '#fff', t: 'M' },
                  { bg: '#F4B96A', c: '#fff', t: 'K' },
                  { bg: '#C2EBE0', c: '#155F5A', t: '+' },
                ].map((a, i) => (
                  <span key={i} style={{ background: a.bg, color: a.c }}>{a.t}</span>
                ))}
              </div>
              <div className="cb-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#F4B96A" color="#F4B96A" />)}
              </div>
              <span>50k+ journeys started</span>
            </div>
          </div>

          {/* RIGHT — mascot */}
          <div className="cb-hero-right">
            <div className="cb-mascot-glow" />
            <div className="cb-mascot-wrap">
              <svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
                <defs>
                  <radialGradient id="bodyG" cx="42%" cy="32%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                    <stop offset="70%" stopColor="#d4f0ea" stopOpacity=".96"/>
                    <stop offset="100%" stopColor="#a8dada" stopOpacity=".88"/>
                  </radialGradient>
                  <radialGradient id="headG" cx="40%" cy="30%" r="62%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                    <stop offset="60%" stopColor="#e2f6f2" stopOpacity=".98"/>
                    <stop offset="100%" stopColor="#b8e4de" stopOpacity=".9"/>
                  </radialGradient>
                  <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <ellipse cx="150" cy="372" rx="75" ry="9" fill="rgba(21,95,90,.14)"/>
                <ellipse cx="150" cy="268" rx="90" ry="100" fill="url(#bodyG)" filter="url(#softShadow)"/>
                <ellipse cx="135" cy="248" rx="30" ry="42" fill="white" opacity=".22"/>
                <ellipse cx="150" cy="140" rx="88" ry="92" fill="url(#headG)" filter="url(#softShadow)"/>
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
                <ellipse cx="226" cy="210" rx="18" ry="48" fill="url(#bodyG)" filter="url(#softShadow)" transform="rotate(-35 226 210)"/>
                <ellipse cx="232" cy="188" rx="18" ry="18" fill="url(#headG)" filter="url(#softShadow)"/>
                <ellipse cx="72" cy="240" rx="16" ry="40" fill="url(#bodyG)" filter="url(#softShadow)" transform="rotate(20 72 240)"/>
                <ellipse cx="122" cy="366" rx="28" ry="12" fill="url(#bodyG)" filter="url(#softShadow)"/>
                <ellipse cx="178" cy="366" rx="28" ry="12" fill="url(#bodyG)" filter="url(#softShadow)"/>
              </svg>
            </div>
            <div className="fc fc1">
              <div className="fc-icon" style={{ background: '#E8F5F2' }}><MessageSquare size={15} color="#155F5A" /></div>
              Chat with Aria
            </div>
            <div className="fc fc2">
              <div className="fc-icon" style={{ background: '#EAF3FF' }}><CalendarDays size={15} color="#3A78C9" /></div>
              Book a Therapist
            </div>
            <div className="fc fc3">
              <div className="fc-icon" style={{ background: '#FFF3E0' }}><Users size={15} color="#E07B29" /></div>
              Join Community
            </div>
          </div>
        </section>

        {/* ══ MISSION ══ */}
        <section className="cb-mission">
          <div className="cb-mission-text">
            <div className="cb-section-label"><Sparkles size={10} /> Our Purpose</div>
            <h2 className="cb-mission-h2">Our Mission:<br />Peace of Mind</h2>
            <p className="cb-mission-p">
              We believe mental health care should be as calming as the relief it provides. Our platform uses tonal layering and minimalist design to ensure your focus remains entirely on your healing journey.
            </p>
            <div className="cb-tags">
              {['Safe Space', 'No Pressure', 'Human-Centric', 'Accessible Care'].map(t => (
                <span key={t} className="cb-tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="cb-mission-img">
            <svg viewBox="0 0 520 390" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
              <defs>
                <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a8cfd4"/><stop offset="60%" stopColor="#cce8e8"/><stop offset="100%" stopColor="#e4f4f2"/>
                </linearGradient>
                <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#72c4c0"/><stop offset="100%" stopColor="#3a9d96"/>
                </linearGradient>
                <linearGradient id="treeG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a5a56"/><stop offset="100%" stopColor="#0d3a38"/>
                </linearGradient>
                <filter id="mist2"><feGaussianBlur stdDeviation="7"/></filter>
              </defs>
              <rect width="520" height="390" fill="url(#skyG)"/>
              <circle cx="260" cy="72" r="32" fill="white" opacity=".14"/>
              <circle cx="260" cy="72" r="20" fill="white" opacity=".20"/>
              <rect x="0" y="145" width="520" height="55" fill="white" opacity=".26" filter="url(#mist2)"/>
              <rect x="0" y="185" width="520" height="205" fill="url(#waterG)" opacity=".80"/>
              {[[22,172,21],[46,154,23],[72,164,21],[96,150,19],[118,160,17]].map(([x,y,w],i) => (
                <g key={i}>
                  <polygon points={`${x},${y} ${x-w},196 ${x+w},196`} fill="url(#treeG2)" opacity=".92"/>
                  <polygon points={`${x},${y+16} ${x-w+4},196 ${x+w-4},196`} fill="#155F5A" opacity=".55"/>
                </g>
              ))}
              {[[398,160,19],[422,146,21],[448,157,23],[470,150,19],[492,162,17]].map(([x,y,w],i) => (
                <g key={i}>
                  <polygon points={`${x},${y} ${x-w},196 ${x+w},196`} fill="url(#treeG2)" opacity=".92"/>
                  <polygon points={`${x},${y+16} ${x-w+4},196 ${x+w-4},196`} fill="#155F5A" opacity=".55"/>
                </g>
              ))}
              <ellipse cx="260" cy="190" rx="64" ry="14" fill="#1a5a56" opacity=".78"/>
              {[[238,150,14],[260,138,17],[283,146,13]].map(([x,y,w],i) => (
                <polygon key={i} points={`${x},${y} ${x-w},190 ${x+w},190`} fill="url(#treeG2)" opacity=".95"/>
              ))}
              {[0,1,2,3].map(i => (
                <ellipse key={i} cx="260" cy={215+i*22} rx={82+i*26} ry={3.5-i*0.4} fill="white" opacity={0.12-i*0.025}/>
              ))}
            </svg>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="cb-how">
          <div className="cb-section-label"><Sparkles size={10} /> The Process</div>
          <h2 className="cb-how-h2">How CareBridge Works</h2>
          <p className="cb-how-sub">Three simple steps to start your wellness journey</p>
          <div className="cb-steps">
            {[
              { num: '1', title: 'Check In', desc: "Use our simple mood tracker to help Aria understand how you're feeling today.", Icon: Smile, bg: '#E8F5F2', color: '#155F5A' },
              { num: '2', title: 'Connect', desc: 'Get matched with a therapist who aligns with your specific needs and goals.', Icon: Brain, bg: '#EAF3FF', color: '#3A78C9' },
              { num: '3', title: 'Grow', desc: 'Access personalised tools and community support to sustain your long-term healing.', Icon: Sprout, bg: '#FFF3E0', color: '#E07B29' },
            ].map(s => (
              <div key={s.num} className="cb-step">
                <div className="cb-step-num">{s.num}</div>
                <div className="cb-step-icon" style={{ background: s.bg }}><s.Icon size={22} color={s.color} /></div>
                <div className="cb-step-title">{s.num}. {s.title}</div>
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
              { q: '"CareBridge helped me find calm during the hardest period of my life. Aria felt like a real, caring presence."', name: 'Amara K., 28' },
              { q: '"The mood check-ins are so simple but powerful. I finally feel like I understand my own patterns."', name: 'Michael T., 34' },
              { q: '"Booking my therapist took less than 2 minutes. No pressure, no judgment — just support."', name: 'Kavya R., 22' },
            ].map((t, i) => (
              <div key={i} className="cb-test-card">
                <div className="cb-test-stars">{[...Array(5)].map((_, j) => <Star key={j} size={12} fill="#F4B96A" color="#F4B96A" />)}</div>
                <p className="cb-test-quote">{t.q}</p>
                <div className="cb-test-author">— {t.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CRISIS ══ */}
        <section className="cb-crisis">
          <div className="cb-crisis-inner">
            <ShieldAlert size={20} color="#155F5A" style={{ marginTop: 2, flexShrink: 0 }} />
            <p className="cb-crisis-text">
              <strong>Crisis Support: </strong>
              If you are in immediate danger, please reach out to emergency services or a crisis hotline. Call <strong>988</strong> (Suicide &amp; Crisis Lifeline) for immediate help.
            </p>
          </div>
        </section>

        {/* ══ FOOTER — matches your Footer.jsx design ══ */}
        <footer className="cb-footer">
          <div className="cb-footer-top">

            {/* Brand */}
            <div className="cb-footer-brand">
              <div className="cb-footer-logo">
                <HeartHandshake size={20} color="#2d6a66" />
                CareBridge
              </div>
              <p className="cb-footer-tagline">
                Building a future where digital serenity is accessible to everyone. Your mental well-being is our priority.
              </p>
              <div className="cb-footer-icon-row">
                <div className="cb-footer-icon-circle">
                  <Globe size={16} />
                </div>
                <div className="cb-footer-icon-circle">
                  <Mail size={16} />
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="cb-footer-col">
              <div className="cb-footer-col-heading">Resources</div>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#crisis">Crisis Support</a></li>
                <li><a href="#community">Community</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="cb-footer-col">
              <div className="cb-footer-col-heading">Company</div>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="cb-footer-col">
              <div className="cb-footer-col-heading">Contact</div>
              <div className="cb-footer-contact-item">
                <span className="cb-footer-contact-icon">
                  <Mail size={14} />
                </span>
                <span>info@carebridge.lk</span>
              </div>
              <div className="cb-footer-contact-item">
                <span className="cb-footer-contact-icon">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                </span>
                <span>No 45/7, Colombo 8</span>
              </div>
            </div>
          </div>

          <hr className="cb-footer-divider" />

          <div className="cb-footer-bottom">
            <div>© 2026 CareBridge. All rights reserved.</div>
            <div className="cb-footer-social">
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