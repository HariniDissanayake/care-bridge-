import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HeartHandshake, ChevronDown, LayoutDashboard, LogOut,
  ChevronRight, Video, Phone, MessageSquare as Chat,
  Calendar, Clock, Shield, CreditCard,
  User, Mail, FileText, CheckCircle2, AlertCircle,
  Loader2, Share2, Globe, Lock, Award, MapPin, Star
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface BookingState {
  therapistId: number;
  therapistName?: string;
  therapistTitle?: string;
  therapistImage?: string;
  therapistSpecialization?: string;
  therapistLocation?: string;
  therapistRating?: number;
  therapistExperience?: number;
  therapistLanguages?: string;
  pricePerSession?: number;
  selectedDate?: string;
  selectedDateLabel?: string;
  selectedSlot?: string;
  startTime?: string;
  endTime?: string;
  selectedDay?: {
    label?: string;
    month?: string;
    date?: number;
    fullDate?: string | Date;
    dayOfWeek?: string;
  };
}

interface PayhereParams {
  merchant_id: string; order_id: string; items: string;
  currency: string; amount: string; hash: string;
  first_name: string; last_name: string; email: string; phone: string;
  [key: string]: string;
}

interface BookingResponse {
  bookingId: number; status: string; totalCost: number;
  payhereParams: PayhereParams;
}

interface TherapistDetails {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  specialization: string;
  location: string;
  languages: string;
  rating: number;
  imageUrl: string;
  pricePerSession: number;
  yearsOfExperience: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function toIsoDate(value: string | Date | undefined): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().split('T')[0];
  const parsed = Date.parse(value as string);
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString().split('T')[0];
  return String(value);
}

function formatSelectedDay(selectedDay: any): { selectedDate: string; selectedDateLabel: string } {
  if (!selectedDay) return { selectedDate: '', selectedDateLabel: '' };
  if (typeof selectedDay === 'string') {
    return { selectedDate: selectedDay, selectedDateLabel: selectedDay };
  }
  const label = selectedDay.label ? String(selectedDay.label) : '';
  const month = selectedDay.month ? String(selectedDay.month) : '';
  const date  = selectedDay.date  != null ? String(selectedDay.date) : '';
  const selectedDateLabel = label && month && date ? `${label}, ${month} ${date}` : String(selectedDay);
  const selectedDate = selectedDay.fullDate ? toIsoDate(selectedDay.fullDate) : selectedDateLabel;
  return { selectedDate, selectedDateLabel };
}

function parseSlotTimes(slot: string | undefined): { startTime: string; endTime: string } {
  const parts = String(slot || '').split('–').map(s => s.trim());
  return { startTime: parts[0] || '', endTime: parts[1] || '' };
}

function safeAvatarUrl(name: string, size: number): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D6F0EC&color=1D5F55&size=${size}&bold=true`;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function BookingCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const raw      = location.state as Partial<BookingState> | null;

  const selectedDayInfo = formatSelectedDay(raw?.selectedDay || raw?.selectedDateLabel || raw?.selectedDate);
  const selectedSlot    = raw?.selectedSlot || '';
  const slotTimes       = parseSlotTimes(raw?.selectedSlot);

  const booking: BookingState | null = raw && raw.therapistId ? {
    therapistId:             Number(raw.therapistId)         || 0,
    therapistName:           raw.therapistName               || '',
    therapistTitle:          raw.therapistTitle              || '',
    therapistImage:          raw.therapistImage              || '',
    therapistSpecialization: raw.therapistSpecialization     || '',
    therapistLocation:       raw.therapistLocation           || '',
    therapistRating:         Number(raw.therapistRating)     || 0,
    therapistExperience:     Number(raw.therapistExperience) || 0,
    therapistLanguages:      raw.therapistLanguages          || '',
    pricePerSession:         Number(raw.pricePerSession)     || 0,
    selectedDate:            selectedDayInfo.selectedDate,
    selectedDateLabel:       selectedDayInfo.selectedDateLabel,
    selectedSlot,
    startTime:               raw?.startTime || slotTimes.startTime,
    endTime:                 raw?.endTime   || slotTimes.endTime,
    selectedDay:             raw?.selectedDay,
  } : null;

  const [therapistDetails, setTherapistDetails] = useState<TherapistDetails | null>(null);
  const [firstname, setFirstname] = useState('');
  const [lastname,  setLastname]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [scrolled,  setScrolled]  = useState(false);
  const [userDrop,  setUserDrop]  = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [sessionFormat,   setSessionFormat]   = useState('Video Consultation');
  const [appointmentType, setAppointmentType] = useState('Initial Intake Session');
  const [clientNotes,     setClientNotes]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }
    setFirstname(localStorage.getItem('firstname') || '');
    setLastname( localStorage.getItem('lastname')  || '');
    setEmail(    localStorage.getItem('email')     || '');
  }, [navigate]);

  useEffect(() => {
    if (!booking?.therapistId) return;
    fetch(`${import.meta.env.VITE_API_BASE}/api/therapists/${booking.therapistId}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: TherapistDetails) => setTherapistDetails(data))
      .catch(() => setTherapistDetails(null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.therapistId]);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

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

  const price                   = therapistDetails?.pricePerSession      ?? booking?.pricePerSession     ?? 0;
  const totalCost               = price;
  const therapistName           = therapistDetails
    ? `${therapistDetails.firstName} ${therapistDetails.lastName}`.trim()
    : booking?.therapistName || 'Your Therapist';
  const therapistTitle          = therapistDetails?.title            || booking?.therapistTitle          || 'Therapist';
  const therapistSpecialization = therapistDetails?.specialization   || booking?.therapistSpecialization || '';
  const therapistLocation       = therapistDetails?.location         || booking?.therapistLocation       || '';
  const therapistRating         = therapistDetails?.rating           ?? booking?.therapistRating         ?? 0;
  const therapistExperience     = therapistDetails?.yearsOfExperience ?? booking?.therapistExperience   ?? 0;
  const therapistLanguages      = therapistDetails?.languages        || booking?.therapistLanguages      || '';

  // ─── HANDLE PROCEED ─────────────────────────────────────────────────────────
  const handleProceed = async () => {
    if (!phone.trim()) { setError('Please enter your phone number to continue.'); return; }
    if (!booking)      { setError('Booking details missing. Please go back and select a slot.'); return; }

    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/bookings/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          therapistId:    booking.therapistId,
          bookingDate:    booking.selectedDate,
          startTime:      booking.startTime,
          endTime:        booking.endTime,
          sessionFormat,
          appointmentType,
          clientNotes,
          phone,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Server error ${res.status}`);
      }

      const data: BookingResponse = await res.json();
      const p = data.payhereParams;

      const payhere = (window as any).payhere;
      if (!payhere) {
        throw new Error('PayHere SDK not loaded. Please refresh the page and try again.');
      }

      // Manually confirm booking — webhook cannot reach localhost
      payhere.onCompleted = async (orderId: string) => {
        console.log('Payment completed. OrderID:', orderId);
        try {
          await fetch(`${import.meta.env.VITE_API_BASE}/api/bookings/${data.bookingId}/confirm`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          console.warn('Manual confirm failed, navigating anyway:', e);
        }
        navigate(`/booking/confirmation/${data.bookingId}`);
      };

      payhere.onDismissed = () => {
        setError('Payment was cancelled. You can try again.');
        setSubmitting(false);
      };

      payhere.onError = (err: string) => {
        setError('Payment failed: ' + err);
        setSubmitting(false);
      };

      const payment = {
        sandbox:     true,
        merchant_id: (p.merchant_id || p.merchantId || '').trim(),
        return_url:  `${window.location.origin}/booking/confirmation/${data.bookingId}`,
        cancel_url:  `${window.location.origin}/booking/cancelled`,
        notify_url:  'https://tint-untoasted-foothill.ngrok-free.dev/api/bookings/payhere-notify',
        order_id:    p.order_id || p.orderId,
        items:       p.items,
        amount:      p.amount,
        currency:    p.currency || 'LKR',
        hash:        p.hash,
        first_name:  (p.first_name || p.firstName || '').trim(),
        last_name:   (p.last_name  || p.lastName  || '').trim(),
        email:       p.email,
        phone:       p.phone,
        address:     'N/A',
        city:        'Colombo',
        country:     'Sri Lanka',
      };

      payhere.startPayment(payment);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (!booking) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#EBF7F4', fontFamily:"'Plus Jakarta Sans',sans-serif", gap:16, padding:24 }}>
        <AlertCircle size={44} color="#D32F2F" />
        <p style={{ fontSize:18, fontWeight:700, color:'#15423C', textAlign:'center' }}>No booking details found</p>
        <p style={{ fontSize:13, color:'#536C68', textAlign:'center', maxWidth:320 }}>
          Please go back to a therapist's profile, select a date and time slot, then click Reserve My Session.
        </p>
        <button onClick={() => navigate('/find-therapist')}
          style={{ background:'#1D5F55', color:'#fff', border:'none', borderRadius:12, padding:'12px 28px', fontFamily:'inherit', fontSize:14, fontWeight:700, cursor:'pointer', marginTop:8 }}>
          Find a Therapist
        </button>
      </div>
    );
  }

  const name              = therapistName;
  const title             = therapistTitle;
  const therapistImgSrc   = safeAvatarUrl(name, 84);
  const therapistImgSrcSm = safeAvatarUrl(name, 54);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;min-height:100vh;overflow-x:hidden;font-family:'Plus Jakarta Sans',sans-serif;background:#EBF7F4;color:#2C3E3B;}

        .cb-header{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0 8vw;height:80px;background:transparent;position:fixed;top:0;left:0;z-index:200;transition:all .3s;}
        .cb-header.scrolled{height:70px;background:#C8EAE3;backdrop-filter:blur(20px);box-shadow:0 4px 30px rgba(21,66,60,0.04);border-bottom:1px solid rgba(255,255,255,0.4);}
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

        .bc-page{padding-top:80px;min-height:100vh;}

        .bc-progress-strip{background:rgba(255,255,255,0.5);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.6);padding:0 8vw;}
        .bc-progress-inner{display:flex;align-items:center;max-width:760px;padding:18px 0;}
        .bc-step{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#7A9E97;flex-shrink:0;}
        .bc-step.done{color:#1E8449;}
        .bc-step.active{color:#15423C;}
        .bc-step-num{width:26px;height:26px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;transition:all .3s;}
        .bc-step.done .bc-step-num{background:#1E8449;border-color:#1E8449;color:#fff;}
        .bc-step.active .bc-step-num{background:#15423C;border-color:#15423C;color:#fff;}
        .bc-step-line{flex:1;height:2px;background:rgba(29,95,85,0.1);margin:0 12px;}
        .bc-step-line.done{background:rgba(30,132,73,0.35);}

        .bc-hero{background:radial-gradient(circle at 80% 20%,#D0EEE8 0%,#C8EAE3 40%,#D8F2ED 100%);padding:36px 8vw 32px;position:relative;overflow:hidden;}
        .bc-hero::before{content:'';position:absolute;width:400px;height:400px;border-radius:50%;border:1px solid rgba(29,95,85,0.07);right:-60px;top:-80px;pointer-events:none;}
        .bc-breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:20px;flex-wrap:wrap;position:relative;z-index:2;}
        .bc-breadcrumb a,.bc-breadcrumb span{font-size:13px;color:#536C68;text-decoration:none;cursor:pointer;transition:color .15s;}
        .bc-breadcrumb a:hover{color:#1D5F55;}
        .bc-breadcrumb strong{color:#15423C;font-size:13px;font-weight:600;}
        .bc-hero-title{font-size:clamp(26px,3vw,40px);font-weight:800;color:#15423C;letter-spacing:-.025em;position:relative;z-index:2;margin-bottom:6px;}
        .bc-hero-sub{font-size:14px;color:#536C68;position:relative;z-index:2;}

        .bc-body{padding:36px 8vw 80px;display:grid;grid-template-columns:1fr 390px;gap:28px;align-items:flex-start;opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease;}
        .bc-body.mounted{opacity:1;transform:translateY(0);}

        .bc-panel{background:rgba(255,255,255,0.5);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.75);border-radius:24px;padding:28px;box-shadow:0 4px 20px rgba(21,66,60,0.03);margin-bottom:20px;}
        .bc-panel:last-child{margin-bottom:0;}
        .bc-panel-title{font-size:16px;font-weight:700;color:#15423C;margin-bottom:20px;display:flex;align-items:center;gap:9px;padding-bottom:16px;border-bottom:1px solid rgba(21,66,60,0.06);}
        .bc-panel-title svg{color:#1D5F55;}

        .bc-therapist-card{display:flex;gap:18px;align-items:flex-start;}
        .bc-therapist-img{width:84px;height:84px;border-radius:20px;object-fit:cover;background:#D6F0EC;flex-shrink:0;border:2px solid rgba(255,255,255,0.85);box-shadow:0 4px 16px rgba(21,66,60,0.1);}
        .bc-therapist-info{flex:1;}
        .bc-therapist-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(30,132,73,0.08);border:1px solid rgba(30,132,73,0.2);border-radius:100px;padding:3px 10px;font-size:11px;font-weight:700;color:#1E8449;margin-bottom:7px;}
        .bc-therapist-name{font-size:20px;font-weight:800;color:#15423C;letter-spacing:-.02em;margin-bottom:3px;}
        .bc-therapist-sub{font-size:13px;color:#536C68;margin-bottom:10px;}
        .bc-therapist-meta{display:flex;gap:12px;flex-wrap:wrap;}
        .bc-therapist-meta-item{display:flex;align-items:center;gap:5px;font-size:12px;color:#7A9E97;font-weight:500;}
        .bc-therapist-meta-item svg{color:#1D5F55;}

        .bc-slot-box{display:flex;align-items:center;gap:12px;background:rgba(29,95,85,0.05);border:1px solid rgba(29,95,85,0.12);border-radius:16px;padding:15px 20px;margin-top:18px;flex-wrap:wrap;}
        .bc-slot-item{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:700;color:#15423C;}
        .bc-slot-item svg{color:#1D5F55;}
        .bc-slot-divider{width:1px;height:20px;background:rgba(21,66,60,0.12);flex-shrink:0;}
        .bc-change-btn{margin-left:auto;font-size:12px;font-weight:700;color:#1D5F55;background:rgba(29,95,85,0.08);border:1px solid rgba(29,95,85,0.15);border-radius:8px;padding:6px 14px;cursor:pointer;font-family:inherit;transition:all .18s;flex-shrink:0;}
        .bc-change-btn:hover{background:rgba(29,95,85,0.14);}

        .bc-user-card{display:flex;align-items:center;gap:14px;background:rgba(29,95,85,0.04);border:1px solid rgba(29,95,85,0.1);border-radius:16px;padding:16px 20px;margin-bottom:20px;}
        .bc-user-avatar{width:44px;height:44px;border-radius:50%;background:#1D5F55;color:#fff;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .bc-user-name-big{font-size:15px;font-weight:700;color:#15423C;margin-bottom:2px;}
        .bc-user-email{font-size:12px;color:#7A9E97;}

        .bc-format-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
        .bc-format-opt{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 10px;border-radius:14px;border:1.5px solid rgba(21,66,60,0.1);background:rgba(255,255,255,0.5);cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:#536C68;transition:all .18s;text-align:center;}
        .bc-format-opt:hover{border-color:#1D5F55;color:#15423C;}
        .bc-format-opt.active{border-color:#1D5F55;background:rgba(29,95,85,0.07);color:#15423C;}
        .bc-format-opt svg{color:#7A9E97;transition:color .18s;}
        .bc-format-opt.active svg{color:#1D5F55;}

        .bc-type-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .bc-type-opt{padding:13px 16px;border-radius:12px;border:1.5px solid rgba(21,66,60,0.1);background:rgba(255,255,255,0.5);cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;color:#536C68;transition:all .18s;text-align:left;display:flex;align-items:center;gap:8px;}
        .bc-type-opt:hover{border-color:#1D5F55;color:#15423C;}
        .bc-type-opt.active{border-color:#1D5F55;background:rgba(29,95,85,0.07);color:#15423C;font-weight:700;}
        .bc-type-dot{width:8px;height:8px;border-radius:50%;border:2px solid currentColor;flex-shrink:0;transition:all .18s;}
        .bc-type-opt.active .bc-type-dot{background:#1D5F55;border-color:#1D5F55;}

        .bc-field-group{display:flex;flex-direction:column;gap:14px;}
        .bc-field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .bc-field{display:flex;flex-direction:column;gap:6px;}
        .bc-label{font-size:11px;font-weight:700;color:#536C68;text-transform:uppercase;letter-spacing:.07em;}
        .bc-input{padding:13px 16px;border-radius:12px;border:1px solid rgba(21,66,60,0.12);background:rgba(255,255,255,0.6);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#15423C;outline:none;transition:border-color .2s,background .2s;}
        .bc-input:focus{border-color:rgba(29,95,85,0.35);background:rgba(255,255,255,0.9);}
        .bc-input::placeholder{color:#7A9E97;}
        .bc-input:read-only{color:#536C68;cursor:default;background:rgba(21,66,60,0.03);}
        .bc-textarea{width:100%;padding:13px 16px;border-radius:12px;border:1px solid rgba(21,66,60,0.12);background:rgba(255,255,255,0.6);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#15423C;outline:none;transition:border-color .2s;resize:vertical;min-height:100px;line-height:1.6;}
        .bc-textarea:focus{border-color:rgba(29,95,85,0.35);background:rgba(255,255,255,0.9);}
        .bc-textarea::placeholder{color:#7A9E97;}

        .bc-summary-panel{background:rgba(255,255,255,0.55);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.8);border-radius:24px;padding:28px;box-shadow:0 10px 40px rgba(21,66,60,0.05);position:sticky;top:96px;}
        .bc-summary-title{font-size:17px;font-weight:800;color:#15423C;margin-bottom:22px;letter-spacing:-.01em;}
        .bc-sum-therapist{display:flex;align-items:center;gap:12px;padding-bottom:18px;margin-bottom:18px;border-bottom:1px solid rgba(21,66,60,0.07);}
        .bc-sum-img{width:54px;height:54px;border-radius:14px;object-fit:cover;background:#D6F0EC;flex-shrink:0;}
        .bc-sum-name{font-size:15px;font-weight:700;color:#15423C;margin-bottom:2px;}
        .bc-sum-sub{font-size:12px;color:#7A9E97;}
        .bc-sum-details{display:flex;flex-direction:column;gap:9px;margin-bottom:20px;}
        .bc-sum-row{display:flex;align-items:center;gap:9px;font-size:13px;color:#536C68;}
        .bc-sum-row svg{color:#1D5F55;flex-shrink:0;}
        .bc-sum-row strong{color:#15423C;font-weight:700;}
        .bc-sum-patient{background:rgba(29,95,85,0.04);border:1px solid rgba(29,95,85,0.09);border-radius:14px;padding:14px 16px;margin-bottom:18px;}
        .bc-sum-patient-label{font-size:10px;font-weight:800;color:#1D5F55;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;}
        .bc-sum-patient-row{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#536C68;margin-bottom:6px;}
        .bc-sum-patient-row:last-child{margin-bottom:0;}
        .bc-sum-patient-row svg{color:#1D5F55;flex-shrink:0;}
        .bc-divider{height:1px;background:rgba(21,66,60,0.07);margin-bottom:18px;}
        .bc-cost-rows{display:flex;flex-direction:column;gap:9px;margin-bottom:20px;}
        .bc-cost-row{display:flex;justify-content:space-between;align-items:center;font-size:13.5px;color:#536C68;}
        .bc-cost-row.total{font-size:18px;font-weight:800;color:#15423C;padding-top:12px;border-top:2px solid rgba(21,66,60,0.1);margin-top:2px;}
        .bc-cost-row.total span:last-child{color:#1D5F55;}

        .bc-pay-btn{width:100%;padding:17px;background:linear-gradient(135deg,#1D5F55 0%,#15423C 100%);color:#fff;border:none;border-radius:16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:800;cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 28px rgba(21,66,60,0.2);margin-bottom:12px;}
        .bc-pay-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 36px rgba(21,66,60,0.28);}
        .bc-pay-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;}
        .bc-secure-row{display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;color:#7A9E97;margin-bottom:14px;}
        .bc-payhere-badge{display:flex;align-items:center;justify-content:center;gap:7px;background:rgba(21,66,60,0.04);border:1px solid rgba(21,66,60,0.09);border-radius:10px;padding:11px 14px;font-size:12px;color:#536C68;font-weight:600;margin-bottom:14px;}
        .bc-payhere-badge span{color:#1D5F55;font-weight:800;}
        .bc-trust-list{display:flex;flex-direction:column;gap:7px;}
        .bc-trust-item{display:flex;align-items:center;gap:7px;font-size:12px;color:#536C68;}
        .bc-trust-item svg{color:#1D5F55;flex-shrink:0;}
        .bc-error{display:flex;align-items:center;gap:10px;background:rgba(211,47,47,0.07);border:1px solid rgba(211,47,47,0.18);border-radius:12px;padding:14px 16px;font-size:13px;color:#D32F2F;font-weight:500;margin-bottom:14px;}

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

        @media(max-width:1024px){.bc-body{grid-template-columns:1fr;}.bc-summary-panel{position:static;}}
        @media(max-width:768px){.cb-nav{display:none;}.bc-format-grid{grid-template-columns:1fr 1fr;}.bc-field-row{grid-template-columns:1fr;}.cb-footer-top{grid-template-columns:1fr;gap:32px;}}
        @media(max-width:480px){.bc-type-grid{grid-template-columns:1fr;}.bc-therapist-card{flex-direction:column;}}
        @keyframes spin{to{transform:rotate(360deg);}}
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

      <div className="bc-page">

        {/* PROGRESS */}
        <div className="bc-progress-strip">
          <div className="bc-progress-inner">
            <div className="bc-step done"><div className="bc-step-num"><CheckCircle2 size={12}/></div>Select Therapist</div>
            <div className="bc-step-line done"/>
            <div className="bc-step done"><div className="bc-step-num"><CheckCircle2 size={12}/></div>Choose Slot</div>
            <div className="bc-step-line done"/>
            <div className="bc-step active"><div className="bc-step-num">3</div>Review &amp; Pay</div>
            <div className="bc-step-line"/>
            <div className="bc-step"><div className="bc-step-num">4</div>Confirmation</div>
          </div>
        </div>

        {/* HERO */}
        <section className="bc-hero">
          <div className="bc-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} color="#7A9E97"/>
            <Link to="/find-therapist">Find a Therapist</Link>
            <ChevronRight size={13} color="#7A9E97"/>
            <span onClick={() => navigate(-1)}>{name}</span>
            <ChevronRight size={13} color="#7A9E97"/>
            <strong>Checkout</strong>
          </div>
          <h1 className="bc-hero-title">Review &amp; Confirm Booking</h1>
          <p className="bc-hero-sub">Double-check your details before proceeding to secure payment.</p>
        </section>

        {/* BODY */}
        <div className={`bc-body${mounted ? ' mounted' : ''}`}>

          {/* LEFT */}
          <div>

            {/* 1. THERAPIST + SLOT */}
            <div className="bc-panel">
              <div className="bc-panel-title"><Award size={17}/> Therapist &amp; Session</div>
              <div className="bc-therapist-card">
                <img src={therapistImgSrc} alt={name} className="bc-therapist-img" />
                <div className="bc-therapist-info">
                  <div className="bc-therapist-badge"><Shield size={10}/> Verified Therapist</div>
                  <div className="bc-therapist-name">{name}</div>
                  <div className="bc-therapist-sub">{title}{therapistSpecialization ? ` · ${therapistSpecialization}` : ''}</div>
                  <div className="bc-therapist-meta">
                    {therapistExperience > 0 && <div className="bc-therapist-meta-item"><Award size={12}/>{therapistExperience} yrs exp.</div>}
                    {therapistLocation    && <div className="bc-therapist-meta-item"><MapPin size={12}/>{therapistLocation}</div>}
                    {therapistRating > 0  && <div className="bc-therapist-meta-item"><Star size={12} fill="#F0B429" color="#F0B429"/>{therapistRating.toFixed(1)}</div>}
                    {therapistLanguages   && <div className="bc-therapist-meta-item"><Globe size={12}/>{therapistLanguages}</div>}
                  </div>
                </div>
              </div>
              <div className="bc-slot-box">
                <div className="bc-slot-item"><Calendar size={15}/>{booking.selectedDateLabel}</div>
                <div className="bc-slot-divider"/>
                <div className="bc-slot-item"><Clock size={15}/>{booking.selectedSlot}</div>
                <button className="bc-change-btn" onClick={() => navigate(-1)}>← Change</button>
              </div>
            </div>

            {/* 2. FORMAT */}
            <div className="bc-panel">
              <fieldset style={{ border:'none', padding:0, margin:0 }}>
                <legend className="bc-panel-title" style={{ float:'none', width:'100%' }}>
                  <Video size={17}/> Session Format
                </legend>
                <div className="bc-format-grid">
                  {[
                    { v:'Video Consultation', label:'Video Call', icon:<Video size={22}/> },
                    { v:'Phone Consultation', label:'Phone Call', icon:<Phone size={22}/> },
                    { v:'Chat Session',       label:'Chat',       icon:<Chat  size={22}/> },
                  ].map(opt => (
                    <button key={opt.v} type="button" aria-pressed={sessionFormat === opt.v}
                      className={`bc-format-opt${sessionFormat === opt.v ? ' active' : ''}`}
                      onClick={() => setSessionFormat(opt.v)}>
                      {opt.icon}{opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* 3. TYPE */}
            <div className="bc-panel">
              <fieldset style={{ border:'none', padding:0, margin:0 }}>
                <legend className="bc-panel-title" style={{ float:'none', width:'100%' }}>
                  <FileText size={17}/> Appointment Type
                </legend>
                <div className="bc-type-grid">
                  {['Initial Intake Session','Follow-up Session','Crisis Support','Couples / Family'].map(t => (
                    <button key={t} type="button" aria-pressed={appointmentType === t}
                      className={`bc-type-opt${appointmentType === t ? ' active' : ''}`}
                      onClick={() => setAppointmentType(t)}>
                      <div className="bc-type-dot"/>{t}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* 4. YOUR DETAILS */}
            <div className="bc-panel">
              <div className="bc-panel-title"><User size={17}/> Your Details</div>
              <div className="bc-user-card">
                <div className="bc-user-avatar">{firstname ? firstname.charAt(0).toUpperCase() : '?'}</div>
                <div>
                  <div className="bc-user-name-big">{firstname} {lastname}</div>
                  <div className="bc-user-email">{email}</div>
                </div>
              </div>
              <div className="bc-field-group">
                <div className="bc-field-row">
                  <div className="bc-field">
                    <label htmlFor="checkout-firstname" className="bc-label">First Name</label>
                    <input id="checkout-firstname" name="firstname" className="bc-input"
                      value={firstname} readOnly autoComplete="given-name" />
                  </div>
                  <div className="bc-field">
                    <label htmlFor="checkout-lastname" className="bc-label">Last Name</label>
                    <input id="checkout-lastname" name="lastname" className="bc-input"
                      value={lastname} readOnly autoComplete="family-name" />
                  </div>
                </div>
                <div className="bc-field-row">
                  <div className="bc-field">
                    <label htmlFor="checkout-email" className="bc-label">Email Address</label>
                    <input id="checkout-email" name="email" type="email" className="bc-input"
                      value={email} readOnly autoComplete="email" />
                  </div>
                  <div className="bc-field">
                    <label htmlFor="checkout-phone" className="bc-label">Phone Number *</label>
                    <input id="checkout-phone" name="phone" type="tel" className="bc-input"
                      value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567" autoComplete="tel" required />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. NOTES */}
            <div className="bc-panel">
              <div className="bc-panel-title">
                <FileText size={17}/> Notes for Therapist
                <span style={{ fontSize:12, fontWeight:400, color:'#7A9E97', marginLeft:4 }}>(Optional)</span>
              </div>
              <label htmlFor="checkout-notes" className="bc-label" style={{ display:'block', marginBottom:8 }}>
                Additional Notes
              </label>
              <textarea id="checkout-notes" name="clientNotes" className="bc-textarea"
                placeholder="Share anything that would help your therapist prepare…"
                value={clientNotes} onChange={e => setClientNotes(e.target.value)} />
            </div>

          </div>

          {/* RIGHT — SUMMARY */}
          <div className="bc-summary-panel">
            <div className="bc-summary-title">Order Summary</div>

            <div className="bc-sum-therapist">
              <img src={therapistImgSrcSm} alt={name} className="bc-sum-img" />
              <div>
                <div className="bc-sum-name">{name}</div>
                <div className="bc-sum-sub">{title}</div>
              </div>
            </div>

            <div className="bc-sum-details">
              <div className="bc-sum-row"><Calendar size={14}/><span><strong>{booking.selectedDateLabel}</strong></span></div>
              <div className="bc-sum-row"><Clock    size={14}/><span>{booking.selectedSlot}</span></div>
              <div className="bc-sum-row"><Video    size={14}/><span>{sessionFormat}</span></div>
              <div className="bc-sum-row"><FileText size={14}/><span>{appointmentType}</span></div>
            </div>

            <div className="bc-sum-patient">
              <div className="bc-sum-patient-label">Patient</div>
              <div className="bc-sum-patient-row"><User  size={12}/>{firstname} {lastname}</div>
              <div className="bc-sum-patient-row"><Mail  size={12}/>{email}</div>
              {phone && <div className="bc-sum-patient-row"><Phone size={12}/>{phone}</div>}
            </div>

            <div className="bc-divider"/>

            <div className="bc-cost-rows">
              <div className="bc-cost-row"><span>Session fee</span><span>RS {price.toLocaleString()} /hr</span></div>
              <div className="bc-cost-row"><span>Platform fee</span><span style={{ color:'#1E8449', fontWeight:700 }}>Free</span></div>
              <div className="bc-cost-row total"><span>Total</span><span>RS {totalCost.toLocaleString()}</span></div>
            </div>

            {error && (
              <div className="bc-error"><AlertCircle size={16}/>{error}</div>
            )}

            <button className="bc-pay-btn" disabled={submitting} onClick={handleProceed}>
              {submitting
                ? <><Loader2 size={18} style={{ animation:'spin .8s linear infinite' }}/> Processing…</>
                : <><CreditCard size={18}/> Pay RS {totalCost.toLocaleString()}</>}
            </button>

            <div className="bc-secure-row"><Lock size={12}/> Secured by SSL encryption</div>

            <div className="bc-payhere-badge">
              <Shield size={14} color="#1D5F55"/> Powered by <span>PayHere</span>
            </div>

            <div className="bc-trust-list">
              <div className="bc-trust-item"><CheckCircle2 size={13}/> Free cancellation up to 24h before</div>
              <div className="bc-trust-item"><CheckCircle2 size={13}/> Instant confirmation via email</div>
              <div className="bc-trust-item"><CheckCircle2 size={13}/> All therapists are verified</div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <footer className="cb-footer">
          <div className="cb-footer-top">
            <div>
              <div className="cb-footer-brand-name"><HeartHandshake size={20} color="#34A092"/><span>CareBridge</span></div>
              <p className="cb-footer-brand-p">Building a future where digital serenity is accessible to everyone.</p>
              <div className="cb-footer-connect">
                <div className="cb-footer-icon"><Share2 size={15} color="#7A9E97"/></div>
                <div className="cb-footer-icon"><Mail   size={15} color="#7A9E97"/></div>
                <div className="cb-footer-icon"><Globe  size={15} color="#7A9E97"/></div>
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