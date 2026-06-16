import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  HeartHandshake, ChevronDown, LayoutDashboard, LogOut,
  Brain, Heart, Users, Baby, ShieldCheck, Skull,
  CircleHelp, Star, X, Wind, Leaf,
  Flame, Stethoscope, Search, SlidersHorizontal,
  MapPin, Clock, CheckCircle2, ChevronRight, Filter,
  Award, Video, MessageSquare as Chat, Phone,
  Share2, Mail, Globe, AlertCircle, CalendarCheck
} from 'lucide-react';

const ALL_CATEGORIES = [
  { key: 'anxiety',      label: 'Anxiety & Stress',   icon: Wind,        color: '#2A7D6F', bg: '#D6F0EC', emoji: '🌬️', desc: 'Panic attacks, overthinking, chronic stress and worry management.' },
  { key: 'depression',   label: 'Depression',         icon: Heart,       color: '#C0392B', bg: '#FDECEA', emoji: '💛', desc: 'Low mood, sadness, hopelessness, loss of motivation or interest.' },
  { key: 'relationship', label: 'Relationships',      icon: Users,       color: '#8E44AD', bg: '#F3E8FB', emoji: '💞', desc: 'Couples therapy, family conflict, communication and separation.' },
  { key: 'trauma',       label: 'Trauma & PTSD',      icon: ShieldCheck, color: '#1A5276', bg: '#D6EAF8', emoji: '🛡️', desc: 'Abuse recovery, flashbacks, PTSD and complex trauma processing.' },
  { key: 'child',        label: 'Child & Teen',       icon: Baby,        color: '#1E8449', bg: '#D5F5E3', emoji: '🌱', desc: 'ADHD, autism, behaviour concerns, teens and adolescent support.' },
  { key: 'addiction',    label: 'Addiction',          icon: Skull,       color: '#784212', bg: '#FDEBD0', emoji: '🔑', desc: 'Alcohol, substance use, relapse prevention and recovery.' },
  { key: 'grief',        label: 'Grief & Loss',       icon: Leaf,        color: '#6D6D6D', bg: '#F2F3F4', emoji: '🕊️', desc: 'Bereavement, loss, emotional healing and moving forward.' },
  { key: 'psychiatry',   label: 'Psychiatry',         icon: Stethoscope, color: '#154360', bg: '#D6EAF8', emoji: '⚕️', desc: 'Diagnosis, medication management and complex mental health.' },
  { key: 'selfesteem',   label: 'Self-Esteem',        icon: Star,        color: '#B7950B', bg: '#FEF9E7', emoji: '✨', desc: 'Confidence, identity, negative self-talk and personal growth.' },
  { key: 'ocd',          label: 'OCD',                icon: Flame,       color: '#A04000', bg: '#FDEBD0', emoji: '🔄', desc: 'Obsessive thoughts, compulsive behaviours and intrusive patterns.' },
  { key: 'eating',       label: 'Eating Disorders',   icon: CircleHelp,  color: '#76448A', bg: '#F5EEF8', emoji: '🌸', desc: 'Anorexia, bulimia, binge eating and body image concerns.' },
  { key: 'sleep',        label: 'Sleep & Fatigue',    icon: Brain,       color: '#1A6E8C', bg: '#D1F2EB', emoji: '🌙', desc: 'Insomnia, sleep disorders, chronic fatigue and rest recovery.' },
];

const SORT_OPTIONS = ['Recommended', 'Highest Rated', 'Price: Low to High', 'Price: High to Low'];

interface WorkDaySchedule { dayOfWeek: string; startTime: string; endTime: string; }
interface Therapist {
  id: number; firstName: string; lastName: string; email: string; phone: string;
  title: string; specialization: string; bio: string; location: string; languages: string;
  rating: number; imageUrl: string; consultationType: string; contactMethod: string;
  isVerified: boolean; pricePerSession: number; yearsOfExperience: number;
  specialties: string[]; education: string[]; workSchedule: WorkDaySchedule[];
}

function getFullName(t: Therapist) { return `${t.firstName || ''} ${t.lastName || ''}`.trim(); }
function getModes(t: Therapist): string[] {
  if (!t.contactMethod) return [];
  if (t.contactMethod === 'BOTH') return ['video', 'chat'];
  if (t.contactMethod === 'VIDEO') return ['video'];
  if (t.contactMethod === 'CHAT') return ['chat'];
  return [];
}
function isAvailableToday(ws: WorkDaySchedule[]): boolean {
  if (!ws || ws.length === 0) return false;
  const DAYS = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  return ws.some(w => w.dayOfWeek?.toUpperCase() === DAYS[new Date().getDay()]);
}
function getNextAvailable(ws: WorkDaySchedule[]): string {
  if (!ws || ws.length === 0) return 'By appointment';
  const DAYS = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const todayIdx = new Date().getDay();
  const todayEntry = ws.find(w => w.dayOfWeek?.toUpperCase() === DAYS[todayIdx]);
  if (todayEntry) return `Today ${todayEntry.startTime}`;
  for (let offset = 1; offset <= 7; offset++) {
    const next = DAYS[(todayIdx + offset) % 7];
    const entry = ws.find(w => w.dayOfWeek?.toUpperCase() === next);
    if (entry) return `${offset === 1 ? 'Tomorrow' : next.charAt(0) + next.slice(1).toLowerCase()} ${entry.startTime}`;
  }
  return ws[0]?.dayOfWeek || 'Soon';
}

export default function TherapistListing() {
  const { category = 'anxiety' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const cat = ALL_CATEGORIES.find(c => c.key === category) || ALL_CATEGORIES[0];
  const CatIcon = cat.icon;

  const [firstname, setFirstname] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userDrop, setUserDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const [allTherapists, setAllTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Recommended');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterMode, setFilterMode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true); setError(null); setAllTherapists([]);
    fetch(`${import.meta.env.VITE_API_BASE}/api/therapists?specialty=${encodeURIComponent(cat.label)}`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => { if (!res.ok) throw new Error(`${res.status}`); return res.json() as Promise<Therapist[]>; })
      .then(data => { setAllTherapists(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error('TherapistListing fetch error:', err); setError('Could not load therapists right now. Please try again later.'); setLoading(false); });
  }, [category]);

  useEffect(() => { const t = localStorage.getItem('token'), s = localStorage.getItem('firstname'); if (t && s) setFirstname(s); }, []);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 10); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setUserDrop(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSignOut = () => { ['token','firstname','email','role'].forEach(k => localStorage.removeItem(k)); setFirstname(null); navigate('/'); };

  let therapists = [...allTherapists];
  if (filterAvailable) therapists = therapists.filter(t => isAvailableToday(t.workSchedule));
  if (filterMode) therapists = therapists.filter(t => getModes(t).includes(filterMode));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    therapists = therapists.filter(t =>
      getFullName(t).toLowerCase().includes(q) || (t.bio||'').toLowerCase().includes(q) ||
      (t.specialization||'').toLowerCase().includes(q) || (t.specialties||[]).some(s => s.toLowerCase().includes(q))
    );
  }
  if (sortBy === 'Highest Rated') therapists.sort((a,b) => b.rating - a.rating);
  else if (sortBy === 'Price: Low to High') therapists.sort((a,b) => a.pricePerSession - b.pricePerSession);
  else if (sortBy === 'Price: High to Low') therapists.sort((a,b) => b.pricePerSession - a.pricePerSession);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; overflow-x: hidden; font-family: 'Plus Jakarta Sans', sans-serif; background: #EBF7F4; color: #2C3E3B; }

        /* ── HEADER ── */
        .cb-header { width:100%; display:flex; align-items:center; justify-content:space-between; padding:0 8vw; height:80px; background:transparent; position:fixed; top:0; left:0; z-index:200; transition:all .3s ease; }
        .cb-header.scrolled { height:68px; background:rgba(220,245,238,0.9); backdrop-filter:blur(20px); box-shadow:0 2px 20px rgba(21,66,60,0.06); border-bottom:1px solid rgba(255,255,255,0.5); }
        .cb-logo { display:flex; align-items:center; gap:8px; text-decoration:none; }
        .cb-logo-icon { color:#1D5F55; display:flex; }
        .cb-logo-text { color:#15423C; font-size:19px; font-weight:700; letter-spacing:-.02em; }
        .cb-nav { display:flex; gap:32px; margin-left:auto; margin-right:40px; }
        .cb-nav a { font-size:14px; color:#4A6360; font-weight:500; text-decoration:none; transition:color .2s; }
        .cb-nav a:hover { color:#1D5F55; }
        .cb-header-right { display:flex; align-items:center; gap:12px; }
        .cb-btn-primary { background:#1D5F55; color:#fff; border:none; padding:11px 22px; border-radius:12px; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer; transition:all .25s; text-decoration:none; display:inline-flex; align-items:center; gap:6px; }
        .cb-btn-primary:hover { background:#15423C; transform:translateY(-1px); }
        .cb-user-menu { position:relative; }
        .cb-user-btn { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.7); border-radius:50px; padding:5px 14px 5px 5px; cursor:pointer; transition:all .2s; }
        .cb-user-btn:hover { background:rgba(255,255,255,0.85); }
        .cb-avatar { width:30px; height:30px; border-radius:50%; background:#1D5F55; color:#fff; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; }
        .cb-user-name { font-size:13px; font-weight:600; color:#15423C; }
        .cb-chevron { color:#15423C; transition:transform .2s; }
        .cb-chevron.open { transform:rotate(180deg); }
        .cb-dropdown { position:absolute; top:calc(100% + 10px); right:0; background:rgba(255,255,255,0.96); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.6); border-radius:16px; box-shadow:0 10px 30px rgba(21,66,60,.1); min-width:200px; overflow:hidden; z-index:300; animation:dropIn .2s ease; }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        .cb-dropdown-header { padding:14px 18px 10px; border-bottom:1px solid rgba(21,66,60,0.06); }
        .cb-dropdown-greeting { font-size:11px; color:#7A8F8B; }
        .cb-dropdown-name { font-size:14px; font-weight:700; color:#15423C; margin-top:2px; }
        .cb-dropdown-item { display:flex; align-items:center; gap:10px; padding:11px 18px; font-size:13px; color:#4A6360; cursor:pointer; transition:all .15s; border:none; background:none; width:100%; text-align:left; font-family:inherit; }
        .cb-dropdown-item.dashboard { color:#1D5F55; font-weight:500; }
        .cb-dropdown-item.dashboard:hover { background:rgba(29,95,85,0.06); }
        .cb-dropdown-item.signout:hover { background:rgba(229,57,53,0.05); color:#e53935; }

        .tl-page { padding-top:80px; min-height:100vh; }

        /* ── HERO ── */
        .tl-hero { padding:48px 8vw 44px; background:linear-gradient(135deg,#C3E9E1 0%,#CBE9E3 40%,#D5EEE9 100%); position:relative; overflow:hidden; }
        .tl-hero::before { content:''; position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(29,95,85,0.06) 0%,transparent 70%); right:-100px; top:-200px; pointer-events:none; }
        .tl-hero-inner { position:relative; z-index:2; }
        .tl-breadcrumb { display:flex; align-items:center; gap:6px; margin-bottom:24px; }
        .tl-breadcrumb a { font-size:12.5px; color:#536C68; text-decoration:none; font-weight:500; transition:color .15s; }
        .tl-breadcrumb a:hover { color:#1D5F55; }
        .tl-breadcrumb-sep { color:#A8C4BE; font-size:11px; }
        .tl-hero-content { display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
        .tl-hero-left { display:flex; align-items:center; gap:22px; }
        .tl-cat-icon-wrap { width:68px; height:68px; border-radius:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 28px rgba(21,66,60,0.1); flex-shrink:0; position:relative; }
        .tl-cat-icon-wrap::after { content:''; position:absolute; inset:-1px; border-radius:21px; background:linear-gradient(135deg,rgba(255,255,255,0.6),rgba(255,255,255,0.1)); pointer-events:none; }
        .tl-hero-info h1 { font-size:clamp(26px,3vw,38px); font-weight:800; color:#0F3330; letter-spacing:-.03em; margin-bottom:5px; line-height:1.1; }
        .tl-hero-info p { font-size:13.5px; color:#536C68; line-height:1.65; max-width:460px; }
        .tl-hero-stats { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }
        .tl-stat { display:flex; align-items:center; gap:6px; font-size:12.5px; color:#536C68; background:rgba(255,255,255,0.55); padding:5px 12px; border-radius:100px; border:1px solid rgba(255,255,255,0.8); }
        .tl-stat strong { color:#15423C; font-weight:700; }
        .tl-stat-dot { width:5px; height:5px; border-radius:50%; background:#1D5F55; }
        .tl-change-btn { display:flex; align-items:center; gap:7px; background:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.8); border-radius:12px; padding:10px 20px; font-family:inherit; font-size:13px; font-weight:600; color:#15423C; cursor:pointer; transition:all .2s; }
        .tl-change-btn:hover { background:rgba(255,255,255,0.85); transform:translateY(-1px); }

        /* ── LAYOUT ── */
        .tl-main { padding:32px 8vw 80px; display:flex; gap:24px; align-items:flex-start; }

        /* ── SIDEBAR ── */
        .tl-sidebar { width:248px; flex-shrink:0; background:rgba(255,255,255,0.65); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.85); border-radius:22px; padding:22px; position:sticky; top:90px; box-shadow:0 4px 24px rgba(21,66,60,0.04); }
        .tl-sidebar-title { font-size:11px; font-weight:800; color:#15423C; text-transform:uppercase; letter-spacing:.1em; margin-bottom:18px; display:flex; align-items:center; gap:7px; }
        .tl-filter-section { margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid rgba(21,66,60,0.07); }
        .tl-filter-section:last-of-type { margin-bottom:0; padding-bottom:0; border-bottom:none; }
        .tl-filter-label { font-size:10.5px; font-weight:700; color:#7A9E97; text-transform:uppercase; letter-spacing:.09em; margin-bottom:9px; }
        .tl-filter-toggle { display:flex; align-items:center; justify-content:space-between; padding:10px 13px; border-radius:10px; cursor:pointer; border:1.5px solid rgba(21,66,60,0.1); background:rgba(255,255,255,0.5); font-size:13px; color:#2C3E3B; font-weight:500; transition:all .18s; font-family:inherit; width:100%; }
        .tl-filter-toggle:hover { border-color:rgba(29,95,85,0.35); }
        .tl-filter-toggle.active { border-color:#1D5F55; background:rgba(29,95,85,0.07); color:#1D5F55; font-weight:600; }
        .tl-filter-chips { display:flex; flex-direction:column; gap:6px; }
        .tl-chip { padding:9px 13px; border-radius:9px; border:1.5px solid rgba(21,66,60,0.1); background:rgba(255,255,255,0.5); font-family:inherit; font-size:12.5px; color:#2C3E3B; font-weight:500; cursor:pointer; text-align:left; transition:all .18s; display:flex; align-items:center; gap:7px; }
        .tl-chip:hover { border-color:rgba(29,95,85,0.35); }
        .tl-chip.active { border-color:#1D5F55; background:#1D5F55; color:#fff; }
        .tl-clear-btn { width:100%; padding:9px; border-radius:9px; border:none; background:rgba(21,66,60,0.05); color:#536C68; font-family:inherit; font-size:12.5px; cursor:pointer; transition:all .15s; font-weight:500; }
        .tl-clear-btn:hover { background:rgba(21,66,60,0.09); }
        .tl-browse-other { margin-top:20px; }
        .tl-other-label { font-size:10.5px; font-weight:700; color:#7A9E97; text-transform:uppercase; letter-spacing:.09em; margin-bottom:9px; }
        .tl-other-link { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:9px; cursor:pointer; text-decoration:none; font-size:12.5px; color:#536C68; transition:all .15s; margin-bottom:3px; }
        .tl-other-link:hover { background:rgba(29,95,85,0.06); color:#1D5F55; }
        .tl-other-icon { width:24px; height:24px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        /* ── CONTENT ── */
        .tl-content { flex:1; min-width:0; }
        .tl-topbar { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:20px; flex-wrap:wrap; }
        .tl-results-text { font-size:13.5px; color:#536C68; }
        .tl-results-text strong { color:#15423C; font-weight:700; }
        .tl-topbar-right { display:flex; align-items:center; gap:10px; }
        .tl-search-box { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.65); border:1.5px solid rgba(255,255,255,0.9); border-radius:11px; padding:8px 13px; backdrop-filter:blur(10px); transition:all .2s; }
        .tl-search-box:focus-within { border-color:rgba(29,95,85,0.35); background:rgba(255,255,255,0.9); }
        .tl-search-box input { background:none; border:none; outline:none; font-family:inherit; font-size:13px; color:#15423C; width:170px; }
        .tl-search-box input::placeholder { color:#7A9E97; }
        .tl-sort-wrap { position:relative; }
        .tl-sort-btn { display:flex; align-items:center; gap:7px; background:rgba(255,255,255,0.65); border:1.5px solid rgba(255,255,255,0.9); border-radius:11px; padding:8px 14px; font-family:inherit; font-size:12.5px; font-weight:600; color:#15423C; cursor:pointer; white-space:nowrap; transition:all .2s; }
        .tl-sort-btn:hover { background:rgba(255,255,255,0.9); }
        .tl-sort-dd { position:absolute; top:calc(100% + 8px); right:0; background:rgba(255,255,255,0.97); backdrop-filter:blur(16px); border-radius:14px; box-shadow:0 16px 40px rgba(21,66,60,.1); z-index:100; min-width:210px; overflow:hidden; border:1px solid rgba(255,255,255,0.8); animation:dropIn .18s ease; }
        .tl-sort-opt { display:flex; align-items:center; justify-content:space-between; padding:10px 15px; font-size:13px; color:#2C3E3B; cursor:pointer; transition:background .15s; border-bottom:1px solid rgba(21,66,60,0.04); }
        .tl-sort-opt:last-child { border-bottom:none; }
        .tl-sort-opt:hover { background:rgba(29,95,85,0.04); }
        .tl-sort-opt.active { color:#1D5F55; font-weight:600; }

        /* ── CARD GRID ── */
        .tl-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }

        /* ── THERAPIST CARD ── */
        .tl-card {
          background:#fff;
          border-radius:20px;
          overflow:hidden;
          transition:all .28s ease;
          box-shadow:0 2px 14px rgba(21,66,60,0.07);
          display:flex;
          flex-direction:column;
          border:1px solid rgba(21,66,60,0.06);
          cursor:pointer;
        }
        .tl-card:hover {
          transform:translateY(-6px);
          box-shadow:0 20px 50px rgba(21,66,60,0.14);
          border-color:rgba(29,95,85,0.15);
        }

        /* Photo */
        .tl-card-img-wrap {
          position:relative;
          width:100%;
          height:240px;
          overflow:hidden;
          background:#D6F0EC;
        }
        .tl-card-img {
          width:100%;
          height:100%;
          object-fit:cover;
          object-position:center top;
          transition:transform .38s ease;
        }
        .tl-card:hover .tl-card-img { transform:scale(1.05); }

        /* Gradient overlay at bottom of photo */
        .tl-card-img-wrap::after {
          content:'';
          position:absolute;
          bottom:0; left:0; right:0;
          height:80px;
          background:linear-gradient(to top, rgba(15,51,48,0.55), transparent);
          pointer-events:none;
        }

        /* Price pill overlaid on photo */
        .tl-card-price-pill {
          position:absolute;
          bottom:12px;
          left:14px;
          background:rgba(255,255,255,0.92);
          backdrop-filter:blur(10px);
          border-radius:100px;
          padding:4px 11px;
          font-size:12px;
          font-weight:800;
          color:#0F3330;
          z-index:2;
          border:1px solid rgba(255,255,255,0.9);
        }

        /* Verified badge overlaid on photo */
        .tl-verified-badge {
          position:absolute;
          top:11px;
          right:11px;
          display:flex;
          align-items:center;
          gap:4px;
          background:rgba(29,95,85,0.88);
          backdrop-filter:blur(8px);
          color:#fff;
          font-size:10px;
          font-weight:700;
          padding:4px 10px;
          border-radius:100px;
          z-index:2;
          letter-spacing:.02em;
        }

        /* Available today dot on photo */
        .tl-avail-dot-wrap {
          position:absolute;
          top:11px;
          left:11px;
          display:flex;
          align-items:center;
          gap:5px;
          background:rgba(30,132,73,0.88);
          backdrop-filter:blur(8px);
          color:#fff;
          font-size:10px;
          font-weight:700;
          padding:4px 10px;
          border-radius:100px;
          z-index:2;
        }
        .tl-avail-dot { width:5px; height:5px; border-radius:50%; background:#fff; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:.4;} }

        /* Card body */
        .tl-card-body {
          padding:16px 18px 20px;
          display:flex;
          flex-direction:column;
          gap:4px;
          flex:1;
        }

        .tl-card-name {
          font-size:16px;
          font-weight:800;
          color:#0F3330;
          letter-spacing:-.02em;
          line-height:1.2;
        }

        .tl-card-spec {
          font-size:12.5px;
          color:#536C68;
          font-weight:500;
          margin-bottom:2px;
        }

        .tl-rating-row {
          display:flex;
          align-items:center;
          gap:5px;
          margin-top:4px;
        }
        .tl-stars { display:flex; gap:1.5px; }
        .tl-rating-num { font-size:12px; font-weight:700; color:#15423C; }
        .tl-rating-new { font-size:11px; color:#7A9E97; background:rgba(21,66,60,0.06); padding:2px 9px; border-radius:100px; font-weight:600; }

        /* States */
        .tl-skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.4) 25%,rgba(255,255,255,0.75) 50%,rgba(255,255,255,0.4) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
        @keyframes shimmer { 0%{background-position:200% 0;}100%{background-position:-200% 0;} }
        .tl-error { display:flex; flex-direction:column; align-items:center; padding:72px 20px; gap:14px; text-align:center; }
        .tl-error-icon { width:60px; height:60px; border-radius:18px; background:rgba(229,57,53,0.08); display:flex; align-items:center; justify-content:center; }
        .tl-error h3 { font-size:19px; font-weight:800; color:#15423C; }
        .tl-error p { font-size:13.5px; color:#536C68; max-width:320px; line-height:1.65; }
        .tl-retry-btn { background:#1D5F55; color:#fff; border:none; border-radius:12px; padding:12px 24px; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; }
        .tl-retry-btn:hover { background:#15423C; }
        .tl-empty { text-align:center; padding:72px 20px; }
        .tl-empty-emoji { font-size:56px; margin-bottom:16px; line-height:1; }
        .tl-empty h3 { font-size:21px; font-weight:800; color:#15423C; margin-bottom:8px; }
        .tl-empty p { font-size:14px; color:#536C68; max-width:340px; margin:0 auto; line-height:1.65; }

        /* ── FOOTER ── */
        .cb-footer { width:100%; background:#0a0f0e; padding:72px 8vw 30px; border-top:1px solid rgba(255,255,255,0.04); }
        .cb-footer-top { display:grid; grid-template-columns:2.2fr 1fr 1fr 1fr; gap:56px; margin-bottom:56px; }
        .cb-footer-brand-name { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
        .cb-footer-brand-name span { color:#FFF; font-size:17px; font-weight:700; }
        .cb-footer-brand-p { font-size:13.5px; color:#4E7A72; line-height:1.75; max-width:250px; }
        .cb-footer-col h4 { font-size:10.5px; font-weight:800; color:#FFF; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:18px; opacity:0.8; }
        .cb-footer-col a { display:block; font-size:13.5px; color:#4E7A72; margin-bottom:11px; cursor:pointer; transition:color .2s; text-decoration:none; }
        .cb-footer-col a:hover { color:#7AC4BA; }
        .cb-footer-connect { display:flex; gap:10px; margin-top:18px; }
        .cb-footer-icon { width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; }
        .cb-footer-icon:hover { background:rgba(52,160,146,0.15); border-color:rgba(52,160,146,0.35); }
        .cb-footer-bottom { border-top:1px solid rgba(255,255,255,0.05); padding-top:26px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; font-size:12.5px; color:#3A5E58; }
        .cb-footer-links { display:flex; gap:18px; }
        .cb-footer-links a { color:#3A5E58; text-decoration:none; transition:color .2s; }
        .cb-footer-links a:hover { color:#4E7A72; }

        /* ── RESPONSIVE ── */
        @media (max-width:1100px) { .tl-grid { grid-template-columns:repeat(2,1fr); } .cb-footer-top { grid-template-columns:1.5fr 1fr; gap:36px; } }
        @media (max-width:900px) { .tl-sidebar { display:none; } .tl-main { padding:28px 5vw 60px; } }
        @media (max-width:720px) { .tl-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:480px) { .tl-grid { grid-template-columns:1fr; } .tl-card-img-wrap { height:200px; } }
        @media (max-width:640px) { .cb-nav { display:none; } }
      `}</style>

      {/* HEADER */}
      <header className={`cb-header${scrolled ? ' scrolled' : ''}`}>
        <Link className="cb-logo" to="/">
          <div className="cb-logo-icon"><HeartHandshake size={22} strokeWidth={2.5} /></div>
          <span className="cb-logo-text">CareBridge</span>
        </Link>
        <nav className="cb-nav">
          <Link to="/">Home</Link>
          <Link to="/find-therapist">Find a Therapist</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </nav>
        <div className="cb-header-right">
          {firstname ? (
            <div className="cb-user-menu" ref={dropRef}>
              <div className="cb-user-btn" onClick={() => setUserDrop(o => !o)}>
                <div className="cb-avatar">{firstname.charAt(0).toUpperCase()}</div>
                <span className="cb-user-name">{firstname}</span>
                <ChevronDown size={13} className={`cb-chevron${userDrop ? ' open' : ''}`} />
              </div>
              {userDrop && (
                <div className="cb-dropdown">
                  <div className="cb-dropdown-header">
                    <div className="cb-dropdown-greeting">Signed in as</div>
                    <div className="cb-dropdown-name">{firstname}</div>
                  </div>
                  <button className="cb-dropdown-item dashboard" onClick={() => { setUserDrop(false); navigate('/dashboard'); }}>
                    <LayoutDashboard size={14} /> Dashboard
                  </button>
                  <button className="cb-dropdown-item signout" onClick={handleSignOut}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="cb-btn-primary" to="/auth">Get Started</Link>
          )}
        </div>
      </header>

      <div className="tl-page">

        {/* HERO */}
        <section className="tl-hero">
          <div className="tl-hero-inner">
            <div className="tl-breadcrumb">
              <Link to="/">Home</Link>
              <span className="tl-breadcrumb-sep">›</span>
              <Link to="/find-therapist">Find a Therapist</Link>
              <span className="tl-breadcrumb-sep">›</span>
              <span style={{ fontSize: 12.5, color: '#15423C', fontWeight: 700 }}>{cat.label}</span>
            </div>
            <div className="tl-hero-content">
              <div className="tl-hero-left">
                <div className="tl-cat-icon-wrap" style={{ background: cat.bg }}>
                  <CatIcon size={32} color={cat.color} />
                </div>
                <div className="tl-hero-info">
                  <h1>{cat.emoji} {cat.label}</h1>
                  <p>{cat.desc}</p>
                  <div className="tl-hero-stats">
                    {loading ? (
                      <div className="tl-skeleton" style={{ width: 220, height: 28, borderRadius: 100 }} />
                    ) : !error && (
                      <>
                        <div className="tl-stat"><div className="tl-stat-dot" /><strong>{allTherapists.length}</strong> specialists</div>
                        <div className="tl-stat"><div className="tl-stat-dot" style={{ background: '#1E8449' }} /><strong>{allTherapists.filter(t => isAvailableToday(t.workSchedule)).length}</strong> available today</div>
                        {allTherapists.filter(t => t.rating > 0).length > 0 && (
                          <div className="tl-stat">
                            <Star size={11} fill="#F0B429" color="#F0B429" />
                            <strong>{(allTherapists.filter(t => t.rating > 0).reduce((s,t) => s + t.rating, 0) / allTherapists.filter(t => t.rating > 0).length).toFixed(1)}</strong> avg
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button className="tl-change-btn" onClick={() => navigate('/find-therapist')}>
                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Change Category
              </button>
            </div>
          </div>
        </section>

        {/* MAIN */}
        <div className="tl-main">

          {/* SIDEBAR */}
          <aside className="tl-sidebar">
            <div className="tl-sidebar-title"><Filter size={13} /> Filters</div>
            <div className="tl-filter-section">
              <div className="tl-filter-label">Availability</div>
              <button className={`tl-filter-toggle${filterAvailable ? ' active' : ''}`} onClick={() => setFilterAvailable(v => !v)}>
                <span>Available Today</span>
                {filterAvailable && <CheckCircle2 size={13} />}
              </button>
            </div>
            <div className="tl-filter-section">
              <div className="tl-filter-label">Session Mode</div>
              <div className="tl-filter-chips">
                {[
                  { v: '', label: 'All Modes', icon: <SlidersHorizontal size={12} /> },
                  { v: 'video', label: 'Video', icon: <Video size={12} /> },
                  { v: 'phone', label: 'Phone', icon: <Phone size={12} /> },
                  { v: 'chat', label: 'Chat', icon: <Chat size={12} /> },
                ].map(opt => (
                  <button key={opt.v} className={`tl-chip${filterMode === opt.v ? ' active' : ''}`} onClick={() => setFilterMode(opt.v)}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="tl-filter-section">
              <button className="tl-clear-btn" onClick={() => { setFilterAvailable(false); setFilterMode(''); setSearchQuery(''); setSortBy('Recommended'); }}>
                Clear All Filters
              </button>
            </div>
            <div className="tl-browse-other">
              <div className="tl-other-label">Browse other areas</div>
              {ALL_CATEGORIES.filter(c => c.key !== category).slice(0, 6).map(c => {
                const Icon = c.icon;
                return (
                  <Link key={c.key} className="tl-other-link" to={`/therapists/${c.key}`}>
                    <div className="tl-other-icon" style={{ background: c.bg }}><Icon size={12} color={c.color} /></div>
                    {c.label}
                    <ChevronRight size={11} color="#C0CFC8" style={{ marginLeft: 'auto' }} />
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* CONTENT */}
          <div className="tl-content">
            <div className="tl-topbar">
              <p className="tl-results-text">
                {loading ? 'Loading therapists…' :
                  <span>Showing <strong>{therapists.length}</strong> results for <strong>{cat.label}</strong></span>}
              </p>
              <div className="tl-topbar-right">
                <div className="tl-search-box">
                  <Search size={13} color="#7A9E97" />
                  <input placeholder="Search therapists…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'#7A9E97' }}><X size={12} /></button>}
                </div>
                <div className="tl-sort-wrap" ref={sortRef}>
                  <button className="tl-sort-btn" onClick={() => setSortOpen(o => !o)}>
                    Sort: {sortBy} <ChevronDown size={12} color="#7A9E97" />
                  </button>
                  {sortOpen && (
                    <div className="tl-sort-dd">
                      {SORT_OPTIONS.map(opt => (
                        <div key={opt} className={`tl-sort-opt${sortBy === opt ? ' active' : ''}`} onClick={() => { setSortBy(opt); setSortOpen(false); }}>
                          {opt} {sortBy === opt && <CheckCircle2 size={12} color="#1D5F55" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skeleton */}
            {loading && (
              <div className="tl-grid">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="tl-card" style={{ cursor:'default' }}>
                    <div className="tl-skeleton" style={{ height:240, borderRadius:0 }} />
                    <div style={{ padding:'16px 18px 20px', display:'flex', flexDirection:'column', gap:8 }}>
                      <div className="tl-skeleton" style={{ height:16, width:'70%', borderRadius:6 }} />
                      <div className="tl-skeleton" style={{ height:12, width:'50%', borderRadius:6 }} />
                      <div className="tl-skeleton" style={{ height:12, width:'40%', borderRadius:6 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="tl-error">
                <div className="tl-error-icon"><AlertCircle size={26} color="#e53935" /></div>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button className="tl-retry-btn" onClick={() => window.location.reload()}>Try Again</button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && therapists.length === 0 && (
              <div className="tl-empty">
                <div className="tl-empty-emoji">🔍</div>
                <h3>{allTherapists.length === 0 ? 'No therapists yet' : 'No results match your filters'}</h3>
                <p>{allTherapists.length === 0 ? 'No verified therapists have signed up for this category yet. Check back soon!' : 'Try adjusting your filters or clearing the search query.'}</p>
              </div>
            )}

            {/* Cards */}
            {!loading && !error && therapists.length > 0 && (
              <div className="tl-grid">
                {therapists.map(t => {
                  const fullName = getFullName(t);
                  const ratingStars = Math.round(t.rating);
                  const availToday = isAvailableToday(t.workSchedule);
                  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=D6F0EC&color=1D5F55&size=300&bold=true`;

                  return (
                    <div
                      key={t.id}
                      className="tl-card"
                      onClick={() => navigate(`/therapists/profile/${t.id}`)}
                    >
                      {/* Photo */}
                      <div className="tl-card-img-wrap">
                        <img
                          src={t.imageUrl || avatarFallback}
                          alt={fullName}
                          className="tl-card-img"
                          onError={e => { (e.target as HTMLImageElement).src = avatarFallback; }}
                        />

                        {/* Available today badge */}
                        {availToday && (
                          <div className="tl-avail-dot-wrap">
                            <div className="tl-avail-dot" /> Today
                          </div>
                        )}

                        {/* Verified badge */}
                        {t.isVerified && (
                          <div className="tl-verified-badge">
                            <CheckCircle2 size={10} /> Verified
                          </div>
                        )}

                        {/* Price pill */}
                        {t.pricePerSession > 0 && (
                          <div className="tl-card-price-pill">
                            RS {t.pricePerSession.toLocaleString()}<span style={{ fontWeight:500, fontSize:10, color:'#536C68' }}>/hr</span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="tl-card-body">
                        <div className="tl-card-name">{fullName}</div>
                        <div className="tl-card-spec">
                          {[t.specialization].filter(Boolean).join(' · ') || 'Therapist'}
                        </div>
                        <div className="tl-rating-row">
                          {t.rating > 0 ? (
                            <>
                              <div className="tl-stars">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={11} fill={s <= ratingStars ? '#F0B429' : 'transparent'} color={s <= ratingStars ? '#F0B429' : '#D4C4A0'} />
                                ))}
                              </div>
                              <span className="tl-rating-num">{t.rating.toFixed(1)}</span>
                            </>
                          ) : (
                            <span className="tl-rating-new">New</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="cb-footer">
          <div className="cb-footer-top">
            <div>
              <div className="cb-footer-brand-name"><HeartHandshake size={20} color="#34A092" /><span>CareBridge</span></div>
              <p className="cb-footer-brand-p">Building a future where digital serenity is accessible to everyone.</p>
              <div className="cb-footer-connect">
                <div className="cb-footer-icon"><Share2 size={14} color="#4E7A72" /></div>
                <div className="cb-footer-icon"><Mail size={14} color="#4E7A72" /></div>
                <div className="cb-footer-icon"><Globe size={14} color="#4E7A72" /></div>
              </div>
            </div>
            <div className="cb-footer-col"><h4>Resources</h4><a href="#help">Help Center</a><a href="#crisis">Crisis Support</a></div>
            <div className="cb-footer-col"><h4>Company</h4><Link to="/about">About Us</Link><a href="#privacy">Privacy Policy</a></div>
            <div className="cb-footer-col"><h4>Contact</h4><a href="mailto:hello@carebridge.io">hello@carebridge.io</a></div>
          </div>
          <div className="cb-footer-bottom">
            <span>© 2026 CareBridge. All rights reserved.</span>
            <div className="cb-footer-links"><a href="#twitter">Twitter</a><a href="#linkedin">LinkedIn</a></div>
          </div>
        </footer>
      </div>
    </>
  );
}