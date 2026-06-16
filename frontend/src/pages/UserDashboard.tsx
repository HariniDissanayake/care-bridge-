import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake, ChevronDown, LayoutDashboard, LogOut,
  Calendar, Clock, Video, Phone, MessageSquare as Chat,
  Smile, Meh, Frown, ThumbsUp, Heart,
  Zap, Users, BookOpen, Bot,
  ArrowRight, CheckCircle2, AlertCircle,
  MapPin, Star, ExternalLink, RefreshCw,
  Bell, Settings, ChevronRight, Loader2
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

interface Booking {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalCost: number;
  status: BookingStatus;
  sessionFormat: string;
  appointmentType: string;
  googleMeetUrl: string | null;
  createdAt: string;
  therapist: {
    id: number;
    title: string;
    specialization: string;
    imageUrl: string;
    location: string;
    rating: number;
    user: { firstName: string; lastName: string; email: string };
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const API = import.meta.env.VITE_API_BASE;

function getToken() { return localStorage.getItem('token') || ''; }

function formatTime(t: string): string {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${p}`;
}

function formatDate(d: string): string {
  if (!d) return '—';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  } catch { return d; }
}

function formatDateFull(d: string): string {
  if (!d) return '—';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch { return d; }
}

function isToday(d: string): boolean {
  return new Date(d + 'T00:00:00').toDateString() === new Date().toDateString();
}

function isTomorrow(d: string): boolean {
  const tom = new Date(); tom.setDate(tom.getDate() + 1);
  return new Date(d + 'T00:00:00').toDateString() === tom.toDateString();
}

function isUpcoming(b: Booking): boolean {
  const d = new Date(b.bookingDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today && (b.status === 'CONFIRMED' || b.status === 'PENDING');
}

function getTherapistName(b: Booking): string {
  const u = b.therapist?.user;
  if (!u) return 'Your Therapist';
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Your Therapist';
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function avatarUrl(name: string, size = 64): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D6F0EC&color=1D5F55&size=${size}&bold=true`;
}

const MOODS = [
  { label: 'Great',   icon: <Heart   size={22}/>, color: '#1D5F55' },
  { label: 'Good',    icon: <Smile   size={22}/>, color: '#2E8B57' },
  { label: 'Okay',    icon: <Meh     size={22}/>, color: '#7A9E97' },
  { label: 'Tired',   icon: <Frown   size={22}/>, color: '#B7950B' },
  { label: 'Down',    icon: <AlertCircle size={22}/>, color: '#C62828' },
];

const QUOTES = [
  { text: "Your present circumstances don't determine where you go; they merely determine where you start.", author: "Nido Qubein" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "There is hope, even when your brain tells you there isn't.", author: "John Green" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();

  const [user,        setUser]        = useState<UserProfile | null>(null);
  const [bookings,    setBookings]    = useState<Booking[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSaved,   setMoodSaved]   = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [userDrop,    setUserDrop]    = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const firstname = localStorage.getItem('firstname') || '';
  const quote     = QUOTES[new Date().getDay() % QUOTES.length];

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/auth'); return; }

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch user profile + bookings in parallel
   Promise.all([
  fetch(`${API}/api/auth/me`, { headers }).then(r => r.ok ? r.json() : null),
  fetch(`${API}/api/bookings/my`, { headers }).then(r => r.ok ? r.json() : []),
])
      .then(([userData, bookingData]) => {
        setUser(userData);
        setBookings(Array.isArray(bookingData) ? bookingData : []);
      })
      .catch(() => setError('Could not load your dashboard. Please refresh.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setUserDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSignOut = () => {
    ['token','firstname','lastname','email','role'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  const handleMood = (label: string) => {
    setSelectedMood(label);
    setMoodSaved(false);
    setTimeout(() => setMoodSaved(true), 600);
  };

  // Derived data
  const displayName   = user ? user.firstName : firstname || 'there';
  const upcomingList  = bookings.filter(isUpcoming).sort((a,b) => a.bookingDate.localeCompare(b.bookingDate));
  const nextSession   = upcomingList[0] ?? null;
  const pastSessions  = bookings.filter(b => b.status === 'COMPLETED').length;
  const totalSpent    = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
                                .reduce((s, b) => s + Number(b.totalCost || 0), 0);

  const nextLabel = nextSession
    ? isToday(nextSession.bookingDate)     ? 'TODAY'
    : isTomorrow(nextSession.bookingDate)  ? 'TOMORROW'
    : formatDate(nextSession.bookingDate)
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;min-height:100vh;font-family:'Plus Jakarta Sans',sans-serif;background:#EBF7F4;color:#2C3E3B;overflow-x:hidden;}

        /* ── HEADER ── */
        .db-header{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0 6vw;height:68px;background:rgba(208,238,232,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.5);position:fixed;top:0;left:0;z-index:200;box-shadow:0 2px 20px rgba(21,66,60,0.04);}
        .db-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .db-logo-icon{color:#1D5F55;}
        .db-logo-text{color:#15423C;font-size:18px;font-weight:700;letter-spacing:-.02em;}
        .db-header-nav{display:flex;gap:28px;margin:0 auto;}
        .db-header-nav a{font-size:13.5px;color:#4A6360;font-weight:500;text-decoration:none;transition:color .2s;}
        .db-header-nav a:hover{color:#1D5F55;}
        .db-header-right{display:flex;align-items:center;gap:10px;}
        .db-notif-btn{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#536C68;transition:all .2s;}
        .db-notif-btn:hover{background:rgba(255,255,255,0.85);color:#1D5F55;}
        .db-user-menu{position:relative;}
        .db-user-btn{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.7);border-radius:50px;padding:5px 14px 5px 5px;cursor:pointer;transition:all .2s;}
        .db-user-btn:hover{background:rgba(255,255,255,0.85);}
        .db-avatar{width:30px;height:30px;border-radius:50%;background:#1D5F55;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .db-user-name{font-size:13px;font-weight:600;color:#15423C;}
        .db-chevron{color:#15423C;transition:transform .2s;}
        .db-chevron.open{transform:rotate(180deg);}
        .db-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:rgba(255,255,255,0.97);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.6);border-radius:16px;box-shadow:0 10px 30px rgba(21,66,60,.1);min-width:200px;overflow:hidden;z-index:300;animation:dropIn .18s ease;}
        @keyframes dropIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
        .db-dropdown-head{padding:14px 18px 10px;border-bottom:1px solid rgba(21,66,60,0.05);}
        .db-dropdown-greeting{font-size:11px;color:#7A9E97;}
        .db-dropdown-name{font-size:14px;font-weight:700;color:#15423C;margin-top:1px;}
        .db-dd-item{display:flex;align-items:center;gap:9px;padding:11px 18px;font-size:13.5px;color:#4A6360;cursor:pointer;transition:all .14s;border:none;background:none;width:100%;text-align:left;font-family:inherit;}
        .db-dd-item:hover{background:rgba(29,95,85,0.05);color:#15423C;}
        .db-dd-item.danger:hover{background:rgba(229,57,53,0.05);color:#e53935;}

        /* ── LAYOUT ── */
        .db-page{padding-top:68px;min-height:100vh;}
        .db-main{max-width:1180px;margin:0 auto;padding:32px 6vw 80px;display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;opacity:0;transform:translateY(12px);transition:opacity .45s ease,transform .45s ease;}
        .db-main.mounted{opacity:1;transform:translateY(0);}

        /* ── GREETING HERO ── */
        .db-hero{background:linear-gradient(135deg,#C8EAE3 0%,#D8F2ED 50%,#B8E0D8 100%);border-radius:24px;padding:28px 32px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:20px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,0.7);}
        .db-hero::before{content:'';position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(29,95,85,0.05);right:-60px;top:-80px;pointer-events:none;}
        .db-hero-text{}
        .db-hero-greeting{font-size:clamp(22px,2.5vw,32px);font-weight:800;color:#0F3330;letter-spacing:-.025em;margin-bottom:4px;}
        .db-hero-sub{font-size:14px;color:#536C68;font-weight:400;}
        .db-hero-mascot{width:88px;height:88px;border-radius:20px;background:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:42px;backdrop-filter:blur(10px);}

        /* ── STATS ROW ── */
        .db-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
        .db-stat{background:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.8);border-radius:16px;padding:16px 18px;backdrop-filter:blur(12px);}
        .db-stat-label{font-size:10px;font-weight:700;color:#7A9E97;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;}
        .db-stat-val{font-size:22px;font-weight:800;color:#15423C;letter-spacing:-.02em;}
        .db-stat-sub{font-size:11px;color:#7A9E97;margin-top:2px;}

        /* ── SECTION TITLE ── */
        .db-sec-title{font-size:15px;font-weight:700;color:#15423C;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
        .db-sec-title a{font-size:12px;font-weight:600;color:#1D5F55;text-decoration:none;display:flex;align-items:center;gap:4px;}
        .db-sec-title a:hover{color:#15423C;}

        /* ── MOOD TRACKER ── */
        .db-mood-card{background:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.8);border-radius:20px;padding:22px 24px;margin-bottom:20px;backdrop-filter:blur(12px);}
        .db-mood-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:14px;}
        .db-mood-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:14px;border:1.5px solid rgba(21,66,60,0.1);background:rgba(255,255,255,0.5);cursor:pointer;font-family:inherit;font-size:11px;font-weight:600;color:#536C68;transition:all .18s;}
        .db-mood-btn:hover{border-color:rgba(29,95,85,0.3);background:rgba(255,255,255,0.85);}
        .db-mood-btn.active{border-color:#1D5F55;background:rgba(29,95,85,0.07);color:#15423C;}
        .db-mood-saved{display:flex;align-items:center;gap:6px;font-size:12px;color:#1D5F55;font-weight:600;margin-top:12px;animation:fadeIn .3s ease;}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

        /* ── QUICK ACTIONS ── */
        .db-actions-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
        .db-action-card{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.8);border-radius:16px;padding:16px 18px;cursor:pointer;text-decoration:none;transition:all .18s;backdrop-filter:blur(12px);}
        .db-action-card:hover{background:rgba(255,255,255,0.9);border-color:rgba(29,95,85,0.2);transform:translateY(-1px);box-shadow:0 6px 20px rgba(21,66,60,0.07);}
        .db-action-icon{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .db-action-icon.teal{background:rgba(29,95,85,0.1);}
        .db-action-icon.teal svg{color:#1D5F55;}
        .db-action-icon.green{background:rgba(30,132,73,0.1);}
        .db-action-icon.green svg{color:#1E8449;}
        .db-action-icon.blue{background:rgba(21,101,176,0.08);}
        .db-action-icon.blue svg{color:#1565C0;}
        .db-action-icon.amber{background:rgba(183,149,11,0.1);}
        .db-action-icon.amber svg{color:#8a6c00;}
        .db-action-label{font-size:10px;font-weight:700;color:#7A9E97;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px;}
        .db-action-name{font-size:13.5px;font-weight:700;color:#15423C;}

        /* ── BOOKINGS LIST ── */
        .db-booking-item{display:flex;gap:14px;align-items:flex-start;background:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.8);border-radius:18px;padding:18px 20px;margin-bottom:10px;backdrop-filter:blur(12px);transition:all .18s;}
        .db-booking-item:hover{background:rgba(255,255,255,0.88);border-color:rgba(29,95,85,0.15);}
        .db-booking-item:last-child{margin-bottom:0;}
        .db-booking-img{width:46px;height:46px;border-radius:12px;object-fit:cover;background:#D6F0EC;flex-shrink:0;}
        .db-booking-info{flex:1;min-width:0;}
        .db-booking-name{font-size:14.5px;font-weight:700;color:#15423C;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .db-booking-spec{font-size:12px;color:#7A9E97;margin-bottom:8px;}
        .db-booking-meta{display:flex;gap:10px;flex-wrap:wrap;}
        .db-booking-tag{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#536C68;}
        .db-booking-tag svg{color:#1D5F55;}
        .db-booking-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;}
        .db-status-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;font-size:10.5px;font-weight:700;}
        .db-status-pill.confirmed{background:rgba(30,132,73,0.1);color:#1E8449;}
        .db-status-pill.pending{background:rgba(183,149,11,0.1);color:#8a6c00;}
        .db-status-pill.cancelled{background:rgba(211,47,47,0.1);color:#C62828;}
        .db-status-pill.completed{background:rgba(29,95,85,0.1);color:#1D5F55;}
        .db-booking-cost{font-size:13px;font-weight:700;color:#15423C;}
        .db-meet-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;background:#1D5F55;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .18s;}
        .db-meet-btn:hover{background:#15423C;}

        /* ── RIGHT COLUMN ── */
        .db-right{}

        /* ── NEXT SESSION CARD ── */
        .db-next-card{background:linear-gradient(145deg,#1D5F55 0%,#15423C 100%);border-radius:22px;padding:24px;margin-bottom:18px;position:relative;overflow:hidden;}
        .db-next-card::before{content:'';position:absolute;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.04);right:-40px;bottom:-60px;}
        .db-next-card::after{content:'';position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.03);left:-20px;top:-30px;}
        .db-next-label{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);border-radius:100px;padding:4px 12px;font-size:10.5px;font-weight:800;color:#AEE4DB;letter-spacing:.08em;margin-bottom:16px;position:relative;z-index:2;}
        .db-next-dot{width:6px;height:6px;border-radius:50%;background:#AEE4DB;animation:pulse-dot 1.6s ease-in-out infinite;}
        @keyframes pulse-dot{0%,100%{opacity:.4;transform:scale(.8);}50%{opacity:1;transform:scale(1.2);}}
        .db-next-title{font-size:20px;font-weight:800;color:#fff;letter-spacing:-.02em;margin-bottom:3px;position:relative;z-index:2;}
        .db-next-therapist{font-size:13px;color:rgba(255,255,255,0.65);margin-bottom:16px;position:relative;z-index:2;}
        .db-next-time-row{display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,0.8);font-weight:600;margin-bottom:18px;position:relative;z-index:2;}
        .db-next-time-row svg{color:rgba(174,228,219,0.8);}
        .db-next-btn{width:100%;padding:13px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:12px;color:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .2s;position:relative;z-index:2;text-decoration:none;}
        .db-next-btn:hover{background:rgba(255,255,255,0.25);}
        .db-next-empty{text-align:center;padding:10px 0 4px;}
        .db-next-empty-text{font-size:13px;color:rgba(255,255,255,0.65);margin-bottom:14px;line-height:1.6;}
        .db-next-empty-btn{display:inline-flex;align-items:center;gap:6px;padding:11px 20px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:12px;color:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s;}
        .db-next-empty-btn:hover{background:rgba(255,255,255,0.25);}

        /* ── QUOTE CARD ── */
        .db-quote-card{background:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.8);border-radius:20px;padding:22px 24px;backdrop-filter:blur(12px);}
        .db-quote-mark{font-size:32px;color:rgba(29,95,85,0.2);font-family:Georgia,serif;line-height:1;margin-bottom:6px;}
        .db-quote-text{font-size:13.5px;color:#536C68;line-height:1.7;font-style:italic;margin-bottom:12px;}
        .db-quote-author{font-size:12px;font-weight:700;color:#1D5F55;}

        /* ── EMPTY / LOADING ── */
        .db-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:10px;text-align:center;}
        .db-empty-icon{width:56px;height:56px;border-radius:16px;background:rgba(29,95,85,0.06);display:flex;align-items:center;justify-content:center;margin-bottom:4px;}
        .db-empty-title{font-size:14px;font-weight:700;color:#15423C;}
        .db-empty-sub{font-size:12px;color:#7A9E97;max-width:200px;line-height:1.6;}
        .db-spinner{width:32px;height:32px;border:3px solid rgba(29,95,85,0.12);border-top-color:#1D5F55;border-radius:50%;animation:spin .8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* ── ERROR BANNER ── */
        .db-error-bar{background:rgba(211,47,47,0.07);border:1px solid rgba(211,47,47,0.15);border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:10px;font-size:13px;color:#C62828;margin-bottom:20px;}

        @media(max-width:900px){
          .db-main{grid-template-columns:1fr;}
          .db-right{order:-1;}
          .db-stats{grid-template-columns:repeat(3,1fr);}
        }
        @media(max-width:560px){
          .db-stats{grid-template-columns:1fr 1fr;}
          .db-actions-grid{grid-template-columns:1fr 1fr;}
          .db-mood-grid{grid-template-columns:repeat(5,1fr);}
          .db-header-nav{display:none;}
        }
      `}</style>

      {/* HEADER */}
      <header className="db-header">
        <Link className="db-logo" to="/">
          <div className="db-logo-icon"><HeartHandshake size={20} strokeWidth={2.5}/></div>
          <span className="db-logo-text">CareBridge</span>
        </Link>
        <nav className="db-header-nav">
          <Link to="/">Home</Link>
          <Link to="/find-therapist">Find a Therapist</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </nav>
        <div className="db-header-right">
          <div className="db-notif-btn"><Bell size={15}/></div>
          <div className="db-user-menu" ref={dropRef}>
            <div className="db-user-btn" onClick={() => setUserDrop(o => !o)}>
              <div className="db-avatar">{(user?.firstName || firstname || '?').charAt(0).toUpperCase()}</div>
              <span className="db-user-name">{user?.firstName || firstname}</span>
              <ChevronDown size={13} className={`db-chevron${userDrop ? ' open' : ''}`}/>
            </div>
            {userDrop && (
              <div className="db-dropdown">
                <div className="db-dropdown-head">
                  <div className="db-dropdown-greeting">Signed in as</div>
                  <div className="db-dropdown-name">{user?.firstName} {user?.lastName}</div>
                </div>
                <button className="db-dd-item" onClick={() => { setUserDrop(false); navigate('/dashboard'); }}>
                  <LayoutDashboard size={14}/> Dashboard
                </button>
                <button className="db-dd-item" onClick={() => setUserDrop(false)}>
                  <Settings size={14}/> Settings
                </button>
                <button className="db-dd-item danger" onClick={handleSignOut}>
                  <LogOut size={14}/> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="db-page">
        <div className={`db-main${mounted ? ' mounted' : ''}`}>

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* Error */}
            {error && (
              <div className="db-error-bar">
                <AlertCircle size={15}/>
                {error}
                <button onClick={() => window.location.reload()}
                  style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#C62828', display:'flex', alignItems:'center', gap:4, fontFamily:'inherit', fontSize:12, fontWeight:700 }}>
                  <RefreshCw size={12}/> Retry
                </button>
              </div>
            )}

            {/* Greeting Hero */}
            <div className="db-hero">
              <div className="db-hero-text">
                {loading
                  ? <div className="db-spinner" style={{ width:24, height:24, marginBottom:8 }}/>
                  : <h1 className="db-hero-greeting">{getGreeting()}, {displayName} 👋</h1>
                }
                <p className="db-hero-sub">How are you feeling today?</p>
              </div>
              <div className="db-hero-mascot">🌿</div>
            </div>

            {/* Stats */}
            <div className="db-stats">
              <div className="db-stat">
                <div className="db-stat-label">Sessions Booked</div>
                <div className="db-stat-val">{loading ? '—' : bookings.length}</div>
                <div className="db-stat-sub">All time</div>
              </div>
              <div className="db-stat">
                <div className="db-stat-label">Completed</div>
                <div className="db-stat-val">{loading ? '—' : pastSessions}</div>
                <div className="db-stat-sub">Sessions done</div>
              </div>
              <div className="db-stat">
                <div className="db-stat-label">Upcoming</div>
                <div className="db-stat-val">{loading ? '—' : upcomingList.length}</div>
                <div className="db-stat-sub">Scheduled</div>
              </div>
            </div>

            {/* Mood Tracker */}
            <div className="db-mood-card">
              <div className="db-sec-title" style={{ marginBottom:0 }}>
                <span>Mood Tracker</span>
              </div>
              <div className="db-mood-grid">
                {MOODS.map(m => (
                  <button key={m.label}
                    className={`db-mood-btn${selectedMood === m.label ? ' active' : ''}`}
                    onClick={() => handleMood(m.label)}
                    style={selectedMood === m.label ? { borderColor: m.color, color: m.color } : {}}>
                    <span style={{ color: selectedMood === m.label ? m.color : '#7A9E97' }}>{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
              {moodSaved && selectedMood && (
                <div className="db-mood-saved">
                  <CheckCircle2 size={13}/> Mood logged as "{selectedMood}" — keep going 💚
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="db-sec-title">
              <span>Quick Actions</span>
            </div>
            <div className="db-actions-grid">
              <Link to="/find-therapist" className="db-action-card">
                <div className="db-action-icon teal"><Calendar size={18}/></div>
                <div>
                  <div className="db-action-label">Sessions</div>
                  <div className="db-action-name">Book a Session</div>
                </div>
              </Link>
              <div className="db-action-card" style={{ cursor:'default' }}>
                <div className="db-action-icon green"><Bot size={18}/></div>
                <div>
                  <div className="db-action-label">AI Support</div>
                  <div className="db-action-name">Chat with AI</div>
                </div>
              </div>
              <div className="db-action-card" style={{ cursor:'default' }}>
                <div className="db-action-icon blue"><Users size={18}/></div>
                <div>
                  <div className="db-action-label">Community</div>
                  <div className="db-action-name">Group Discussion</div>
                </div>
              </div>
              <div className="db-action-card" style={{ cursor:'default' }}>
                <div className="db-action-icon amber"><BookOpen size={18}/></div>
                <div>
                  <div className="db-action-label">Resources</div>
                  <div className="db-action-name">Healing Guide</div>
                </div>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="db-sec-title" style={{ marginTop:8 }}>
              <span>Upcoming Sessions</span>
              <Link to="/find-therapist">Book new <ChevronRight size={13}/></Link>
            </div>

            {loading ? (
              <div className="db-empty"><div className="db-spinner"/></div>
            ) : upcomingList.length === 0 ? (
              <div className="db-empty">
                <div className="db-empty-icon"><Calendar size={22} color="#1D5F55"/></div>
                <div className="db-empty-title">No upcoming sessions</div>
                <div className="db-empty-sub">Book a session with a therapist to get started on your wellness journey.</div>
              </div>
            ) : (
              upcomingList.slice(0, 4).map(b => {
                const tName = getTherapistName(b);
                const tImg  = b.therapist?.imageUrl || avatarUrl(tName, 46);
                return (
                  <div key={b.id} className="db-booking-item">
                    
                    <div className="db-booking-info">
                      <div className="db-booking-name">
                        {b.therapist?.title ? `${b.therapist.title} ` : ''}{tName}
                      </div>
                      <div className="db-booking-spec">
                        {b.therapist?.specialization || 'Licensed Therapist'}
                      </div>
                      <div className="db-booking-meta">
                        <span className="db-booking-tag"><Calendar size={11}/>{formatDate(b.bookingDate)}</span>
                        <span className="db-booking-tag"><Clock size={11}/>{formatTime(b.startTime)}</span>
                        
                      </div>
                    </div>
                    <div className="db-booking-right">
                      <span className={`db-status-pill ${b.status.toLowerCase()}`}>
                        {b.status === 'CONFIRMED' ? 'Confirmed' :
                         b.status === 'PENDING'   ? 'Pending'   : b.status}
                      </span>
                      <span className="db-booking-cost">LKR {Number(b.totalCost).toLocaleString()}</span>
                      {b.googleMeetUrl && b.status === 'CONFIRMED' && (
                        <a href={b.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="db-meet-btn">
                          <Video size={11}/> Join
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Past Sessions */}
            {!loading && pastSessions > 0 && (() => {
              const past = bookings.filter(b => b.status === 'COMPLETED')
                                   .sort((a,b) => b.bookingDate.localeCompare(a.bookingDate))
                                   .slice(0, 3);
              return (
                <>
                  <div className="db-sec-title" style={{ marginTop:24 }}>
                    <span>Recent Activity</span>
                  </div>
                  {past.map(b => {
                    const tName = getTherapistName(b);
                    const tImg  = b.therapist?.imageUrl || avatarUrl(tName, 46);
                    return (
                      <div key={b.id} className="db-booking-item" style={{ opacity:0.85 }}>
                        <img src={tImg} alt={tName} className="db-booking-img"
                          onError={e => { (e.target as HTMLImageElement).src = avatarUrl(tName, 46); }}/>
                        <div className="db-booking-info">
                          <div className="db-booking-name">{tName}</div>
                          <div className="db-booking-spec">{b.therapist?.specialization || 'Licensed Therapist'}</div>
                          <div className="db-booking-meta">
                            <span className="db-booking-tag"><Calendar size={11}/>{formatDateFull(b.bookingDate)}</span>
                            <span className="db-booking-tag"><Clock size={11}/>{formatTime(b.startTime)} – {formatTime(b.endTime)}</span>
                          </div>
                        </div>
                        <div className="db-booking-right">
                          <span className="db-status-pill completed"><CheckCircle2 size={10}/> Done</span>
                          <span className="db-booking-cost">LKR {Number(b.totalCost).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()}

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="db-right">

            {/* Up Next Card */}
            <div className="db-next-card">
              {loading ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 0' }}>
                  <Loader2 size={24} color="rgba(255,255,255,0.6)" style={{ animation:'spin .9s linear infinite' }}/>
                </div>
              ) : nextSession ? (
                <>
                  <div className="db-next-label">
                    <span className="db-next-dot"/>
                    {nextLabel}
                  </div>
                  <div className="db-next-title">Therapy Session</div>
                  <div className="db-next-therapist">
                    {nextSession.therapist?.title ? `${nextSession.therapist.title} ` : ''}
                    {getTherapistName(nextSession)}
                  </div>
                  <div className="db-next-time-row">
                    <Clock size={14}/>
                    {formatTime(nextSession.startTime)} – {formatTime(nextSession.endTime)}
                  </div>
                  {nextSession.googleMeetUrl && nextSession.status === 'CONFIRMED' ? (
                    <a href={nextSession.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="db-next-btn">
                      <Video size={14}/> Prepare for Session <ExternalLink size={12}/>
                    </a>
                  ) : (
                    <button className="db-next-btn" onClick={() => navigate(`/booking/confirmation/${nextSession.id}`)}>
                      <ArrowRight size={14}/> View Booking
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="db-next-label"><span className="db-next-dot"/> UP NEXT</div>
                  <div className="db-next-empty">
                    <div className="db-next-empty-text">
                      No upcoming sessions yet. Book your first session to start your wellness journey.
                    </div>
                    <Link to="/find-therapist" className="db-next-empty-btn">
                      <Zap size={13}/> Find a Therapist
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Quote Card */}
            <div className="db-quote-card">
              <div className="db-quote-mark">"</div>
              <div className="db-quote-text">{quote.text}</div>
              <div className="db-quote-author">— {quote.author}</div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}