import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  HeartHandshake, ChevronDown, LayoutDashboard, LogOut,
  CheckCircle2, Clock, Calendar, Video, Phone,
  MessageSquare as Chat, Shield, Share2, Mail, Globe,
  AlertCircle, Loader2, Download,
  ExternalLink, RefreshCw, Home
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface BookingDetail {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalCost: number;
  status: BookingStatus;
  sessionFormat: string;
  appointmentType: string;
  googleMeetUrl: string | null;
  clientNotes: string | null;
  createdAt: string;
  therapist: {
    id: number;
    title: string;
    specialization: string;
    imageUrl: string;
    location: string;
    user: { firstName: string; lastName: string; email: string };
  };
  client: { firstName: string; lastName: string; email: string };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatTime(t: string): string {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDate(d: string): string {
  if (!d) return '—';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch { return d; }
}

function getTherapistName(b: BookingDetail): string {
  const u = b.therapist?.user;
  if (!u) return 'Your Therapist';
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  return name || 'Your Therapist';
}

function downloadCalendar(b: BookingDetail) {
  const name     = getTherapistName(b);
  const dateStr  = b.bookingDate?.replace(/-/g, '') ?? '';
  const startStr = (b.startTime?.replace(':', '') ?? '0000') + '00';
  const endStr   = (b.endTime?.replace(':', '')   ?? '0100') + '00';
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CareBridge//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dateStr}T${startStr}`,
    `DTEND:${dateStr}T${endStr}`,
    `SUMMARY:Therapy Session with ${name}`,
    `DESCRIPTION:${b.sessionFormat} – ${b.appointmentType}`,
    b.googleMeetUrl ? `URL:${b.googleMeetUrl}` : '',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  const a = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'carebridge-session.ics';
  a.click();
}

// ─── GHOST SVG ────────────────────────────────────────────────────────────────

function GhostIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 52 C18 28 72 28 72 52 L72 80 L60 72 L49 80 L38 72 L27 80 Z"
        fill="rgba(255,255,255,0.85)" stroke="rgba(29,95,85,0.15)" strokeWidth="1.5"/>
      <ellipse cx="35" cy="50" rx="5" ry="6" fill="#1D5F55" opacity="0.7"/>
      <ellipse cx="55" cy="50" rx="5" ry="6" fill="#1D5F55" opacity="0.7"/>
      <circle cx="37" cy="48" r="1.8" fill="white"/>
      <circle cx="57" cy="48" r="1.8" fill="white"/>
      <path d="M38 60 Q45 66 52 60" stroke="#1D5F55" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE;

export default function BookingConfirmation() {
  // ── FIX 1: Support multiple route/param patterns ───────────────────────────
  // Handles: /booking/confirm/:id  /booking/confirmation/:bookingId  ?bookingId=X  ?orderId=X
  const params = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();

  const bookingId =
    params.bookingId ||
    searchParams.get('bookingId') ||
    searchParams.get('orderId');

  const navigate = useNavigate();

  const [firstname, setFirstname] = useState('');
  const [userDrop,  setUserDrop]  = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const [booking,    setBooking]    = useState<BookingDetail | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // ── FIX 2: Track whether we've exceeded polling limit separately ───────────
  const [pollCount,  setPollCount]  = useState(0);
  const [pollActive, setPollActive] = useState(true);
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 120); }, []);
  useEffect(() => { setFirstname(localStorage.getItem('firstname') || ''); }, []);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setUserDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const fetchBooking = useCallback(async (isInitial = false) => {
    if (!bookingId) {
      setFetchError('No booking ID found. Please check your dashboard.');
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          setFetchError('Session expired. Please log in again.');
        } else if (res.status === 404) {
          setFetchError('Booking not found. Please check your dashboard.');
        } else {
          setFetchError(`Server error (${res.status}). Please try again.`);
        }
        setLoading(false);
        return;
      }
      const data: BookingDetail = await res.json();
      setBooking(data);
      setFetchError(null);
      // ── FIX 3: Stop polling as soon as status leaves PENDING ──────────────
      if (data.status !== 'PENDING') {
        setPollActive(false);
      }
    } catch (e) {
      if (isInitial) {
        setFetchError('Could not reach the server. Please check your connection.');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [bookingId]);

  // Initial fetch
  useEffect(() => { fetchBooking(true); }, [fetchBooking]);

  useEffect(() => {
    setPollActive(false);
  }, []);

  const handleSignOut = () => {
    ['token', 'firstname', 'lastname', 'email', 'role'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  const isConfirmed = booking?.status === 'CONFIRMED';
  const isCancelled = booking?.status === 'CANCELLED';
  const isPending   = booking?.status === 'PENDING';
  const isCompleted = booking?.status === 'COMPLETED';

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;min-height:100vh;overflow-x:hidden;font-family:'Plus Jakarta Sans',sans-serif;background:#EBF7F4;color:#2C3E3B;}

        /* ── HEADER ── */
        .cb-header{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0 8vw;height:76px;background:rgba(208,243,236,0.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 4px 30px rgba(21,66,60,0.04);border-bottom:1px solid rgba(255,255,255,0.4);position:fixed;top:0;left:0;z-index:200;transition:all .3s;}
        .cb-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .cb-logo-icon{color:#1D5F55;}
        .cb-logo-text{color:#15423C;font-size:19px;font-weight:700;letter-spacing:-.02em;}
        .cb-nav{display:flex;gap:32px;margin-left:auto;margin-right:40px;}
        .cb-nav a{font-size:14px;color:#4A6360;font-weight:500;text-decoration:none;transition:color .2s;}
        .cb-nav a:hover{color:#1D5F55;}
        .cb-header-right{display:flex;align-items:center;gap:12px;}
        .cb-user-menu{position:relative;}
        .cb-user-btn{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.6);border-radius:50px;padding:6px 16px 6px 6px;cursor:pointer;transition:all .2s;}
        .cb-user-btn:hover{background:rgba(255,255,255,0.8);}
        .cb-avatar{width:32px;height:32px;border-radius:50%;background:#1D5F55;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .cb-user-name{font-size:14px;font-weight:600;color:#15423C;}
        .cb-chevron{color:#15423C;transition:transform .2s;}
        .cb-chevron.open{transform:rotate(180deg);}
        .cb-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.5);border-radius:16px;box-shadow:0 10px 30px rgba(21,66,60,.08);min-width:200px;overflow:hidden;z-index:300;animation:dropIn .2s ease;}
        @keyframes dropIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
        .cb-dropdown-header{padding:16px 20px 12px;border-bottom:1px solid rgba(21,66,60,0.05);}
        .cb-dropdown-greeting{font-size:12px;color:#7A8F8B;}
        .cb-dropdown-name{font-size:15px;font-weight:700;color:#15423C;margin-top:2px;}
        .cb-dropdown-item{display:flex;align-items:center;gap:10px;padding:12px 20px;font-size:14px;color:#4A6360;cursor:pointer;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:inherit;}
        .cb-dropdown-item.dashboard{color:#1D5F55;font-weight:500;}
        .cb-dropdown-item.dashboard:hover{background:rgba(29,95,85,0.06);}
        .cb-dropdown-item.signout:hover{background:rgba(229,57,53,0.06);color:#e53935;}

        /* ── PROGRESS BAR ── */
        .bc-progress-strip{background:rgba(255,255,255,0.45);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.6);padding:0 8vw;margin-top:76px;}
        .bc-progress-inner{display:flex;align-items:center;max-width:820px;padding:16px 0;gap:0;}
        .bc-step{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:#7A9E97;flex-shrink:0;}
        .bc-step.done{color:#1E8449;}
        .bc-step.active{color:#15423C;}
        .bc-step-num{width:24px;height:24px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;}
        .bc-step.done .bc-step-num{background:#1E8449;border-color:#1E8449;color:#fff;}
        .bc-step.active .bc-step-num{background:#15423C;border-color:#15423C;color:#fff;}
        .bc-step-line{flex:1;height:2px;background:rgba(29,95,85,0.1);margin:0 10px;min-width:20px;}
        .bc-step-line.done{background:rgba(30,132,73,0.35);}

        /* ── PAGE BODY ── */
        .bconf-page{min-height:100vh;}

        /* ── HERO ── */
        .bconf-hero{
          background:radial-gradient(ellipse at 50% 0%,#B8E8DE 0%,#D2EFEA 40%,#EBF7F4 100%);
          padding:48px 8vw 40px;
          text-align:center;
          position:relative;
          overflow:hidden;
        }
        .bconf-confetti{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
        .bconf-dot{position:absolute;border-radius:50%;animation:floatUp 5s ease-in infinite;}
        @keyframes floatUp{0%{opacity:0;transform:translateY(80%) scale(0);}15%{opacity:1;}85%{opacity:0.4;}100%{opacity:0;transform:translateY(-160px) scale(1.1);}}

        .bconf-hero-inner{position:relative;z-index:2;}
        .bconf-icon-wrap{
          width:110px;height:110px;border-radius:28px;
          background:rgba(255,255,255,0.75);border:1px solid rgba(255,255,255,0.9);
          box-shadow:0 12px 40px rgba(21,66,60,0.1);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 22px;position:relative;backdrop-filter:blur(10px);
        }
        .bconf-icon-badge{
          position:absolute;top:-8px;right:-8px;
          width:28px;height:28px;border-radius:50%;
          background:#1E8449;border:3px solid #EBF7F4;
          display:flex;align-items:center;justify-content:center;
        }
        .bconf-hero-title{font-size:clamp(28px,3.5vw,46px);font-weight:800;color:#0F3330;letter-spacing:-.03em;line-height:1.15;margin-bottom:8px;}
        .bconf-hero-sub{font-size:14.5px;color:#536C68;max-width:400px;margin:0 auto 4px;line-height:1.65;}
        .bconf-booking-pill{
          display:inline-flex;align-items:center;gap:6px;
          margin-top:14px;
          background:rgba(255,255,255,0.65);border:1px solid rgba(255,255,255,0.9);
          border-radius:100px;padding:6px 18px;
          font-size:12px;font-weight:700;color:#536C68;
          backdrop-filter:blur(10px);
        }
        .bconf-booking-pill strong{color:#1D5F55;}

        /* Poll strip */
        .bconf-poll-strip{
          display:flex;align-items:center;gap:8px;
          background:rgba(183,149,11,0.07);border-top:1px solid rgba(183,149,11,0.14);
          padding:10px 8vw;font-size:13px;color:#7a5c00;font-weight:500;
        }
        .bconf-poll-strip button{
          margin-left:auto;background:none;border:none;cursor:pointer;
          color:#7a5c00;font-family:inherit;font-size:12px;font-weight:700;
          display:flex;align-items:center;gap:4px;
        }
        .bconf-poll-dots{display:flex;gap:4px;margin-left:4px;}
        .bconf-poll-dots span{width:5px;height:5px;border-radius:50%;background:#7a5c00;animation:pulse 1.4s ease-in-out infinite;}
        .bconf-poll-dots span:nth-child(2){animation-delay:.2s;}
        .bconf-poll-dots span:nth-child(3){animation-delay:.4s;}
        @keyframes pulse{0%,100%{opacity:.25;transform:scale(0.8);}50%{opacity:1;transform:scale(1.1);}}

        /* ── BODY ── */
        .bconf-body{
          padding:32px 8vw 72px;max-width:820px;margin:0 auto;
          opacity:0;transform:translateY(16px);
          transition:opacity .45s ease,transform .45s ease;
        }
        .bconf-body.mounted{opacity:1;transform:translateY(0);}

        /* ── CARD ── */
        .bconf-card{
          background:rgba(255,255,255,0.68);backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.85);border-radius:24px;
          overflow:hidden;box-shadow:0 8px 36px rgba(21,66,60,0.06);
          margin-bottom:20px;
        }
        .bconf-card-head{padding:20px 26px 16px;border-bottom:1px solid rgba(21,66,60,0.06);}
        .bconf-card-title{font-size:15.5px;font-weight:700;color:#15423C;display:flex;align-items:center;gap:8px;}
        .bconf-card-title svg{color:#1D5F55;}

        /* Therapist row */
        .bconf-therapist-row{display:flex;align-items:center;gap:14px;padding:18px 26px;border-bottom:1px solid rgba(21,66,60,0.05);}
        .bconf-therapist-img{width:52px;height:52px;border-radius:14px;object-fit:cover;background:#D6F0EC;flex-shrink:0;}
        .bconf-therapist-name{font-size:16px;font-weight:700;color:#15423C;margin-bottom:2px;}
        .bconf-therapist-sub{font-size:12px;color:#7A9E97;}

        /* Detail grid */
        .bconf-grid{display:grid;grid-template-columns:1fr 1fr;}
        .bconf-grid-item{
          display:flex;align-items:flex-start;gap:12px;
          padding:16px 26px;
          border-bottom:1px solid rgba(21,66,60,0.05);
          border-right:1px solid rgba(21,66,60,0.05);
        }
        .bconf-grid-item:nth-child(even){border-right:none;}
        .bconf-grid-item:nth-last-child(-n+2){border-bottom:none;}
        .bconf-grid-icon{width:32px;height:32px;border-radius:9px;background:rgba(29,95,85,0.07);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
        .bconf-grid-icon svg{color:#1D5F55;}
        .bconf-grid-label{font-size:10px;font-weight:800;color:#7A9E97;text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px;}
        .bconf-grid-value{font-size:13.5px;font-weight:600;color:#15423C;line-height:1.4;}
        .bconf-grid-value-sub{font-size:12px;color:#536C68;font-weight:500;margin-top:1px;}

        /* Status badge */
        .bconf-status-badge{
          display:inline-flex;align-items:center;gap:5px;
          padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;
        }
        .bconf-status-badge.confirmed{background:rgba(30,132,73,0.1);color:#1E8449;}
        .bconf-status-badge.pending{background:rgba(183,149,11,0.1);color:#8a6c00;}
        .bconf-status-badge.cancelled{background:rgba(211,47,47,0.1);color:#D32F2F;}
        .bconf-status-badge.completed{background:rgba(29,95,85,0.1);color:#1D5F55;}

        /* Cost row */
        .bconf-cost-row{display:flex;align-items:center;justify-content:space-between;padding:18px 26px;background:rgba(29,95,85,0.03);}
        .bconf-cost-label{font-size:13px;color:#536C68;font-weight:500;display:flex;align-items:center;gap:6px;}
        .bconf-cost-label svg{color:#1D5F55;}
        .bconf-cost-amount{font-size:22px;font-weight:800;color:#0F3330;letter-spacing:-.02em;}

        /* Info box */
        .bconf-info-box{background:rgba(29,95,85,0.05);border:1px solid rgba(29,95,85,0.1);border-radius:14px;padding:14px 18px;display:flex;gap:11px;align-items:flex-start;margin-bottom:18px;}
        .bconf-info-box svg{color:#1D5F55;flex-shrink:0;margin-top:1px;}
        .bconf-info-text{font-size:13px;color:#536C68;line-height:1.65;}

        /* Meet button */
        .bconf-meet-btn{width:100%;padding:15px;background:#1D5F55;color:#fff;border:none;border-radius:14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;transition:all .22s;box-shadow:0 6px 20px rgba(21,66,60,.2);margin-bottom:12px;text-decoration:none;}
        .bconf-meet-btn:hover{background:#15423C;transform:translateY(-2px);box-shadow:0 10px 26px rgba(21,66,60,.28);}

        /* Action buttons */
        .bconf-actions{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
        .bconf-action-btn{display:flex;align-items:center;justify-content:center;gap:7px;padding:13px 16px;border-radius:13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;text-decoration:none;border:none;}
        .bconf-action-btn.primary{background:#1D5F55;color:#fff;box-shadow:0 4px 14px rgba(21,66,60,.16);}
        .bconf-action-btn.primary:hover{background:#15423C;transform:translateY(-1px);}
        .bconf-action-btn.outline{background:rgba(255,255,255,0.6);border:1px solid rgba(21,66,60,0.14);color:#536C68;}
        .bconf-action-btn.outline:hover{border-color:#1D5F55;color:#15423C;background:rgba(255,255,255,0.85);}
        .bconf-action-btn.secondary-green{background:rgba(29,95,85,0.07);border:1px solid rgba(29,95,85,0.16);color:#1D5F55;}
        .bconf-action-btn.secondary-green:hover{background:rgba(29,95,85,0.13);}
        .bconf-action-btn.danger{background:rgba(211,47,47,0.06);border:1px solid rgba(211,47,47,0.14);color:#C62828;}
        .bconf-action-btn.danger:hover{background:rgba(211,47,47,0.12);}

        /* Notes */
        .bconf-notes-box{background:rgba(21,66,60,0.03);border:1px solid rgba(21,66,60,0.08);border-radius:12px;padding:13px 16px;font-size:13px;color:#536C68;line-height:1.7;font-style:italic;}

        /* States */
        .bconf-center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:55vh;gap:14px;text-align:center;padding:40px;}
        .bconf-spinner{width:38px;height:38px;border:3px solid rgba(29,95,85,0.12);border-top-color:#1D5F55;border-radius:50%;animation:spin .8s linear infinite;}

        /* Footer */
        .cb-footer{width:100%;background:#0c1a18;padding:56px 8vw 28px;border-top:1px solid rgba(255,255,255,0.04);}
        .cb-footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px;}
        .cb-footer-brand-name{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
        .cb-footer-brand-name span{color:#fff;font-size:17px;font-weight:700;}
        .cb-footer-brand-p{font-size:13px;color:#7A9E97;line-height:1.7;max-width:240px;}
        .cb-footer-col h4{font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:18px;}
        .cb-footer-col a{display:block;font-size:13px;color:#7A9E97;margin-bottom:10px;text-decoration:none;transition:color .2s;}
        .cb-footer-col a:hover{color:#AEE4DB;}
        .cb-footer-connect{display:flex;gap:10px;margin-top:18px;}
        .cb-footer-icon{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
        .cb-footer-icon:hover{background:rgba(52,160,146,0.14);}
        .cb-footer-bottom{border-top:1px solid rgba(255,255,255,0.05);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;font-size:12.5px;color:#4E6E68;}
        .cb-footer-links{display:flex;gap:18px;}
        .cb-footer-links a{color:#4E6E68;text-decoration:none;transition:color .2s;}
        .cb-footer-links a:hover{color:#7A9E97;}

        @media(max-width:768px){
          .cb-nav{display:none;}
          .bconf-grid{grid-template-columns:1fr;}
          .bconf-actions{grid-template-columns:1fr;}
          .cb-footer-top{grid-template-columns:1fr;gap:28px;}
          .bconf-grid-item{border-right:none!important;}
          .bconf-grid-item:nth-last-child(-n+2){border-bottom:1px solid rgba(21,66,60,0.05)!important;}
          .bconf-grid-item:last-child{border-bottom:none!important;}
        }
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* ── HEADER ── */}
      <header className="cb-header">
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
          {firstname && (
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
          )}
        </div>
      </header>

      <div className="bconf-page">

        {/* ── PROGRESS ── */}
        <div className="bc-progress-strip">
          <div className="bc-progress-inner">
            <div className="bc-step done">
              <div className="bc-step-num"><CheckCircle2 size={11}/></div>Select Therapist
            </div>
            <div className="bc-step-line done"/>
            <div className="bc-step done">
              <div className="bc-step-num"><CheckCircle2 size={11}/></div>Choose Slot
            </div>
            <div className="bc-step-line done"/>
            <div className="bc-step done">
              <div className="bc-step-num"><CheckCircle2 size={11}/></div>Review &amp; Pay
            </div>
            <div className="bc-step-line done"/>
            <div className="bc-step active">
              <div className="bc-step-num">4</div>Confirmation
            </div>
          </div>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div className="bconf-center">
            <div className="bconf-spinner"/>
            <p style={{ fontSize: 14, color: '#536C68', fontWeight: 500 }}>Loading your booking…</p>
          </div>
        )}

        {/* ── ERROR ── */}
        {!loading && fetchError && (
          <div className="bconf-center">
            <AlertCircle size={38} color="#D32F2F"/>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#15423C' }}>Could not load booking</p>
            <p style={{ fontSize: 13, color: '#536C68', maxWidth: 320, lineHeight: 1.6 }}>{fetchError}</p>
            {/* ── FIX 5: Show detected bookingId for debugging ── */}
            {!bookingId && (
              <p style={{ fontSize: 12, color: '#D32F2F', maxWidth: 320, lineHeight: 1.6 }}>
                No booking ID detected in URL. Expected <code>/booking/confirm/:id</code> or <code>?bookingId=X</code>.
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => { setLoading(true); setFetchError(null); fetchBooking(true); }}
                style={{ background: 'rgba(29,95,85,0.08)', color: '#1D5F55', border: '1px solid rgba(29,95,85,0.2)', borderRadius: 12, padding: '11px 20px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={13}/> Retry
              </button>
              <button onClick={() => navigate('/dashboard')}
                style={{ background: '#1D5F55', color: '#fff', border: 'none', borderRadius: 12, padding: '11px 22px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        {!loading && !fetchError && booking && (() => {
          const tName = getTherapistName(booking);
          const tImg  = booking.therapist?.imageUrl
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(tName)}&background=D6F0EC&color=1D5F55&size=80&bold=true`;

          const statusLabel: Record<BookingStatus, string> = {
            CONFIRMED: 'Confirmed',
            PENDING:   'Pending Payment',
            CANCELLED: 'Cancelled',
            COMPLETED: 'Completed',
          };

          return (
            <>
              {/* ── HERO ── */}
              <section className="bconf-hero">
                <div className="bconf-confetti">
                  {isConfirmed && [
                    { left: '7%',  delay: '0s',   size: 8,  color: 'rgba(29,95,85,0.22)' },
                    { left: '18%', delay: '1.3s',  size: 6,  color: 'rgba(52,160,146,0.28)' },
                    { left: '32%', delay: '0.5s',  size: 10, color: 'rgba(174,228,219,0.45)' },
                    { left: '55%', delay: '2.1s',  size: 7,  color: 'rgba(29,95,85,0.18)' },
                    { left: '68%', delay: '0.9s',  size: 9,  color: 'rgba(52,160,146,0.22)' },
                    { left: '82%', delay: '1.6s',  size: 5,  color: 'rgba(174,228,219,0.55)' },
                    { left: '92%', delay: '0.3s',  size: 7,  color: 'rgba(29,95,85,0.14)' },
                  ].map((d, i) => (
                    <div key={i} className="bconf-dot" style={{
                      left: d.left, bottom: '-20px',
                      width: d.size, height: d.size,
                      background: d.color,
                      animationDelay: d.delay,
                      animationDuration: `${4.5 + i * 0.6}s`,
                    }}/>
                  ))}
                </div>

                <div className="bconf-hero-inner">
                  <div className="bconf-icon-wrap" style={
                    isPending   ? { background: 'rgba(255,251,230,0.85)' } :
                    isCancelled ? { background: 'rgba(255,242,242,0.85)' } : {}
                  }>
                    {(isConfirmed || isCompleted) ? (
                      <>
                        <GhostIcon/>
                        <div className="bconf-icon-badge"><CheckCircle2 size={13} color="#fff"/></div>
                      </>
                    ) : isPending ? (
                      <Loader2 size={42} color="#B7950B" style={{ animation: 'spin .9s linear infinite' }}/>
                    ) : (
                      <AlertCircle size={42} color="#D32F2F"/>
                    )}
                  </div>

                  {isConfirmed  && <><h1 className="bconf-hero-title">You're all booked! 🎉</h1><p className="bconf-hero-sub">Take a deep breath. Your path to wellness is confirmed.</p></>}
                  {isCompleted  && <><h1 className="bconf-hero-title">Session Complete</h1><p className="bconf-hero-sub">Thank you for taking this step. We hope it was helpful.</p></>}
                  {isPending    && <><h1 className="bconf-hero-title" style={{ color: '#7a5c00' }}>Payment Verifying…</h1><p className="bconf-hero-sub">We're confirming your payment. This usually takes under 30 seconds.</p></>}
                  {isCancelled  && <><h1 className="bconf-hero-title" style={{ color: '#C62828' }}>Booking Cancelled</h1><p className="bconf-hero-sub">Your payment wasn't completed. No charge has been made.</p></>}

                  <div className="bconf-booking-pill">
                    Booking ID: <strong>#{booking.id}</strong>
                  </div>
                </div>
              </section>

           

              {/* ── BODY ── */}
              <div className={`bconf-body${mounted ? ' mounted' : ''}`}>

                {/* Session Summary Card */}
                <div className="bconf-card">
                  <div className="bconf-card-head">
                    <div className="bconf-card-title"><Calendar size={16}/> Session Summary</div>
                  </div>

                  {/* Therapist */}
                  <div className="bconf-therapist-row">
                    <img
                      src={tImg}
                      alt={tName}
                      className="bconf-therapist-img"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(tName)}&background=D6F0EC&color=1D5F55&size=80&bold=true`;
                      }}
                    />
                    <div>
                      <div className="bconf-therapist-name">
                        {booking.therapist?.title ? `${booking.therapist.title} ` : ''}{tName}
                      </div>
                      <div className="bconf-therapist-sub">
                        {booking.therapist?.specialization || 'Licensed Therapist'}
                        {booking.therapist?.location ? ` · ${booking.therapist.location}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="bconf-grid">
                    <div className="bconf-grid-item">
                      <div className="bconf-grid-icon"><Calendar size={15}/></div>
                      <div>
                        <div className="bconf-grid-label">Date</div>
                        <div className="bconf-grid-value">{formatDate(booking.bookingDate)}</div>
                      </div>
                    </div>
                    <div className="bconf-grid-item">
                      <div className="bconf-grid-icon"><Clock size={15}/></div>
                      <div>
                        <div className="bconf-grid-label">Time</div>
                        <div className="bconf-grid-value">{formatTime(booking.startTime)}</div>
                        <div className="bconf-grid-value-sub">Until {formatTime(booking.endTime)}</div>
                      </div>
                    </div>
                    <div className="bconf-grid-item">
                      <div className="bconf-grid-icon">
                        {booking.sessionFormat?.toLowerCase().includes('video') ? <Video size={15}/> :
                         booking.sessionFormat?.toLowerCase().includes('phone') ? <Phone size={15}/> :
                         <Chat size={15}/>}
                      </div>
                      <div>
                        <div className="bconf-grid-label">Format</div>
                        <div className="bconf-grid-value">{booking.sessionFormat || 'Video Consultation'}</div>
                        <div className="bconf-grid-value-sub">{booking.appointmentType || 'Initial Session'}</div>
                      </div>
                    </div>
                    <div className="bconf-grid-item">
                      <div className="bconf-grid-icon"><CheckCircle2 size={15}/></div>
                      <div>
                        <div className="bconf-grid-label">Status</div>
                        <div className="bconf-grid-value">
                          <span className={`bconf-status-badge ${booking.status.toLowerCase()}`}>
                            {booking.status === 'CONFIRMED' && <CheckCircle2 size={10}/>}
                            {booking.status === 'PENDING'   && <Clock size={10}/>}
                            {booking.status === 'CANCELLED' && <AlertCircle size={10}/>}
                            {statusLabel[booking.status] ?? booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="bconf-cost-row">
                    <div className="bconf-cost-label"><Shield size={14}/> Total Paid</div>
                    <div className="bconf-cost-amount">LKR {(Number(booking.totalCost) || 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* Info note */}
                {isConfirmed && (
                  <div className="bconf-info-box">
                    <Mail size={15}/>
                    <div className="bconf-info-text">
                      A confirmation email with your Google Meet link has been sent to <strong>{booking.client?.email}</strong>. Both you and your therapist have been notified.
                    </div>
                  </div>
                )}

                {/* Google Meet */}
                {booking.googleMeetUrl && (isConfirmed || isCompleted) && (
                  <a href={booking.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="bconf-meet-btn" style={{ marginBottom: 18 }}>
                    <Video size={17}/> Join Google Meet Session <ExternalLink size={13}/>
                  </a>
                )}

                {/* Client notes */}
                {booking.clientNotes && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#7A9E97', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 8 }}>Your Notes</div>
                    <div className="bconf-notes-box">"{booking.clientNotes}"</div>
                  </div>
                )}

                {/* Actions */}
                <div className="bconf-actions">
                  <button className="bconf-action-btn primary" onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard size={14}/> My Dashboard
                  </button>
                  {isConfirmed && (
                    <button className="bconf-action-btn secondary-green" onClick={() => downloadCalendar(booking)}>
                      <Download size={14}/> Add to Calendar
                    </button>
                  )}
                  <button className="bconf-action-btn outline" onClick={() => navigate('/find-therapist')}>
                    <Home size={14}/> Find Therapist
                  </button>
                  {isConfirmed && (
                    <button className="bconf-action-btn outline" onClick={() => {
                      const text = `Just booked a session with ${tName} on ${formatDate(booking.bookingDate)} via CareBridge 🌿`;
                      if (navigator.share) navigator.share({ text });
                      else navigator.clipboard?.writeText(text);
                    }}>
                      <Share2 size={14}/> Share
                    </button>
                  )}
                  {(isCancelled || (isPending && !pollActive)) && (
                    <button className="bconf-action-btn danger" onClick={() => navigate(`/therapists/profile/${booking.therapist?.id}`)}>
                      <RefreshCw size={14}/> Try Again
                    </button>
                  )}
                </div>

              </div>
            </>
          );
        })()}

        {/* ── FOOTER ── */}
        <footer className="cb-footer">
          <div className="cb-footer-top">
            <div>
              <div className="cb-footer-brand-name"><HeartHandshake size={20} color="#34A092"/><span>CareBridge</span></div>
              <p className="cb-footer-brand-p">Building a future where digital serenity is accessible to everyone.</p>
              <div className="cb-footer-connect">
                <div className="cb-footer-icon"><Share2 size={14} color="#7A9E97"/></div>
                <div className="cb-footer-icon"><Mail size={14} color="#7A9E97"/></div>
                <div className="cb-footer-icon"><Globe size={14} color="#7A9E97"/></div>
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