import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake, ChevronDown, LayoutDashboard, LogOut,
  Brain, Heart, Users, Baby, ShieldCheck, Skull, Stethoscope,
  CircleHelp, Search, ArrowRight, X, Sparkles, ShieldAlert,
  Leaf, Wind, Flame, Star, ChevronRight, CheckCircle2,
  Share2, Mail, Globe, MessageSquare, CalendarDays
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  { key: 'anxiety',      label: 'Anxiety & Stress',     icon: Wind,        color: '#2A7D6F', bg: '#D6F0EC', emoji: '🌬️', desc: 'Panic attacks, overthinking, chronic stress and worry management.', path: '/therapists/anxiety' },
  { key: 'depression',   label: 'Depression',           icon: Heart,       color: '#C0392B', bg: '#FDECEA', emoji: '💛', desc: 'Low mood, sadness, hopelessness, loss of motivation or interest.', path: '/therapists/depression' },
  { key: 'relationship', label: 'Relationships',        icon: Users,       color: '#8E44AD', bg: '#F3E8FB', emoji: '💞', desc: 'Couples therapy, family conflict, communication and separation.', path: '/therapists/relationships' },
  { key: 'trauma',       label: 'Trauma & PTSD',        icon: ShieldCheck, color: '#1A5276', bg: '#D6EAF8', emoji: '🛡️', desc: 'Abuse recovery, flashbacks, PTSD and complex trauma processing.', path: '/therapists/trauma' },
  { key: 'child',        label: 'Child & Teen',         icon: Baby,        color: '#1E8449', bg: '#D5F5E3', emoji: '🌱', desc: 'ADHD, autism, behaviour concerns, teens and adolescent support.', path: '/therapists/child' },
  { key: 'addiction',    label: 'Addiction',            icon: Skull,       color: '#784212', bg: '#FDEBD0', emoji: '🔑', desc: 'Alcohol, substance use, relapse prevention and recovery.', path: '/therapists/addiction' },
  { key: 'grief',        label: 'Grief & Loss',         icon: Leaf,        color: '#6D6D6D', bg: '#F2F3F4', emoji: '🕊️', desc: 'Bereavement, loss, emotional healing and moving forward.', path: '/therapists/grief' },
  { key: 'medication',   label: 'Psychiatry',           icon: Stethoscope, color: '#154360', bg: '#D6EAF8', emoji: '⚕️', desc: 'Diagnosis, medication management and complex mental health.', path: '/therapists/psychiatry' },
  { key: 'selfesteem',   label: 'Self-Esteem',          icon: Star,        color: '#B7950B', bg: '#FEF9E7', emoji: '✨', desc: 'Confidence, identity, negative self-talk and personal growth.', path: '/therapists/selfesteem' },
  { key: 'ocd',          label: 'OCD',                  icon: Flame,       color: '#A04000', bg: '#FDEBD0', emoji: '🔄', desc: 'Obsessive thoughts, compulsive behaviours and intrusive patterns.', path: '/therapists/ocd' },
  { key: 'eating',       label: 'Eating Disorders',     icon: CircleHelp,  color: '#76448A', bg: '#F5EEF8', emoji: '🌸', desc: 'Anorexia, bulimia, binge eating and body image concerns.', path: '/therapists/eating' },
  { key: 'sleep',        label: 'Sleep & Fatigue',      icon: Brain,       color: '#1A6E8C', bg: '#D1F2EB', emoji: '🌙', desc: 'Insomnia, sleep disorders, chronic fatigue and rest recovery.', path: '/therapists/sleep' },
];

const FEATURED_KEYS = ['anxiety', 'depression', 'relationship', 'trauma', 'child'];
const FEATURED = ALL_CATEGORIES.filter(c => FEATURED_KEYS.includes(c.key));

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

const QUIZ = [
  {
    q: "What best describes what you're going through right now?",
    key: 'feeling',
    opts: [
      { v: 'anxiety',      label: 'Constant worry or fear' },
      { v: 'depression',   label: 'Sadness or emptiness' },
      { v: 'trauma',       label: 'Distressing past events' },
      { v: 'anger',        label: 'Anger or mood swings' },
      { v: 'lost',         label: 'Feeling lost or numb' },
      { v: 'relationship', label: 'Relationship difficulties' },
    ],
  },
  {
    q: 'How long have you been feeling this way?',
    key: 'duration',
    opts: [
      { v: 'recent', label: 'Just recently (weeks)' },
      { v: 'months', label: 'A few months' },
      { v: 'year',   label: 'About a year' },
      { v: 'long',   label: 'Many years' },
    ],
  },
  {
    q: 'Who is this support for?',
    key: 'who',
    opts: [
      { v: 'myself', label: 'Myself (adult)' },
      { v: 'child',  label: 'My child' },
      { v: 'teen',   label: 'A teenager' },
      { v: 'couple', label: 'Me & my partner' },
      { v: 'family', label: 'The whole family' },
    ],
  },
  {
    q: 'What kind of support feels most helpful?',
    key: 'support',
    opts: [
      { v: 'talk',       label: 'Someone to talk to' },
      { v: 'tools',      label: 'Practical tools & skills' },
      { v: 'trauma',     label: 'Process old wounds' },
      { v: 'medication', label: 'Medication evaluation' },
      { v: 'crisis',     label: "I'm in crisis right now" },
    ],
  },
];

function resolveCategory(ans: Record<string, string>) {
  if (ans.support === 'medication' || ans.support === 'crisis') return ALL_CATEGORIES.find(c => c.key === 'medication')!;
  if (ans.who === 'child' || ans.who === 'teen') return ALL_CATEGORIES.find(c => c.key === 'child')!;
  if (ans.who === 'couple' || ans.who === 'family') return ALL_CATEGORIES.find(c => c.key === 'relationship')!;
  if (ans.feeling === 'trauma' || ans.support === 'trauma') return ALL_CATEGORIES.find(c => c.key === 'trauma')!;
  if (ans.feeling === 'relationship') return ALL_CATEGORIES.find(c => c.key === 'relationship')!;
  if (ans.feeling === 'depression' || ans.feeling === 'lost') return ALL_CATEGORIES.find(c => c.key === 'depression')!;
  if (ans.feeling === 'anger') return ALL_CATEGORIES.find(c => c.key === 'ocd')!;
  return ALL_CATEGORIES.find(c => c.key === 'anxiety')!;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function FindTherapist() {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userDrop, setUserDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<typeof ALL_CATEGORIES>([]);
  const [showSearch, setShowSearch] = useState(false);

  const [selectedDrop, setSelectedDrop] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const dropCatRef = useRef<HTMLDivElement>(null);

  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAns, setQuizAns] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<typeof ALL_CATEGORIES[0] | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('firstname');
    if (token && stored) setFirstname(stored);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setUserDrop(false);
      if (dropCatRef.current && !dropCatRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); setShowSearch(false); return; }
    const q = search.toLowerCase();
    const res = ALL_CATEGORIES.filter(c =>
      c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.key.includes(q)
    );
    setSearchResults(res);
    setShowSearch(true);
  }, [search]);

  const handleSignOut = () => {
    ['token', 'firstname', 'email', 'role'].forEach(k => localStorage.removeItem(k));
    setFirstname(null);
    navigate('/');
  };

  const goCategory = (cat: typeof ALL_CATEGORIES[0]) => navigate(cat.path);

  const handleQuizAnswer = (key: string, val: string) => {
    const newAns = { ...quizAns, [key]: val };
    setQuizAns(newAns);
    if (quizStep < QUIZ.length - 1) {
      setTimeout(() => setQuizStep(s => s + 1), 260);
    } else {
      const result = resolveCategory(newAns);
      setQuizResult(result);
    }
  };

  const resetQuiz = () => { setQuizStep(0); setQuizAns({}); setQuizResult(null); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root {
          width: 100%; min-height: 100vh; overflow-x: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #EBF7F4; color: #2C3E3B;
        }

        /* ══ HEADER (exact Landing page) ══ */
        .cb-header {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 0 8vw; height: 80px;
          background: transparent;
          position: fixed; top: 0; left: 0; z-index: 200; transition: all .3s ease;
          line-height: 1; color: #15423C;
        }
        
        .cb-header.scrolled {
          height: 70px;
          background: #C8EAE3;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 30px rgba(21,66,60,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.4);}
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
        .cb-user-menu { position: relative; }
        .cb-user-btn { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.6); border-radius: 50px; padding: 6px 16px 6px 6px; cursor: pointer; transition: all .2s; }
        .cb-user-btn:hover { background: rgba(255,255,255,0.8); }
        .cb-avatar { width: 32px; height: 32px; border-radius: 50%; background: #1D5F55; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .cb-user-name { font-size: 14px; font-weight: 600; color: #15423C; }
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

        /* ══ PAGE ══ */
        .ft-page { padding-top: 80px; min-height: 100vh; }

        /* ══ HERO ══ */
        .ft-hero {
          position: relative; overflow: hidden;
          padding: 80px 8vw 70px;
          background: radial-gradient(circle at 80% 20%, #D0EEE8 0%, #C8EAE3 35%, #D8F2ED 70%, #D2EEE9 100%);
          text-align: center;
        }
        /* Decorative circles matching Landing */
        .ft-hero::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          border: 1px solid rgba(29,95,85,0.07);
          right: -80px; top: -100px; pointer-events: none;
        }
        .ft-hero::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px; border-radius: 50%;
          border: 1px solid rgba(29,95,85,0.05);
          right: 60px; top: 20px; pointer-events: none;
        }
        .ft-hero-inner { position: relative; z-index: 2; }

        .cb-section-label {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.8);
          border-radius: 100px; padding: 6px 14px; font-size: 11px; font-weight: 600;
          color: #1D5F55; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 18px;
          box-shadow: 0 4px 15px rgba(21,66,60,0.02);
        }
        .cb-section-label svg { color: #34A092; }

        .ft-hero-title {
          font-size: clamp(40px, 4.8vw, 68px);
          font-weight: 700; color: #15423C; line-height: 1.15;
          letter-spacing: -0.02em; margin-bottom: 18px;
        }
        .ft-hero-title em { font-style: italic; color: #1D5F55; }
        .ft-hero-sub {
          font-size: 15.5px; color: #536C68; max-width: 540px;
          margin: 0 auto 44px; line-height: 1.7;
        }

        /* ══ SEARCH BAR ══ */
        .ft-search-wrap { position: relative; max-width: 620px; margin: 0 auto; }
        .ft-search-box {
          width: 100%; display: flex; align-items: center; gap: 0;
          background: rgba(255,255,255,0.55); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8); border-radius: 16px;
          padding: 6px 6px 6px 20px;
          box-shadow: 0 15px 40px rgba(21,66,60,0.05);
          transition: all .2s;
        }
        .ft-search-box:focus-within {
          background: rgba(255,255,255,0.75);
          border-color: rgba(29,95,85,0.25);
          box-shadow: 0 15px 40px rgba(21,66,60,0.08);
        }
        .ft-search-box input {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px;
          color: #15423C; padding: 10px 0;
        }
        .ft-search-box input::placeholder { color: #7A9E97; }
        .ft-search-btn {
          background: #1D5F55; color: #fff; border: none;
          border-radius: 10px; padding: 11px 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 7px; transition: all .2s; flex-shrink: 0;
        }
        .ft-search-btn:hover { background: #15423C; }
        .ft-search-clear { background: none; border: none; cursor: pointer; color: #7A9E97; padding: 0 10px; display: flex; }
        .ft-search-dropdown {
          position: absolute; top: calc(100% + 10px); left: 0; right: 0;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
          border-radius: 18px; box-shadow: 0 20px 60px rgba(21,66,60,0.1);
          overflow: hidden; z-index: 200;
          border: 1px solid rgba(255,255,255,0.8);
          animation: dropIn .18s ease;
        }
        .ft-search-item {
          display: flex; align-items: center; gap: 14px; padding: 14px 20px;
          cursor: pointer; transition: background .15s;
          border-bottom: 1px solid rgba(21,66,60,0.04);
        }
        .ft-search-item:last-child { border-bottom: none; }
        .ft-search-item:hover { background: rgba(29,95,85,0.04); }
        .ft-search-item-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ft-search-item-info h4 { font-size: 14px; font-weight: 700; color: #15423C; margin-bottom: 2px; }
        .ft-search-item-info p { font-size: 12px; color: #7A9E97; }
        .ft-search-empty { padding: 24px; text-align: center; color: #7A9E97; font-size: 14px; }

        /* ══ BODY ══ */
        .ft-body { padding: 64px 8vw 80px; }

        /* ══ SECTION DIVIDER LABEL (matching Landing style) ══ */
        .ft-section-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 22px;
        }
        .ft-section-row-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
          color: #1D5F55; white-space: nowrap;
        }
        .ft-section-row::after { content: ''; flex: 1; height: 1px; background: rgba(29,95,85,0.1); }

        /* ══ CRISIS BAR ══ */
        .ft-crisis {
          background: rgba(255,255,255,0.5); backdrop-filter: blur(10px);
          border: 1px solid rgba(229,57,53,0.15); border-radius: 20px;
          padding: 22px 32px; margin-bottom: 52px;
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
          box-shadow: 0 10px 30px rgba(21,66,60,0.02);
        }
        .ft-crisis-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(229,57,53,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ft-crisis-text h4 { font-size: 15px; font-weight: 700; color: #D32F2F; margin-bottom: 3px; }
        .ft-crisis-text p { font-size: 13px; color: #536C68; line-height: 1.6; }
        .ft-crisis-number { margin-left: auto; font-size: 38px; font-weight: 800; color: #D32F2F; letter-spacing: -0.02em; flex-shrink: 0; }

        /* ══ FEATURED CARDS ══ */
        .ft-featured-grid {
          display: grid; grid-template-columns: repeat(5,1fr); gap: 16px; margin-bottom: 52px;
        }
        .ft-cat-card {
          border-radius: 22px; padding: 24px 20px; cursor: pointer;
          transition: all .22s ease; position: relative; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.8);
          backdrop-filter: blur(10px);
        }
        .ft-cat-card::before {
          content: ''; position: absolute; inset: 0; opacity: 0;
          background: linear-gradient(160deg, rgba(255,255,255,0.4), transparent);
          transition: opacity .2s;
        }
        .ft-cat-card:hover { transform: translateY(-6px); box-shadow: 0 22px 50px rgba(21,66,60,0.08); }
        .ft-cat-card:hover::before { opacity: 1; }
        .ft-cat-emoji { font-size: 34px; margin-bottom: 14px; display: block; }
        .ft-cat-label { font-size: 15px; font-weight: 700; color: #15423C; margin-bottom: 6px; line-height: 1.2; }
        .ft-cat-desc { font-size: 12px; color: #536C68; line-height: 1.6; }
        .ft-cat-arrow { position: absolute; bottom: 16px; right: 16px; opacity: 0; transform: translateX(-4px); transition: all .2s; }
        .ft-cat-card:hover .ft-cat-arrow { opacity: 1; transform: translateX(0); }

        /* ══ SELECT ROW ══ */
        .ft-select-row {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.4); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7); border-radius: 20px;
          padding: 20px 28px; margin-bottom: 52px;
          box-shadow: 0 15px 40px rgba(21,66,60,0.03);
          flex-wrap: wrap;
        }
        .ft-select-label { font-size: 14px; font-weight: 600; color: #15423C; white-space: nowrap; flex-shrink: 0; }
        .ft-select-wrap { position: relative; flex: 1; min-width: 240px; }
        .ft-select-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 12px 18px; border-radius: 12px;
          background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.9);
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
          color: #15423C; cursor: pointer; font-weight: 500; transition: all .2s;
        }
        .ft-select-btn:hover { background: #fff; border-color: rgba(29,95,85,0.3); }
        .ft-select-dd {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(16px);
          border-radius: 16px; box-shadow: 0 16px 50px rgba(21,66,60,.08);
          z-index: 100; max-height: 280px; overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.8); animation: dropIn .18s ease;
        }
        .ft-select-opt {
          display: flex; align-items: center; gap: 12px; padding: 12px 18px;
          cursor: pointer; font-size: 14px; color: #2C3E3B; transition: background .15s;
          border-bottom: 1px solid rgba(21,66,60,0.04);
        }
        .ft-select-opt:last-child { border-bottom: none; }
        .ft-select-opt:hover { background: rgba(29,95,85,0.04); }
        .ft-go-btn {
          background: #1D5F55; color: #fff; border: none; border-radius: 12px;
          padding: 13px 28px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer; display: flex;
          align-items: center; gap: 8px; transition: all .2s; flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(21,66,60,.15);
        }
        .ft-go-btn:hover:not(:disabled) { background: #15423C; transform: translateY(-1px); }
        .ft-go-btn:disabled { opacity: .4; cursor: not-allowed; transform: none; }

        /* ══ QUIZ BANNER ══ */
        .ft-quiz-banner {
          background: radial-gradient(circle at 50% 50%, #1D5F55 0%, #15423C 100%);
          border-radius: 28px; padding: 48px 52px; margin-bottom: 52px;
          position: relative; overflow: hidden;
        }
        .ft-quiz-banner::before {
          content: ''; position: absolute; right: -60px; top: -60px;
          width: 320px; height: 320px; border-radius: 50%;
          background: rgba(255,255,255,0.04); pointer-events: none;
        }
        .ft-quiz-banner::after {
          content: ''; position: absolute; left: 40%; bottom: -80px;
          width: 240px; height: 240px; border-radius: 50%;
          background: rgba(174,228,219,0.06); pointer-events: none;
        }
        .ft-quiz-inner { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
        .ft-quiz-text h3 { font-size: clamp(24px,2.5vw,34px); font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.2; }
        .ft-quiz-text p { font-size: 14px; color: rgba(255,255,255,0.6); max-width: 420px; line-height: 1.75; }
        .ft-quiz-steps { display: flex; gap: 20px; margin-top: 16px; flex-wrap: wrap; }
        .ft-quiz-step-chip { display: flex; align-items: center; gap: 7px; font-size: 12px; color: rgba(255,255,255,0.5); }
        .ft-quiz-step-num { width: 20px; height: 20px; border-radius: 50%; background: rgba(174,228,219,0.15); display: flex; align-items: center; justify-content: center; font-size: 10px; color: #AEE4DB; font-weight: 700; }
        .ft-quiz-open-btn {
          background: rgba(255,255,255,0.12); color: #fff;
          border: 1px solid rgba(255,255,255,0.2); border-radius: 14px;
          padding: 15px 30px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 9px; transition: all .22s; flex-shrink: 0;
        }
        .ft-quiz-open-btn:hover { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.35); transform: translateY(-2px); }

        /* ══ QUIZ MODAL ══ */
        .ft-modal-overlay {
          position: fixed; inset: 0; background: rgba(21,66,60,0.4);
          backdrop-filter: blur(6px); z-index: 500;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: fadeIn .2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .ft-modal {
          background: rgba(255,255,255,0.96); backdrop-filter: blur(20px);
          border-radius: 28px; width: 100%; max-width: 560px;
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 30px 80px rgba(21,66,60,0.15);
          animation: slideUp .25s ease; max-height: 90vh; overflow-y: auto;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .ft-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 28px 32px 0; }
        .ft-modal-head-left { display: flex; align-items: center; gap: 12px; }
        .ft-modal-icon { width: 44px; height: 44px; border-radius: 14px; background: rgba(29,95,85,0.08); display: flex; align-items: center; justify-content: center; }
        .ft-modal-close { width: 36px; height: 36px; border-radius: 50%; background: rgba(21,66,60,0.06); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s; }
        .ft-modal-close:hover { background: rgba(21,66,60,0.1); }
        .ft-modal-body { padding: 28px 32px 32px; }
        .ft-progress-bar { height: 4px; background: rgba(21,66,60,0.08); border-radius: 2px; margin-bottom: 28px; overflow: hidden; }
        .ft-progress-fill { height: 100%; background: linear-gradient(90deg, #1D5F55, #34A092); border-radius: 2px; transition: width .4s ease; }
        .ft-quiz-step-tag { font-size: 11px; font-weight: 700; color: #1D5F55; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px; }
        .ft-quiz-question { font-size: 24px; font-weight: 700; color: #15423C; line-height: 1.3; margin-bottom: 24px; }
        .ft-quiz-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ft-quiz-opt {
          padding: 14px 18px; border-radius: 12px;
          border: 1px solid rgba(21,66,60,0.1); background: rgba(255,255,255,0.6);
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
          font-weight: 500; color: #2C3E3B; cursor: pointer; text-align: left;
          transition: all .18s;
        }
        .ft-quiz-opt:hover { border-color: #1D5F55; background: rgba(29,95,85,0.05); color: #15423C; }
        .ft-quiz-opt.selected { border-color: #1D5F55; background: #1D5F55; color: #fff; }
        .ft-quiz-result { text-align: center; padding: 8px 0 4px; }
        .ft-quiz-result-icon { font-size: 52px; margin-bottom: 16px; }
        .ft-quiz-result h3 { font-size: 26px; font-weight: 700; color: #15423C; margin-bottom: 8px; }
        .ft-quiz-result p { font-size: 14px; color: #536C68; line-height: 1.7; margin-bottom: 28px; max-width: 380px; margin-left: auto; margin-right: auto; }
        .ft-quiz-result-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .ft-quiz-goto-btn {
          background: #1D5F55; color: #fff; border: none; border-radius: 12px;
          padding: 14px 28px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer; display: flex;
          align-items: center; gap: 8px; transition: all .2s;
          box-shadow: 0 6px 20px rgba(21,66,60,.2);
        }
        .ft-quiz-goto-btn:hover { background: #15423C; transform: translateY(-1px); }
        .ft-quiz-retry-btn {
          background: rgba(21,66,60,0.06); color: #536C68; border: none; border-radius: 12px;
          padding: 14px 22px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
        }
        .ft-quiz-retry-btn:hover { background: rgba(21,66,60,0.1); }

        /* ══ ALL CATEGORIES GRID ══ */
        .ft-all-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
        .ft-all-card {
          background: rgba(255,255,255,0.4); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7); border-radius: 18px;
          padding: 20px; cursor: pointer; transition: all .2s;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 4px 15px rgba(21,66,60,0.02);
        }
        .ft-all-card:hover { transform: translateY(-4px); box-shadow: 0 15px 40px rgba(21,66,60,0.06); border-color: rgba(29,95,85,0.2); background: rgba(255,255,255,0.6); }
        .ft-all-card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ft-all-card-label { font-size: 14px; font-weight: 700; color: #15423C; margin-bottom: 2px; }
        .ft-all-card-sub { font-size: 12px; color: #7A9E97; }

        /* ══ FOOTER (exact Landing page) ══ */
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
        .cb-footer-connect { display: flex; gap: 12px; margin-top: 20px; }
        .cb-footer-icon { width: 38px; height: 38px; border-radius: 11px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
        .cb-footer-icon:hover { background: rgba(52,160,146,0.15); border-color: rgba(52,160,146,0.3); transform: translateY(-1px); }
        .cb-footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #4E6E68; }
        .cb-footer-links { display: flex; gap: 20px; }
        .cb-footer-links a { color: #4E6E68; text-decoration: none; transition: color .2s; }
        .cb-footer-links a:hover { color: #7A9E97; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1100px) {
          .ft-featured-grid { grid-template-columns: repeat(3,1fr); }
          .ft-all-grid { grid-template-columns: repeat(3,1fr); }
          .cb-footer-top { grid-template-columns: 1.5fr 1fr; gap: 40px; }
        }
        @media (max-width: 900px) {
          .ft-featured-grid { grid-template-columns: repeat(2,1fr); }
          .ft-all-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 768px) {
          .cb-nav { display: none; }
          .ft-quiz-banner { padding: 32px 24px; }
          .ft-quiz-inner { flex-direction: column; }
          .ft-modal-body { padding: 20px 22px 24px; }
          .ft-quiz-opts { grid-template-columns: 1fr; }
          .ft-body { padding: 40px 5vw 60px; }
          .ft-select-row { flex-direction: column; }
          .cb-footer-top { grid-template-columns: 1fr; gap: 36px; }
          .cb-footer-bottom { flex-direction: column; text-align: center; }
        }
        @media (max-width: 520px) {
          .ft-featured-grid { grid-template-columns: 1fr 1fr; }
          .ft-all-grid { grid-template-columns: 1fr 1fr; }
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
          <Link to="/contact">Contact Us</Link>
        </nav>

        <div className="cb-header-right">
          {firstname ? (
            <div className="cb-user-menu" ref={dropRef}>
              <div className="cb-user-btn" onClick={() => setUserDrop(o => !o)}>
                <div className="cb-avatar">{firstname.charAt(0).toUpperCase()}</div>
                <span className="cb-user-name">{firstname}</span>
                <ChevronDown size={14} className={`cb-chevron${userDrop ? ' open' : ''}`} />
              </div>
              {userDrop && (
                <div className="cb-dropdown">
                  <div className="cb-dropdown-header">
                    <div className="cb-dropdown-greeting">Signed in as</div>
                    <div className="cb-dropdown-name">{firstname}</div>
                  </div>
                  <button className="cb-dropdown-item dashboard" onClick={() => { setUserDrop(false); navigate('/dashboard'); }}>
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
        </div>
      </header>

      <div className="ft-page">

        {/* ══ HERO ══ */}
        <section className="ft-hero">
          <div className="ft-hero-inner">
            <div className="cb-section-label">
              <Sparkles size={12} fill="currentColor" opacity={0.2} /> Find Your Therapist
            </div>
            <h1 className="ft-hero-title">
              Find the right care<br /><em>for your mind</em>
            </h1>
            <p className="ft-hero-sub">
              Search by concern or specialty — or let us guide you to the perfect match in 4 quick questions.
            </p>

            {/* Search */}
            <div className="ft-search-wrap">
              <div className="ft-search-box">
                <Search size={18} color="#7A9E97" style={{ flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, condition, or therapy type…"
                />
                {search && (
                  <button className="ft-search-clear" onClick={() => { setSearch(''); setShowSearch(false); }}>
                    <X size={16} />
                  </button>
                )}
                <button className="ft-search-btn">
                  <Search size={15} /> Search
                </button>
              </div>

              {showSearch && (
                <div className="ft-search-dropdown">
                  {searchResults.length === 0 ? (
                    <div className="ft-search-empty">No categories found for "{search}"</div>
                  ) : searchResults.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.key} className="ft-search-item" onClick={() => goCategory(cat)}>
                        <div className="ft-search-item-icon" style={{ background: cat.bg }}>
                          <Icon size={18} color={cat.color} />
                        </div>
                        <div className="ft-search-item-info">
                          <h4>{cat.label}</h4>
                          <p>{cat.desc.slice(0, 56)}…</p>
                        </div>
                        <ChevronRight size={15} color="#C0CFC8" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══ BODY ══ */}
        <section className="ft-body">

          

          {/* Featured */}
          <div className="ft-section-row">
            <span className="ft-section-row-label">Most sought after</span>
          </div>
          <div className="ft-featured-grid">
            {FEATURED.map(cat => (
              <div key={cat.key} className="ft-cat-card" style={{ background: cat.bg }} onClick={() => goCategory(cat)}>
                <span className="ft-cat-emoji">{cat.emoji}</span>
                <div className="ft-cat-label">{cat.label}</div>
                <div className="ft-cat-desc">{cat.desc}</div>
                <div className="ft-cat-arrow"><ArrowRight size={16} color={cat.color} /></div>
              </div>
            ))}
          </div>

          {/* Dropdown selector */}
          <div className="ft-section-row">
            <span className="ft-section-row-label">Know what you're looking for?</span>
          </div>
          <div className="ft-select-row">
            <span className="ft-select-label">Browse by category</span>
            <div className="ft-select-wrap" ref={dropCatRef}>
              <button className="ft-select-btn" onClick={() => setDropOpen(o => !o)}>
                <span style={{ color: selectedDrop ? '#15423C' : '#7A9E97' }}>
                  {selectedDrop
                    ? ALL_CATEGORIES.find(c => c.key === selectedDrop)?.label
                    : 'Select a therapy category…'}
                </span>
                <ChevronDown size={16} color="#7A9E97" />
              </button>
              {dropOpen && (
                <div className="ft-select-dd">
                  {ALL_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.key} className="ft-select-opt" onClick={() => { setSelectedDrop(cat.key); setDropOpen(false); }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={14} color={cat.color} />
                        </div>
                        <span>{cat.label}</span>
                        {selectedDrop === cat.key && <CheckCircle2 size={15} color="#1D5F55" style={{ marginLeft: 'auto' }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              className="ft-go-btn"
              disabled={!selectedDrop}
              onClick={() => { const cat = ALL_CATEGORIES.find(c => c.key === selectedDrop); if (cat) goCategory(cat); }}
            >
              View Therapists <ArrowRight size={15} />
            </button>
          </div>

          {/* Quiz banner */}
          <div className="ft-quiz-banner">
            <div className="ft-quiz-inner">
              <div className="ft-quiz-text">
                <h3>Not sure which therapist you need?</h3>
                <p>Answer 4 simple questions and we'll pinpoint the most suitable specialist for exactly what you're going through.</p>
                <div className="ft-quiz-steps">
                  {['Your concern', 'Duration', "Who it's for", 'Type of help'].map((s, i) => (
                    <div key={i} className="ft-quiz-step-chip">
                      <div className="ft-quiz-step-num">{i + 1}</div>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <button className="ft-quiz-open-btn" onClick={() => { resetQuiz(); setQuizOpen(true); }}>
                <Sparkles size={16} /> Find My Match
              </button>
            </div>
          </div>

          {/* All categories */}
          <div className="ft-section-row">
            <span className="ft-section-row-label">All therapy categories</span>
          </div>
          <div className="ft-all-grid">
            {ALL_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.key} className="ft-all-card" onClick={() => goCategory(cat)}>
                  <div className="ft-all-card-icon" style={{ background: cat.bg }}>
                    <Icon size={20} color={cat.color} />
                  </div>
                  <div>
                    <div className="ft-all-card-label">{cat.label}</div>
                    <div className="ft-all-card-sub">{cat.key.charAt(0).toUpperCase() + cat.key.slice(1)} therapy</div>
                  </div>
                  <ChevronRight size={15} color="#C0CFC8" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>

        </section>

        {/* ══ FOOTER (exact Landing page) ══ */}
        <footer className="cb-footer">
          <div className="cb-footer-top">
            <div>
              <div className="cb-footer-brand-name">
                <HeartHandshake size={20} color="#34A092" />
                <span>CareBridge</span>
              </div>
              <p className="cb-footer-brand-p">Building a future where digital serenity is accessible to everyone. Your mental well-being is our priority.</p>
              <div className="cb-footer-connect">
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

      {/* ══ QUIZ MODAL ══ */}
      {quizOpen && (
        <div className="ft-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setQuizOpen(false); }}>
          <div className="ft-modal">
            <div className="ft-modal-head">
              <div className="ft-modal-head-left">
                <div className="ft-modal-icon"><Sparkles size={20} color="#1D5F55" /></div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#15423C' }}>Therapist Finder</div>
                  <div style={{ fontSize: 12, color: '#7A9E97' }}>
                    {quizResult ? 'Your match is ready' : `Question ${quizStep + 1} of ${QUIZ.length}`}
                  </div>
                </div>
              </div>
              <button className="ft-modal-close" onClick={() => setQuizOpen(false)}><X size={16} color="#536C68" /></button>
            </div>

            <div className="ft-modal-body">
              {!quizResult ? (
                <>
                  <div className="ft-progress-bar">
                    <div className="ft-progress-fill" style={{ width: `${((quizStep + 1) / QUIZ.length) * 100}%` }} />
                  </div>
                  <div className="ft-quiz-step-tag">Step {quizStep + 1} of {QUIZ.length}</div>
                  <div className="ft-quiz-question">{QUIZ[quizStep].q}</div>
                  <div className="ft-quiz-opts">
                    {QUIZ[quizStep].opts.map(opt => (
                      <button
                        key={opt.v}
                        className={`ft-quiz-opt${quizAns[QUIZ[quizStep].key] === opt.v ? ' selected' : ''}`}
                        onClick={() => handleQuizAnswer(QUIZ[quizStep].key, opt.v)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {quizStep > 0 && (
                    <button
                      onClick={() => setQuizStep(s => s - 1)}
                      style={{ marginTop: 16, background: 'none', border: 'none', color: '#7A9E97', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      ← Back
                    </button>
                  )}
                </>
              ) : (
                <div className="ft-quiz-result">
                  <div className="ft-quiz-result-icon">{quizResult.emoji}</div>
                  <h3>We recommend</h3>
                  <div style={{ display: 'inline-block', background: quizResult.bg, color: quizResult.color, borderRadius: 100, padding: '6px 18px', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                    {quizResult.label}
                  </div>
                  <p>{quizResult.desc}</p>
                  <div className="ft-quiz-result-actions">
                    <button className="ft-quiz-goto-btn" onClick={() => { setQuizOpen(false); goCategory(quizResult); }}>
                      View Therapists <ArrowRight size={15} />
                    </button>
                    <button className="ft-quiz-retry-btn" onClick={resetQuiz}>Retake Quiz</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}