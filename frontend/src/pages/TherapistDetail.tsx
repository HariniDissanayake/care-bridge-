
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  HeartHandshake, ChevronDown, LayoutDashboard, LogOut,
  Star, MapPin, Award, Video, Phone,
  MessageSquare as Chat, CheckCircle2, ChevronRight,
  Shield, Globe, Share2, Mail, ChevronLeft,
  Send, User, Calendar, Sparkles, BookOpen
} from 'lucide-react';

interface WorkDaySchedule { dayOfWeek: string; startTime: string; endTime: string; }
interface Therapist {
  id: number; firstName: string; lastName: string; email: string; phone: string;
  title: string; specialization: string; bio: string; location: string; languages: string;
  rating: number; imageUrl: string; consultationType: string; contactMethod: string;
  isVerified: boolean; pricePerSession: number; yearsOfExperience: number;
  specialties: string[]; education: string[]; workSchedule: WorkDaySchedule[];
}
interface Review {
  id: number; comment: string; rating: number; createdAt: string;
  user: { firstName: string; lastName: string };
}

function getFullName(t: Therapist) { return `${t.firstName || ''} ${t.lastName || ''}`.trim(); }
function getModes(t: Therapist): string[] {
  if (!t.contactMethod) return [];
  if (t.contactMethod === 'BOTH') return ['video', 'chat'];
  if (t.contactMethod === 'VIDEO') return ['video'];
  if (t.contactMethod === 'CHAT') return ['chat'];
  return [];
}
function getNext7Days() {
  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return {
      label: DAY_LABELS[d.getDay()].toUpperCase(), date: d.getDate(),
      month: MONTH_LABELS[d.getMonth()],
      dayOfWeek: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][d.getDay()],
      fullDate: d,
    };
  });
}
function generateSlots(ws: WorkDaySchedule[], dayOfWeek: string): string[] {
  const entry = ws?.find(w => w.dayOfWeek?.toUpperCase() === dayOfWeek);
  if (!entry) return [];
  const slots: string[] = [];
  const [sh, sm] = entry.startTime.split(':').map(Number);
  const [eh, em] = entry.endTime.split(':').map(Number);
  let cur = sh * 60 + (sm || 0);
  const end = eh * 60 + (em || 0);
  while (cur + 60 <= end) {
    const fmt = (h: number, m: number) => `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
    slots.push(`${fmt(Math.floor(cur/60), cur%60)} – ${fmt(Math.floor((cur+60)/60), (cur+60)%60)}`);
    cur += 60;
  }
  return slots;
}
function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:'flex', gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ cursor: onChange ? 'pointer' : 'default' }}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}>
          <Star size={16} fill={(hover||value)>=i?'#F0B429':'transparent'} color={(hover||value)>=i?'#F0B429':'#C0CFC8'} />
        </span>
      ))}
    </div>
  );
}

export default function TherapistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userDrop, setUserDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const days = getNext7Days();

  useEffect(() => { const t=localStorage.getItem('token'),s=localStorage.getItem('firstname'); if(t&&s) setFirstname(s); },[]);
  useEffect(() => { const f=()=>setScrolled(window.scrollY>10); window.addEventListener('scroll',f); return ()=>window.removeEventListener('scroll',f); },[]);
  useEffect(() => {
    const h=(e:MouseEvent)=>{ if(dropRef.current&&!dropRef.current.contains(e.target as Node)) setUserDrop(false); };
    document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h);
  },[]);
  useEffect(() => {
    if(!id) return; setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE}/api/therapists/${id}`)
      .then(r=>{ if(!r.ok) throw new Error(); return r.json(); })
      .then(data=>{ setTherapist(data); setLoading(false); })
      .catch(()=>{ setError('Could not load therapist.'); setLoading(false); });
  },[id]);
  useEffect(() => {
    if(!id) return; setReviewsLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE}/api/therapists/${id}/reviews`)
      .then(r=>r.ok?r.json():[])
      .then(data=>{ setReviews(Array.isArray(data)?data:[]); setReviewsLoading(false); })
      .catch(()=>{ setReviews([]); setReviewsLoading(false); });
  },[id]);

  const handleSignOut = () => { ['token','firstname','email','role'].forEach(k=>localStorage.removeItem(k)); setFirstname(null); navigate('/'); };
  const handleBook = () => {
    if(!selectedSlot) return;
    setBooked(true);
    setTimeout(()=>setBooked(false),4000);
    navigate('/booking/checkout', { state:{ therapistId:id, selectedDay:days[selectedDay], selectedSlot } });
  };
  const handleSubmitReview = async () => {
    if(!newRating||!newComment.trim()) { setSubmitMsg({ok:false,text:'Please add a rating and comment.'}); return; }
    const token=localStorage.getItem('token');
    if(!token) { setSubmitMsg({ok:false,text:'You must be signed in to leave a review.'}); return; }
    setSubmitting(true);
    try {
      const res=await fetch(`${import.meta.env.VITE_API_BASE}/api/therapists/${id}/reviews`,{
        method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({rating:newRating,comment:newComment}),
      });
      if(!res.ok) throw new Error();
      const saved:Review=await res.json();
      setReviews(prev=>[saved,...prev]); setNewRating(0); setNewComment('');
      setSubmitMsg({ok:true,text:'Review submitted! Thank you.'});
    } catch { setSubmitMsg({ok:false,text:'Failed to submit review. Try again.'}); }
    finally { setSubmitting(false); setTimeout(()=>setSubmitMsg(null),3500); }
  };

  const slots = therapist ? generateSlots(therapist.workSchedule, days[selectedDay].dayOfWeek) : [];
  const modes = therapist ? getModes(therapist) : [];
  const avgRating = reviews.length>0 ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;min-height:100vh;overflow-x:hidden;font-family:'Plus Jakarta Sans',sans-serif;background:#EBF7F4;color:#2C3E3B;}

        /* HEADER */
        .cb-header{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0 8vw;height:80px;background:transparent;position:fixed;top:0;left:0;z-index:200;transition:all .3s ease;}
        .cb-header.scrolled{height:70px;background:#C8EAE3;backdrop-filter:blur(20px);box-shadow:0 4px 30px rgba(21,66,60,0.04);border-bottom:1px solid rgba(255,255,255,0.4);}
        .cb-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .cb-logo-icon{color:#1D5F55;}
        .cb-logo-text{color:#15423C;font-size:19px;font-weight:700;letter-spacing:-.02em;}
        .cb-nav{display:flex;gap:32px;margin-left:auto;margin-right:40px;}
        .cb-nav a{font-size:14px;color:#4A6360;font-weight:500;text-decoration:none;transition:color .2s;}
        .cb-nav a:hover{color:#1D5F55;}
        .cb-header-right{display:flex;align-items:center;gap:12px;}
        .cb-btn-primary{background:#1D5F55;color:#fff;border:none;padding:12px 24px;border-radius:12px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:all .25s;text-decoration:none;display:inline-flex;align-items:center;gap:6px;}
        .cb-btn-primary:hover{background:#15423C;transform:translateY(-1px);}
        .cb-user-menu{position:relative;}
        .cb-user-btn{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.6);border-radius:50px;padding:6px 16px 6px 6px;cursor:pointer;}
        .cb-user-btn:hover{background:rgba(255,255,255,0.8);}
        .cb-avatar{width:32px;height:32px;border-radius:50%;background:#1D5F55;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .cb-user-name{font-size:14px;font-weight:600;color:#15423C;}
        .cb-chevron{color:#15423C;transition:transform .2s;}
        .cb-chevron.open{transform:rotate(180deg);}
        .cb-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:rgba(255,255,255,0.9);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.5);border-radius:16px;box-shadow:0 10px 30px rgba(21,66,60,.08);min-width:200px;overflow:hidden;z-index:300;animation:dropIn .2s ease;}
        @keyframes dropIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
        .cb-dropdown-header{padding:16px 20px 12px;border-bottom:1px solid rgba(21,66,60,0.05);}
        .cb-dropdown-greeting{font-size:12px;color:#7A8F8B;}
        .cb-dropdown-name{font-size:15px;font-weight:700;color:#15423C;margin-top:2px;}
        .cb-dropdown-item{display:flex;align-items:center;gap:10px;padding:12px 20px;font-size:14px;color:#4A6360;cursor:pointer;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:inherit;}
        .cb-dropdown-item.dashboard{color:#1D5F55;font-weight:500;}
        .cb-dropdown-item.dashboard:hover{background:rgba(29,95,85,0.06);}
        .cb-dropdown-item.signout:hover{background:rgba(229,57,53,0.06);color:#e53935;}

        /* PAGE */
        .td-page{padding-top:80px;min-height:100vh;}

        /* HERO STRIP */
        .td-hero{background:radial-gradient(circle at 80% 20%,#D0EEE8 0%,#C8EAE3 40%,#D8F2ED 100%);padding:40px 8vw 36px;position:relative;overflow:hidden;}
        .td-hero::before{content:'';position:absolute;width:400px;height:400px;border-radius:50%;border:1px solid rgba(29,95,85,0.07);right:-60px;top:-80px;pointer-events:none;}
        .td-breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:24px;flex-wrap:wrap;}
        .td-breadcrumb a{font-size:13px;color:#536C68;text-decoration:none;transition:color .15s;}
        .td-breadcrumb a:hover{color:#1D5F55;}
        .td-breadcrumb span{font-size:13px;color:#15423C;font-weight:600;}

        /* ── REDESIGNED HERO CARD ── */
        .td-hero-card{
          background:rgba(255,255,255,0.6);
          backdrop-filter:blur(24px);
          border:1px solid rgba(255,255,255,0.85);
          border-radius:28px;
          overflow:hidden;
          box-shadow:0 12px 48px rgba(21,66,60,0.07);
          position:relative;z-index:2;
          display:flex;
          flex-direction:column;
        }
        /* Green accent bar */
        .td-card-accent{
          height:5px;
          background:linear-gradient(90deg,#1D5F55,#34A092,#5BBFB0);
        }
        .td-card-body{
          display:flex;
          gap:32px;
          align-items:flex-start;
          padding:32px 36px 30px;
          flex-wrap:wrap;
        }

        /* Photo — bigger, square with rounded corners */
        .td-hero-photo{
          width:130px;height:130px;
          border-radius:22px;
          object-fit:cover;
          flex-shrink:0;
          background:#D6F0EC;
          border:3px solid rgba(255,255,255,0.95);
          box-shadow:0 8px 28px rgba(21,66,60,0.14);
        }

        /* Info block */
        .td-hero-info{flex:1;min-width:200px;}
        .td-verified-chip{
          display:inline-flex;align-items:center;gap:5px;
          background:rgba(30,132,73,0.1);border:1px solid rgba(30,132,73,0.25);
          border-radius:100px;padding:3px 10px;
          font-size:11px;font-weight:700;color:#1E8449;
          letter-spacing:.04em;text-transform:uppercase;
          margin-bottom:10px;
        }
        /* Title line (Dr./Prof.) */
        .td-hero-title-line{
          font-size:12px;font-weight:700;color:#34A092;
          text-transform:uppercase;letter-spacing:.08em;
          margin-bottom:4px;
        }
        /* Full name — large */
        .td-hero-name{
          font-size:clamp(24px,3vw,36px);
          font-weight:800;color:#0F3330;
          letter-spacing:-.03em;line-height:1.1;
          margin-bottom:5px;
        }
        /* Specialization subtitle */
        .td-hero-spec{
          font-size:14px;color:#536C68;font-weight:500;
          margin-bottom:16px;line-height:1.5;
        }
        .td-hero-badges{display:flex;gap:8px;flex-wrap:wrap;}
        .td-badge{display:flex;align-items:center;gap:5px;font-size:12px;color:#536C68;background:rgba(255,255,255,0.65);border:1px solid rgba(255,255,255,0.9);border-radius:100px;padding:5px 12px;font-weight:500;box-shadow:0 2px 8px rgba(21,66,60,0.04);}
        .td-badge.verified{color:#1E8449;background:rgba(30,132,73,0.07);border-color:rgba(30,132,73,0.2);}

        /* Back btn */
        .td-back-btn{
          background:none;border:none;cursor:pointer;
          color:#536C68;display:flex;align-items:center;
          gap:5px;font-size:13px;font-family:inherit;
          padding:8px 0;transition:color .2s;white-space:nowrap;
        }
        .td-back-btn:hover{color:#1D5F55;}

        /* BODY LAYOUT */
        .td-body{padding:36px 8vw 80px;display:grid;grid-template-columns:1fr 360px;gap:28px;align-items:flex-start;}

        /* PANELS */
        .td-left{display:flex;flex-direction:column;gap:22px;}
        .td-panel{background:rgba(255,255,255,0.55);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.75);border-radius:24px;padding:28px;box-shadow:0 4px 16px rgba(21,66,60,0.03);}
        .td-panel-title{font-size:17px;font-weight:700;color:#15423C;margin-bottom:18px;display:flex;align-items:center;gap:9px;}
        .td-bio-text{font-size:14px;color:#536C68;line-height:1.8;}
        .td-two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
        .td-spec-title{font-size:13px;font-weight:700;color:#15423C;margin-bottom:12px;display:flex;align-items:center;gap:7px;}
        .td-spec-list{list-style:none;display:flex;flex-direction:column;gap:8px;}
        .td-spec-list li{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:#536C68;line-height:1.5;}
        .td-spec-dot{width:6px;height:6px;border-radius:50%;background:#1D5F55;flex-shrink:0;margin-top:6px;}

        /* REVIEWS */
        .td-reviews-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px;}
        .td-reviews-avg{display:flex;align-items:center;gap:10px;}
        .td-avg-num{font-size:32px;font-weight:800;color:#15423C;letter-spacing:-.03em;}
        .td-avg-meta{display:flex;flex-direction:column;gap:3px;}
        .td-review-count{font-size:12px;color:#7A9E97;}
        .td-review-list{display:flex;flex-direction:column;gap:14px;margin-bottom:24px;}
        .td-review-item{background:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.85);border-radius:16px;padding:18px 20px;}
        .td-review-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;}
        .td-reviewer{display:flex;align-items:center;gap:9px;}
        .td-reviewer-avatar{width:32px;height:32px;border-radius:50%;background:#1D5F55;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .td-reviewer-name{font-size:13px;font-weight:700;color:#15423C;}
        .td-reviewer-date{font-size:11px;color:#7A9E97;}
        .td-review-comment{font-size:13px;color:#536C68;line-height:1.7;font-style:italic;}
        .td-review-empty{text-align:center;padding:28px;color:#7A9E97;font-size:13px;}

        /* WRITE REVIEW */
        .td-write-review{border-top:1px solid rgba(21,66,60,0.07);padding-top:22px;}
        .td-write-title{font-size:15px;font-weight:700;color:#15423C;margin-bottom:14px;}
        .td-rating-row{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
        .td-rating-label{font-size:13px;color:#536C68;font-weight:500;}
        .td-textarea{width:100%;padding:14px 16px;border-radius:14px;border:1px solid rgba(21,66,60,0.12);background:rgba(255,255,255,0.6);font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#15423C;resize:vertical;min-height:100px;outline:none;transition:border-color .2s;line-height:1.6;margin-bottom:12px;}
        .td-textarea:focus{border-color:rgba(29,95,85,0.3);background:rgba(255,255,255,0.8);}
        .td-textarea::placeholder{color:#7A9E97;}
        .td-submit-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;}
        .td-submit-btn{background:#1D5F55;color:#fff;border:none;border-radius:12px;padding:12px 24px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .2s;}
        .td-submit-btn:hover:not(:disabled){background:#15423C;transform:translateY(-1px);}
        .td-submit-btn:disabled{opacity:.5;cursor:not-allowed;}
        .td-submit-msg{font-size:13px;font-weight:500;padding:8px 14px;border-radius:10px;}
        .td-submit-msg.ok{color:#1E8449;background:rgba(30,132,73,0.08);}
        .td-submit-msg.err{color:#D32F2F;background:rgba(211,47,47,0.08);}

        /* BOOKING PANEL */
        .td-book-panel{background:rgba(255,255,255,0.6);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.85);border-radius:24px;padding:28px;box-shadow:0 10px 40px rgba(21,66,60,0.05);position:sticky;top:96px;overflow:hidden;}
        .td-book-panel::before{content:'';display:block;height:4px;background:linear-gradient(90deg,#1D5F55,#34A092);margin:-28px -28px 24px -28px;}
        .td-book-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px;}
        .td-book-title{font-size:18px;font-weight:700;color:#15423C;}
        .td-book-price{text-align:right;}
        .td-price-num{font-size:28px;font-weight:800;color:#0F3330;letter-spacing:-.03em;}
        .td-price-sub{font-size:11px;color:#7A9E97;display:block;margin-top:1px;}
        .td-section-label{font-size:11px;font-weight:700;color:#1D5F55;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;}
        .td-day-row{display:flex;gap:8px;margin-bottom:22px;overflow-x:auto;padding-bottom:4px;}
        .td-day-row::-webkit-scrollbar{height:3px;}
        .td-day-row::-webkit-scrollbar-thumb{background:rgba(29,95,85,0.2);border-radius:2px;}
        .td-day-chip{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 14px;border-radius:14px;border:1.5px solid rgba(21,66,60,0.1);background:rgba(255,255,255,0.55);cursor:pointer;transition:all .18s;min-width:52px;}
        .td-day-chip:hover{border-color:#1D5F55;}
        .td-day-chip.active{background:#1D5F55;border-color:#1D5F55;}
        .td-day-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#7A9E97;}
        .td-day-chip.active .td-day-label{color:rgba(255,255,255,0.7);}
        .td-day-num{font-size:16px;font-weight:700;color:#15423C;}
        .td-day-chip.active .td-day-num{color:#fff;}
        .td-slots{display:flex;flex-direction:column;gap:7px;margin-bottom:22px;max-height:200px;overflow-y:auto;}
        .td-slots::-webkit-scrollbar{width:3px;}
        .td-slots::-webkit-scrollbar-thumb{background:rgba(29,95,85,0.2);border-radius:2px;}
        .td-slot{padding:11px 16px;border-radius:12px;border:1.5px solid rgba(21,66,60,0.1);background:rgba(255,255,255,0.55);font-family:inherit;font-size:13px;font-weight:500;color:#2C3E3B;cursor:pointer;text-align:left;transition:all .18s;display:flex;align-items:center;justify-content:space-between;}
        .td-slot:hover{border-color:#1D5F55;background:rgba(29,95,85,0.04);}
        .td-slot.active{border-color:#1D5F55;background:rgba(29,95,85,0.08);color:#15423C;font-weight:600;}
        .td-no-slots{text-align:center;padding:20px;color:#7A9E97;font-size:13px;background:rgba(21,66,60,0.03);border-radius:12px;}
        .td-reserve-btn{width:100%;background:#1D5F55;color:#fff;border:none;border-radius:14px;padding:15px;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:all .22s;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 6px 20px rgba(21,66,60,.18);margin-bottom:12px;}
        .td-reserve-btn:hover:not(:disabled){background:#15423C;transform:translateY(-2px);box-shadow:0 10px 28px rgba(21,66,60,.24);}
        .td-reserve-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}
        .td-reserve-btn.booked{background:#1E8449;}
        .td-cancel-note{text-align:center;font-size:12px;color:#7A9E97;display:flex;align-items:center;justify-content:center;gap:5px;margin-bottom:16px;}
        .td-mode-row{display:flex;gap:7px;margin-top:14px;flex-wrap:wrap;}
        .td-mode-chip{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:100px;background:rgba(29,95,85,0.07);border:1px solid rgba(29,95,85,0.1);font-size:11.5px;font-weight:600;color:#1D5F55;}
        .td-info-box{background:rgba(29,95,85,0.05);border:1px solid rgba(29,95,85,0.1);border-radius:14px;padding:14px 16px;display:flex;gap:10px;align-items:flex-start;margin-top:14px;}
        .td-info-text{font-size:12px;color:#536C68;line-height:1.6;}
        .td-info-text strong{color:#15423C;}

        /* STATES */
        .td-center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:14px;text-align:center;padding:40px;}
        .td-spinner{width:40px;height:40px;border:3px solid rgba(29,95,85,0.15);border-top-color:#1D5F55;border-radius:50%;animation:spin .8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* TOAST */
        .td-toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#15423C;color:#fff;border-radius:16px;padding:16px 28px;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:500;z-index:1000;box-shadow:0 16px 40px rgba(21,66,60,0.2);animation:toastIn .3s ease;}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(16px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

        /* FOOTER */
        .cb-footer{width:100%;background:#0c0c0c;padding:80px 8vw 32px;border-top:1px solid rgba(255,255,255,0.05);}
        .cb-footer-top{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:56px;margin-bottom:64px;}
        .cb-footer-brand-name{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
        .cb-footer-brand-name span{color:#fff;font-size:18px;font-weight:700;}
        .cb-footer-brand-p{font-size:14px;color:#7A9E97;line-height:1.7;max-width:260px;}
        .cb-footer-col h4{font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:20px;}
        .cb-footer-col a{display:block;font-size:14px;color:#7A9E97;margin-bottom:12px;text-decoration:none;transition:color .2s;}
        .cb-footer-col a:hover{color:#AEE4DB;}
        .cb-footer-connect{display:flex;gap:12px;margin-top:20px;}
        .cb-footer-icon{width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
        .cb-footer-icon:hover{background:rgba(52,160,146,0.15);}
        .cb-footer-bottom{border-top:1px solid rgba(255,255,255,0.05);padding-top:28px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;font-size:13px;color:#4E6E68;}
        .cb-footer-links{display:flex;gap:20px;}
        .cb-footer-links a{color:#4E6E68;text-decoration:none;transition:color .2s;}

        /* RESPONSIVE */
        @media(max-width:1024px){.td-body{grid-template-columns:1fr;}.td-book-panel{position:static;}}
        @media(max-width:768px){.cb-nav{display:none;}.td-two-col{grid-template-columns:1fr;}.cb-footer-top{grid-template-columns:1fr;gap:32px;}}
        @media(max-width:520px){.td-card-body{padding:24px 20px 22px;}.td-hero-photo{width:100px;height:100px;}}
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

      <div className="td-page">

        {loading && (
          <div className="td-center">
            <div className="td-spinner" />
            <p style={{ color:'#536C68', fontSize:14 }}>Loading therapist profile…</p>
          </div>
        )}

        {!loading && error && (
          <div className="td-center">
            <p style={{ fontSize:18, fontWeight:700, color:'#15423C' }}>Profile not found</p>
            <p style={{ fontSize:13, color:'#536C68' }}>{error}</p>
            <button className="cb-btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
          </div>
        )}

        {!loading && !error && therapist && (() => {
          const fullName = getFullName(therapist);
          return (
            <>
              {/* HERO */}
              <section className="td-hero">
                <div className="td-breadcrumb">
                  <Link to="/">Home</Link>
                  <ChevronRight size={13} color="#7A9E97" />
                  <Link to="/find-therapist">Find a Therapist</Link>
                  <ChevronRight size={13} color="#7A9E97" />
                  <span>{fullName}</span>
                </div>

                {/* ── REDESIGNED PROFILE BOX ── */}
                <div className="td-hero-card">
                  <div className="td-card-accent" />
                  <div className="td-card-body">

                    {/* Photo */}
                    <img
                      src={therapist.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=D6F0EC&color=1D5F55&size=130&bold=true`}
                      alt={fullName}
                      className="td-hero-photo"
                      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=D6F0EC&color=1D5F55&size=130&bold=true`; }}
                    />

                    {/* Info */}
                    <div className="td-hero-info">
                      {therapist.isVerified && (
                        <div className="td-verified-chip">
                          <Shield size={10} /> Verified Therapist
                        </div>
                      )}

                      {/* Title (Dr. / Prof.) */}
                      {therapist.title && (
                        <div className="td-hero-title-line">{therapist.title}</div>
                      )}

                      {/* Full name */}
                      <div className="td-hero-name">{fullName}</div>

                      {/* Specialization */}
                      {therapist.specialization && (
                        <div className="td-hero-spec">{therapist.specialization}</div>
                      )}

                      {/* Badges row */}
                      <div className="td-hero-badges">
                        {therapist.yearsOfExperience > 0 && (
                          <div className="td-badge"><Award size={12} /> {therapist.yearsOfExperience}+ yrs exp.</div>
                        )}
                        {therapist.languages && (
                          <div className="td-badge"><Globe size={12} /> {therapist.languages}</div>
                        )}
                        {therapist.location && (
                          <div className="td-badge"><MapPin size={12} /> {therapist.location}</div>
                        )}
                        {therapist.rating > 0 && (
                          <div className="td-badge"><Star size={12} fill="#F0B429" color="#F0B429" /> {therapist.rating.toFixed(1)}</div>
                        )}
                      </div>
                    </div>

                    {/* Back button */}
                    <button className="td-back-btn" onClick={() => navigate(-1)}>
                      <ChevronLeft size={15} /> Back
                    </button>
                  </div>
                </div>
              </section>

              {/* BODY */}
              <div className="td-body">

                {/* LEFT COLUMN */}
                <div className="td-left">

                  {therapist.bio && (
                    <div className="td-panel">
                      <div className="td-panel-title"><BookOpen size={18} color="#1D5F55" /> About {therapist.firstName}</div>
                      <p className="td-bio-text">{therapist.bio}</p>
                    </div>
                  )}

                  {(therapist.specialties?.length > 0 || therapist.education?.length > 0) && (
                    <div className="td-panel">
                      <div className="td-two-col">
                        {therapist.specialties?.length > 0 && (
                          <div>
                            <div className="td-spec-title"><Sparkles size={14} color="#1D5F55" /> Specialties</div>
                            <ul className="td-spec-list">
                              {therapist.specialties.map((s,i) => <li key={i}><div className="td-spec-dot"/>{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {therapist.education?.length > 0 && (
                          <div>
                            <div className="td-spec-title"><Award size={14} color="#1D5F55" /> Education</div>
                            <ul className="td-spec-list">
                              {therapist.education.map((e,i) => <li key={i}><div className="td-spec-dot"/>{e}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  <div className="td-panel">
                    <div className="td-reviews-header">
                      <div className="td-panel-title" style={{ margin:0 }}>
                        <Star size={18} color="#F0B429" fill="#F0B429" /> Patient Reviews
                      </div>
                      {avgRating && (
                        <div className="td-reviews-avg">
                          <span className="td-avg-num">{avgRating}</span>
                          <div className="td-avg-meta">
                            <StarRating value={Math.round(Number(avgRating))} />
                            <span className="td-review-count">{reviews.length} review{reviews.length!==1?'s':''}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {reviewsLoading ? (
                      <div className="td-review-empty">Loading reviews…</div>
                    ) : reviews.length === 0 ? (
                      <div className="td-review-empty">No reviews yet. Be the first to share your experience!</div>
                    ) : (
                      <div className="td-review-list">
                        {reviews.map(r => {
                          const rName = `${r.user?.firstName||''} ${r.user?.lastName||''}`.trim()||'Anonymous';
                          const initials = rName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
                          const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
                          return (
                            <div key={r.id} className="td-review-item">
                              <div className="td-review-top">
                                <div className="td-reviewer">
                                  <div className="td-reviewer-avatar">{initials||<User size={13}/>}</div>
                                  <div>
                                    <div className="td-reviewer-name">{rName}</div>
                                    {date && <div className="td-reviewer-date">{date}</div>}
                                  </div>
                                </div>
                                <StarRating value={r.rating} />
                              </div>
                              <p className="td-review-comment">"{r.comment}"</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="td-write-review">
                      <div className="td-write-title">Write a Review</div>
                      <div className="td-rating-row">
                        <span className="td-rating-label">Your rating:</span>
                        <StarRating value={newRating} onChange={setNewRating} />
                      </div>
                      <textarea className="td-textarea" placeholder="Share your experience with this therapist…" value={newComment} onChange={e=>setNewComment(e.target.value)} />
                      <div className="td-submit-row">
                        <button className="td-submit-btn" onClick={handleSubmitReview} disabled={submitting}>
                          <Send size={14} />{submitting?'Submitting…':'Submit Review'}
                        </button>
                        {submitMsg && (
                          <div className={`td-submit-msg ${submitMsg.ok?'ok':'err'}`}>{submitMsg.text}</div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT — BOOKING PANEL */}
                <div className="td-book-panel">
                  <div className="td-book-header">
                    <div className="td-book-title">Book a Session</div>
                    <div className="td-book-price">
                      {therapist.pricePerSession > 0 ? (
                        <>
                          <span className="td-price-num">RS {therapist.pricePerSession.toLocaleString()}</span>
                          <span className="td-price-sub">per session</span>
                        </>
                      ) : (
                        <span style={{ fontSize:13, color:'#7A9E97' }}>Price on request</span>
                      )}
                    </div>
                  </div>

                  {therapist.consultationType && (
                    <div style={{ fontSize:12, color:'#7A9E97', marginBottom:18 }}>{therapist.consultationType}</div>
                  )}

                  <div className="td-section-label">Select Date</div>
                  <div className="td-day-row">
                    {days.map((d,i) => {
                      const hasSlots = generateSlots(therapist.workSchedule, d.dayOfWeek).length > 0;
                      return (
                        <div key={i} className={`td-day-chip${selectedDay===i?' active':''}`}
                          style={{ opacity: hasSlots?1:0.4 }}
                          onClick={() => { if(hasSlots){ setSelectedDay(i); setSelectedSlot(null); } }}>
                          <span className="td-day-label">{d.label}</span>
                          <span className="td-day-num">{d.date}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="td-section-label">Available Slots</div>
                  {slots.length === 0 ? (
                    <div className="td-no-slots">No availability on this day</div>
                  ) : (
                    <div className="td-slots">
                      {slots.map(slot => (
                        <button key={slot} className={`td-slot${selectedSlot===slot?' active':''}`} onClick={() => setSelectedSlot(slot)}>
                          {slot}
                          {selectedSlot===slot && <CheckCircle2 size={14} color="#1D5F55" />}
                        </button>
                      ))}
                    </div>
                  )}

                  <button className={`td-reserve-btn${booked?' booked':''}`} disabled={!selectedSlot||booked} onClick={handleBook}>
                    {booked ? <><CheckCircle2 size={17}/> Session Requested!</> : <><Calendar size={17}/> Reserve My Session</>}
                  </button>

                  <div className="td-cancel-note">
                    <Shield size={12} color="#7A9E97" /> Free cancellation up to 24h before
                  </div>

                  {/* Session modes — display only, no filter */}
                  {modes.length > 0 && (
                    <div className="td-mode-row">
                      {modes.includes('video') && <div className="td-mode-chip"><Video size={12}/>Video</div>}
                      {modes.includes('phone') && <div className="td-mode-chip"><Phone size={12}/>Phone</div>}
                      {modes.includes('chat')  && <div className="td-mode-chip"><Chat  size={12}/>Chat</div>}
                    </div>
                  )}

                  <div className="td-info-box">
                    <Shield size={15} color="#1D5F55" style={{ flexShrink:0, marginTop:1 }} />
                    <div className="td-info-text">
                      <strong>Sessions available online & in-person.</strong> Contact the therapist directly to confirm your preferred format and payment method.
                    </div>
                  </div>
                </div>

              </div>
            </>
          );
        })()}

        {/* FOOTER */}
        <footer className="cb-footer">
          <div className="cb-footer-top">
            <div>
              <div className="cb-footer-brand-name"><HeartHandshake size={20} color="#34A092"/><span>CareBridge</span></div>
              <p className="cb-footer-brand-p">Building a future where digital serenity is accessible to everyone.</p>
              <div className="cb-footer-connect">
                <div className="cb-footer-icon"><Share2 size={15} color="#7A9E97"/></div>
                <div className="cb-footer-icon"><Mail size={15} color="#7A9E97"/></div>
                <div className="cb-footer-icon"><Globe size={15} color="#7A9E97"/></div>
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

      {booked && (
        <div className="td-toast">
          <CheckCircle2 size={18} color="#AEE4DB"/>
          Session requested for {days[selectedDay].label} {days[selectedDay].date} · {selectedSlot}
        </div>
      )}
    </>
  );
}
