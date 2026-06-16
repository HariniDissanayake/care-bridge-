import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HeartHandshake, Mail, Lock, UserCheck, Phone, Globe,
  Mail as MailIcon, Sparkles, ArrowRight, Eye, EyeOff,
  Briefcase, BookOpen, MapPin, Languages, DollarSign,
  Clock, Plus, Trash2, ChevronDown, Video, MessageSquare,
  Award, FileText
} from 'lucide-react';
import API from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SPECIALTIES_LIST = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues',
  'Grief & Loss', 'OCD', 'Bipolar Disorder', 'Eating Disorders',
  'Addiction', 'Family Therapy', 'Child & Adolescent', 'Career Counseling',
  'LGBTQ+', 'Stress Management', 'Sleep Disorders', 'Self-Esteem',
];

type WorkDay = { dayOfWeek: string; startTime: string; endTime: string };

type FormData = {
  firstName: string; lastName: string; email: string; password: string; phone: string;
  title: string; specialization: string; bio: string; location: string;
  languages: string; imageUrl: string; consultationType: string; contactMethod: string;
  pricePerSession: string; yearsOfExperience: string;
  specialties: string[]; education: string[];
  workSchedule: WorkDay[];
};

export default function TherapistRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Account, 2 = Profile, 3 = Availability
  const [message, setMessage] = useState({ text: '', isError: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEducation, setNewEducation] = useState('');

  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    title: '', specialization: '', bio: '', location: '',
    languages: '', imageUrl: '', consultationType: 'ONLINE', contactMethod: 'VIDEO',
    pricePerSession: '', yearsOfExperience: '',
    specialties: [], education: [],
    workSchedule: [],
  });

  const set = (field: keyof FormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    set(e.target.name as keyof FormData, e.target.value);

  const toggleSpecialty = (s: string) =>
    set('specialties', form.specialties.includes(s)
      ? form.specialties.filter(x => x !== s)
      : [...form.specialties, s]);

  const addEducation = () => {
    if (newEducation.trim()) {
      set('education', [...form.education, newEducation.trim()]);
      setNewEducation('');
    }
  };
  const removeEducation = (i: number) =>
    set('education', form.education.filter((_, idx) => idx !== i));

  const addWorkDay = () => {
    const unused = DAYS.find(d => !form.workSchedule.some(w => w.dayOfWeek === d));
    if (unused) set('workSchedule', [...form.workSchedule, { dayOfWeek: unused, startTime: '09:00', endTime: '17:00' }]);
  };
  const removeWorkDay = (i: number) =>
    set('workSchedule', form.workSchedule.filter((_, idx) => idx !== i));
  const updateWorkDay = (i: number, field: keyof WorkDay, value: string) =>
    set('workSchedule', form.workSchedule.map((w, idx) => idx === i ? { ...w, [field]: value } : w));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) { setStep(s => s + 1); return; }
    setLoading(true);
    setMessage({ text: '', isError: false });
    try {
      await API.post('/auth/register-therapist', {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password, phone: form.phone, role: 'THERAPIST',
        therapistProfile: {
          title: form.title, specialization: form.specialization, bio: form.bio,
          location: form.location, languages: form.languages, imageUrl: form.imageUrl,
          consultationType: form.consultationType, contactMethod: form.contactMethod,
          pricePerSession: parseFloat(form.pricePerSession) || 0,
          yearsOfExperience: parseInt(form.yearsOfExperience) || 0,
          specialties: form.specialties, education: form.education,
          workSchedule: form.workSchedule,
        }
      }, { responseType: 'text' });
      setMessage({ text: 'Application submitted! Our team will verify your profile shortly.', isError: false });
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Registration failed. Please try again.';
      setMessage({ text: typeof msg === 'string' ? msg : 'Registration failed.', isError: true });
    } finally { setLoading(false); }
  };

  const STEPS = ['Account', 'Profile', 'Availability'];

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
          background: rgba(208,243,236,0.85);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 30px rgba(21,66,60,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.4);
          position: fixed; top: 0; left: 0; z-index: 200;
        }
        .cb-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .cb-logo-icon { color: #1D5F55; display: flex; align-items: center; justify-content: center; }
        .cb-logo-text { color: #15423C; font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
        .cb-nav { display: flex; gap: 32px; margin-left: auto; }
        .cb-nav a { font-size: 14px; color: #4A6360; transition: color .2s; font-weight: 500; text-decoration: none; }
        .cb-nav a:hover { color: #1D5F55; }

        /* ══ PAGE ══ */
        .tr-page {
          min-height: 100vh; padding: 100px 5vw 60px;
          display: flex; flex-direction: column; align-items: center;
          background: radial-gradient(circle at 10% 80%, #E0F5F0 0%, #EAF6F3 50%, #D8F0EA 100%);
        }

        /* ══ STEPPER ══ */
        .tr-stepper {
          display: flex; align-items: center; gap: 0;
          margin-bottom: 32px; width: 100%; max-width: 680px;
        }
        .tr-step {
          display: flex; align-items: center; gap: 10px; flex: 1;
          position: relative;
        }
        .tr-step:not(:last-child)::after {
          content: ''; position: absolute; left: calc(50% + 18px); top: 50%;
          transform: translateY(-50%);
          width: calc(100% - 36px); height: 2px;
          background: rgba(29,95,85,0.15); z-index: 0;
          transition: background .3s;
        }
        .tr-step.done:not(:last-child)::after { background: #1D5F55; }
        .tr-step-num {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; z-index: 1;
          border: 2px solid rgba(29,95,85,0.25); background: rgba(255,255,255,0.55);
          color: #7A9E97; transition: all .3s; flex-shrink: 0;
        }
        .tr-step.active .tr-step-num { background: #1D5F55; border-color: #1D5F55; color: #fff; box-shadow: 0 4px 16px rgba(21,95,85,0.28); }
        .tr-step.done .tr-step-num { background: #15423C; border-color: #15423C; color: #fff; }
        .tr-step-label { font-size: 12px; font-weight: 600; color: #7A9E97; white-space: nowrap; }
        .tr-step.active .tr-step-label { color: #1D5F55; }
        .tr-step.done .tr-step-label { color: #15423C; }

        /* ══ CARD ══ */
        .tr-card {
          width: 100%; max-width: 680px;
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 28px; padding: 44px 40px;
          box-shadow: 0 20px 60px rgba(21,66,60,0.06);
        }

        .tr-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.9);
          border-radius: 100px; padding: 5px 14px; font-size: 11px; font-weight: 600;
          color: #1D5F55; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 14px;
        }
        .tr-title { font-size: clamp(22px,2.5vw,30px); font-weight: 700; color: #15423C; margin-bottom: 4px; letter-spacing: -0.02em; }
        .tr-sub { font-size: 13.5px; color: #536C68; margin-bottom: 28px; }

        /* ══ MSG ══ */
        .tr-msg { padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-bottom: 20px; }
        .tr-msg.error { background: rgba(229,57,53,0.08); color: #C53030; border: 1px solid rgba(229,57,53,0.2); }
        .tr-msg.success { background: rgba(52,160,146,0.08); color: #1D5F55; border: 1px solid rgba(52,160,146,0.2); }

        /* ══ FIELDS ══ */
        .tr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .tr-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .tr-field { margin-bottom: 16px; }
        .tr-field.no-mb { margin-bottom: 0; }
        .tr-label { font-size: 11px; font-weight: 700; color: #15423C; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 7px; display: block; }
        .tr-input-wrap { position: relative; }
        .tr-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #7A9E97; pointer-events: none; }
        .tr-input-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #7A9E97; cursor: pointer; background: none; border: none; padding: 0; display: flex; align-items: center; }
        .tr-input {
          width: 100%; padding: 12px 14px 12px 44px;
          background: rgba(255,255,255,0.55); border: 1.5px solid rgba(255,255,255,0.75);
          border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: #15423C; outline: none;
          transition: all .2s; backdrop-filter: blur(8px);
        }
        .tr-input.no-icon { padding-left: 14px; }
        .tr-input:focus { background: rgba(255,255,255,0.8); border-color: #1D5F55; box-shadow: 0 0 0 3px rgba(29,95,85,0.1); }
        .tr-input::placeholder { color: #7A9E97; }
        .tr-textarea {
          width: 100%; padding: 12px 14px; min-height: 110px; resize: vertical;
          background: rgba(255,255,255,0.55); border: 1.5px solid rgba(255,255,255,0.75);
          border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: #15423C; outline: none;
          transition: all .2s; backdrop-filter: blur(8px);
        }
        .tr-textarea:focus { background: rgba(255,255,255,0.8); border-color: #1D5F55; box-shadow: 0 0 0 3px rgba(29,95,85,0.1); }
        .tr-textarea::placeholder { color: #7A9E97; }
        .tr-select {
          width: 100%; padding: 12px 36px 12px 44px;
          background: rgba(255,255,255,0.55); border: 1.5px solid rgba(255,255,255,0.75);
          border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: #15423C; outline: none; cursor: pointer;
          transition: all .2s; appearance: none;
        }
        .tr-select:focus { background: rgba(255,255,255,0.8); border-color: #1D5F55; box-shadow: 0 0 0 3px rgba(29,95,85,0.1); }
        .tr-select-arrow { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); color: #7A9E97; pointer-events: none; }

        /* ══ SPECIALTIES GRID ══ */
        .tr-specialties-grid {
          display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;
        }
        .tr-specialty-chip {
          padding: 6px 13px; border-radius: 100px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1.5px solid rgba(29,95,85,0.2);
          background: rgba(255,255,255,0.5); color: #536C68;
          transition: all .18s; user-select: none;
        }
        .tr-specialty-chip:hover { border-color: #1D5F55; color: #1D5F55; background: rgba(29,95,85,0.05); }
        .tr-specialty-chip.selected { background: #1D5F55; border-color: #1D5F55; color: #fff; }

        /* ══ EDUCATION ══ */
        .tr-edu-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.7);
          border-radius: 10px; margin-bottom: 8px;
        }
        .tr-edu-text { flex: 1; font-size: 13.5px; color: #2C3E3B; }
        .tr-edu-del { background: none; border: none; cursor: pointer; color: #C53030; display: flex; padding: 0; opacity: .6; }
        .tr-edu-del:hover { opacity: 1; }
        .tr-edu-add-row { display: flex; gap: 8px; margin-top: 4px; }
        .tr-add-btn {
          padding: 11px 18px; background: rgba(29,95,85,0.08); border: 1.5px dashed rgba(29,95,85,0.3);
          border-radius: 11px; color: #1D5F55; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all .2s; white-space: nowrap;
        }
        .tr-add-btn:hover { background: rgba(29,95,85,0.13); border-color: #1D5F55; }

        /* ══ WORK SCHEDULE ══ */
        .tr-schedule-row {
          display: grid; grid-template-columns: auto 1fr 1fr auto; gap: 10px; align-items: center;
          padding: 12px 14px; background: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 8px;
        }
        .tr-schedule-day { font-size: 13px; font-weight: 600; color: #15423C; min-width: 90px; }
        .tr-time-input {
          width: 100%; padding: 8px 12px;
          background: rgba(255,255,255,0.6); border: 1.5px solid rgba(255,255,255,0.75);
          border-radius: 9px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; color: #15423C; outline: none;
        }
        .tr-time-input:focus { border-color: #1D5F55; }
        .tr-del-btn { background: none; border: none; cursor: pointer; color: #C53030; opacity: .5; display: flex; }
        .tr-del-btn:hover { opacity: 1; }

        /* ══ CONSULT TYPE BUTTONS ══ */
        .tr-toggle-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .tr-toggle-btn {
          flex: 1; padding: 11px 16px; border-radius: 11px; border: 1.5px solid rgba(29,95,85,0.2);
          background: rgba(255,255,255,0.5); color: #536C68; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .tr-toggle-btn.active { background: #1D5F55; border-color: #1D5F55; color: #fff; }

        /* ══ ACTIONS ══ */
        .tr-actions { display: flex; gap: 12px; margin-top: 8px; }
        .tr-back-btn {
          padding: 14px 24px; background: rgba(255,255,255,0.55);
          border: 1.5px solid rgba(255,255,255,0.75);
          border-radius: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600; color: #536C68; cursor: pointer; transition: all .2s;
        }
        .tr-back-btn:hover { background: rgba(255,255,255,0.8); color: #15423C; }
        .tr-submit {
          flex: 1; padding: 14px;
          background: #1D5F55; color: #fff; border: none; border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all .25s; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 28px rgba(21,95,85,0.25);
        }
        .tr-submit:hover:not(:disabled) { background: #15423C; transform: translateY(-1px); box-shadow: 0 12px 36px rgba(21,95,85,0.3); }
        .tr-submit:disabled { opacity: .65; cursor: not-allowed; transform: none; }

        .tr-spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .tr-divider { display: flex; align-items: center; gap: 14px; margin: 20px 0; color: #AEE4DB; font-size: 12px; }
        .tr-divider::before, .tr-divider::after { content: ''; flex: 1; height: 1px; background: rgba(174,228,219,0.4); }

        .tr-section-head { font-size: 11px; font-weight: 700; color: #1D5F55; text-transform: uppercase; letter-spacing: .09em; margin-bottom: 14px; margin-top: 4px; display: flex; align-items: center; gap: 8px; }
        .tr-section-head::after { content: ''; flex: 1; height: 1px; background: rgba(29,95,85,0.15); }

        .tr-login-link { text-align: center; margin-top: 20px; font-size: 13.5px; color: #536C68; }
        .tr-login-link a { color: #1D5F55; font-weight: 700; text-decoration: none; }
        .tr-login-link a:hover { text-decoration: underline; }

        /* ══ FOOTER ══ */
        .cb-footer { width: 100%; background: #0E2B27; padding: 48px 8vw 28px; border-top: 1px solid rgba(255,255,255,0.05); }
        .cb-footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px; margin-bottom: 28px; }
        .cb-footer-brand { display: flex; align-items: center; gap: 10px; }
        .cb-footer-brand span { color: #FFFFFF; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
        .cb-footer-brand-p { font-size: 13px; color: #7A9E97; margin-top: 4px; }
        .cb-footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .cb-footer-links a { font-size: 13px; color: #7A9E97; text-decoration: none; cursor: pointer; transition: color 0.2s; }
        .cb-footer-links a:hover { color: #AEE4DB; }
        .cb-footer-connect { display: flex; gap: 10px; }
        .cb-footer-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
        .cb-footer-icon:hover { background: rgba(52,160,146,0.15); border-color: rgba(52,160,146,0.3); transform: translateY(-1px); }
        .cb-footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 13px; color: #4E6E68; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 768px) {
          .cb-nav { display: none; }
          .tr-card { padding: 28px 20px; }
          .tr-row, .tr-row-3 { grid-template-columns: 1fr; }
          .tr-schedule-row { grid-template-columns: 1fr; gap: 8px; }
          .tr-stepper { gap: 4px; }
          .tr-step-label { display: none; }
        }
      `}</style>

      {/* ══ HEADER ══ */}
      <header className="cb-header">
        <Link className="cb-logo" to="/">
          <div className="cb-logo-icon"><HeartHandshake size={22} strokeWidth={2.5} /></div>
          <span className="cb-logo-text">CareBridge</span>
        </Link>
        <nav className="cb-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      {/* ══ MAIN ══ */}
      <main className="tr-page">

        {/* STEPPER */}
        <div className="tr-stepper">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`tr-step${step === i + 1 ? ' active' : ''}${step > i + 1 ? ' done' : ''}`}
              style={{ justifyContent: i === 0 ? 'flex-start' : i === STEPS.length - 1 ? 'flex-end' : 'center' }}
            >
              <div className="tr-step-num">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="tr-step-label">{label}</span>
            </div>
          ))}
        </div>

        {/* CARD */}
        <div className="tr-card">
          <div className="tr-badge">
            <Sparkles size={11} fill="currentColor" opacity={0.3} />
            {step === 1 ? 'Therapist Registration' : step === 2 ? 'Professional Profile' : 'Availability'}
          </div>
          <h2 className="tr-title">
            {step === 1 ? 'Create your therapist account' : step === 2 ? 'Tell us about your practice' : 'Set your work schedule'}
          </h2>
          <p className="tr-sub">
            {step === 1 ? 'Step 1 of 3 — Your login credentials' : step === 2 ? 'Step 2 of 3 — Profile & specializations' : 'Step 3 of 3 — When are you available?'}
          </p>

          {message.text && (
            <div className={`tr-msg${message.isError ? ' error' : ' success'}`}>{message.text}</div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ── STEP 1: ACCOUNT ── */}
            {step === 1 && (
              <>
                <div className="tr-section-head">Personal Information</div>
                <div className="tr-row">
                  <div className="tr-field no-mb">
                    <label className="tr-label">First Name</label>
                    <div className="tr-input-wrap">
                      <UserCheck size={15} className="tr-input-icon" />
                      <input className="tr-input" type="text" name="firstName" placeholder="Jane" required value={form.firstName} onChange={handleInput} />
                    </div>
                  </div>
                  <div className="tr-field no-mb">
                    <label className="tr-label">Last Name</label>
                    <div className="tr-input-wrap">
                      <UserCheck size={15} className="tr-input-icon" />
                      <input className="tr-input" type="text" name="lastName" placeholder="Doe" required value={form.lastName} onChange={handleInput} />
                    </div>
                  </div>
                </div>

                <div className="tr-field">
                  <label className="tr-label">Email Address</label>
                  <div className="tr-input-wrap">
                    <Mail size={15} className="tr-input-icon" />
                    <input className="tr-input" type="email" name="email" placeholder="jane@clinic.com" required value={form.email} onChange={handleInput} />
                  </div>
                </div>

                <div className="tr-field">
                  <label className="tr-label">Phone Number</label>
                  <div className="tr-input-wrap">
                    <Phone size={15} className="tr-input-icon" />
                    <input className="tr-input" type="tel" name="phone" placeholder="+94 77 123 4567" required value={form.phone} onChange={handleInput} />
                  </div>
                </div>

                <div className="tr-field">
                  <label className="tr-label">Password</label>
                  <div className="tr-input-wrap">
                    <Lock size={15} className="tr-input-icon" />
                    <input
                      className="tr-input" type={showPw ? 'text' : 'password'}
                      name="password" placeholder="••••••••" required
                      value={form.password} onChange={handleInput}
                      style={{ paddingRight: 44 }}
                    />
                    <button type="button" className="tr-input-toggle" onClick={() => setShowPw(p => !p)}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: PROFILE ── */}
            {step === 2 && (
              <>
                <div className="tr-section-head">Professional Details</div>
                <div className="tr-row">
                  <div className="tr-field no-mb">
                    <label className="tr-label">Title / Credential</label>
                    <div className="tr-input-wrap">
                      <Award size={15} className="tr-input-icon" />
                      <input className="tr-input" type="text" name="title" placeholder="e.g. PhD, LPC, LMFT" value={form.title} onChange={handleInput} />
                    </div>
                  </div>
                  <div className="tr-field no-mb">
                    <label className="tr-label">Years of Experience</label>
                    <div className="tr-input-wrap">
                      <Briefcase size={15} className="tr-input-icon" />
                      <input className="tr-input" type="number" name="yearsOfExperience" placeholder="e.g. 8" min="0" value={form.yearsOfExperience} onChange={handleInput} />
                    </div>
                  </div>
                </div>

                <div className="tr-row">
                  <div className="tr-field no-mb">
                    <label className="tr-label">Primary Specialization</label>
                    <div className="tr-input-wrap">
                      <FileText size={15} className="tr-input-icon" />
                      <input className="tr-input" type="text" name="specialization" placeholder="e.g. Cognitive Behavioral Therapy" value={form.specialization} onChange={handleInput} />
                    </div>
                  </div>
                  <div className="tr-field no-mb">
                    <label className="tr-label">Price per Session (USD)</label>
                    <div className="tr-input-wrap">
                      <DollarSign size={15} className="tr-input-icon" />
                      <input className="tr-input" type="number" name="pricePerSession" placeholder="e.g. 120" min="0" value={form.pricePerSession} onChange={handleInput} />
                    </div>
                  </div>
                </div>

                <div className="tr-row">
                  <div className="tr-field no-mb">
                    <label className="tr-label">Location</label>
                    <div className="tr-input-wrap">
                      <MapPin size={15} className="tr-input-icon" />
                      <input className="tr-input" type="text" name="location" placeholder="City, Country" value={form.location} onChange={handleInput} />
                    </div>
                  </div>
                  <div className="tr-field no-mb">
                    <label className="tr-label">Languages</label>
                    <div className="tr-input-wrap">
                      <Languages size={15} className="tr-input-icon" />
                      <input className="tr-input" type="text" name="languages" placeholder="e.g. English, Sinhala" value={form.languages} onChange={handleInput} />
                    </div>
                  </div>
                </div>

                <div className="tr-field">
                  <label className="tr-label">Profile Image URL</label>
                  <div className="tr-input-wrap">
                    <Globe size={15} className="tr-input-icon" />
                    <input className="tr-input" type="url" name="imageUrl" placeholder="https://..." value={form.imageUrl} onChange={handleInput} />
                  </div>
                </div>

                <div className="tr-field">
                  <label className="tr-label">Bio</label>
                  <textarea className="tr-textarea" name="bio" placeholder="Tell clients about your approach, background, and what makes you unique..." value={form.bio} onChange={handleInput} />
                </div>

                <div className="tr-divider">Consultation Settings</div>

                <div className="tr-row">
                  <div className="tr-field no-mb">
                    <label className="tr-label">Consultation Type</label>
                    <div className="tr-toggle-group">
                      {[{ v: 'ONLINE', label: 'Online' }, { v: 'IN_PERSON', label: 'In-Person' }, { v: 'BOTH', label: 'Both' }].map(opt => (
                        <button key={opt.v} type="button" className={`tr-toggle-btn${form.consultationType === opt.v ? ' active' : ''}`} onClick={() => set('consultationType', opt.v)}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="tr-field no-mb">
                    <label className="tr-label">Contact Method</label>
                    <div className="tr-toggle-group">
                      {[{ v: 'VIDEO', icon: <Video size={13} />, label: 'Video' }, { v: 'CHAT', icon: <MessageSquare size={13} />, label: 'Chat' }, { v: 'BOTH', icon: null, label: 'Both' }].map(opt => (
                        <button key={opt.v} type="button" className={`tr-toggle-btn${form.contactMethod === opt.v ? ' active' : ''}`} onClick={() => set('contactMethod', opt.v)}>
                          {opt.icon}{opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tr-divider">Specialties</div>

                <div className="tr-field">
                  <label className="tr-label">Select all that apply</label>
                  <div className="tr-specialties-grid">
                    {SPECIALTIES_LIST.map(s => (
                      <div key={s} className={`tr-specialty-chip${form.specialties.includes(s) ? ' selected' : ''}`} onClick={() => toggleSpecialty(s)}>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tr-divider">Education & Credentials</div>

                <div className="tr-field">
                  <label className="tr-label">Degrees & Certifications</label>
                  {form.education.map((edu, i) => (
                    <div key={i} className="tr-edu-item">
                      <BookOpen size={14} color="#7A9E97" style={{ flexShrink: 0 }} />
                      <span className="tr-edu-text">{edu}</span>
                      <button type="button" className="tr-edu-del" onClick={() => removeEducation(i)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <div className="tr-edu-add-row">
                    <div className="tr-input-wrap" style={{ flex: 1 }}>
                      <BookOpen size={15} className="tr-input-icon" />
                      <input
                        className="tr-input" type="text"
                        placeholder="e.g. PhD Psychology, Stanford University"
                        value={newEducation} onChange={e => setNewEducation(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEducation(); } }}
                      />
                    </div>
                    <button type="button" className="tr-add-btn" onClick={addEducation}>
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: AVAILABILITY ── */}
            {step === 3 && (
              <>
                <div className="tr-section-head">Weekly Work Schedule</div>
                <p style={{ fontSize: 13, color: '#536C68', marginBottom: 18, lineHeight: 1.6 }}>
                  Add your available days and working hours. Clients will be able to book appointments within these windows.
                </p>

                {form.workSchedule.map((ws, i) => (
                  <div key={i} className="tr-schedule-row">
                    <div className="tr-input-wrap" style={{ minWidth: 120 }}>
                      <Clock size={14} className="tr-input-icon" />
                      <select
                        className="tr-select"
                        style={{ paddingLeft: 36 }}
                        value={ws.dayOfWeek}
                        onChange={e => updateWorkDay(i, 'dayOfWeek', e.target.value)}
                      >
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={14} className="tr-select-arrow" />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#7A9E97', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Start</label>
                      <input className="tr-time-input" type="time" value={ws.startTime} onChange={e => updateWorkDay(i, 'startTime', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#7A9E97', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>End</label>
                      <input className="tr-time-input" type="time" value={ws.endTime} onChange={e => updateWorkDay(i, 'endTime', e.target.value)} />
                    </div>
                    <button type="button" className="tr-del-btn" onClick={() => removeWorkDay(i)}><Trash2 size={15} /></button>
                  </div>
                ))}

                {form.workSchedule.length < 7 && (
                  <button type="button" className="tr-add-btn" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }} onClick={addWorkDay}>
                    <Plus size={14} /> Add Working Day
                  </button>
                )}

                {form.workSchedule.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#7A9E97', fontSize: 13 }}>
                    No schedule set yet — add your first working day above.
                  </div>
                )}

                <div className="tr-divider" style={{ marginTop: 24 }} />

                <p style={{ fontSize: 12, color: '#7A9E97', textAlign: 'center', lineHeight: 1.65 }}>
                  Your profile will be reviewed by our team before going live.<br />
                  This typically takes <strong style={{ color: '#1D5F55' }}>1–2 business days</strong>.
                </p>
              </>
            )}

            {/* ── ACTIONS ── */}
            <div className="tr-actions" style={{ marginTop: 24 }}>
              {step > 1 && (
                <button type="button" className="tr-back-btn" onClick={() => setStep(s => s - 1)}>
                  ← Back
                </button>
              )}
              <button type="submit" className="tr-submit" disabled={loading}>
                {loading ? (
                  <><div className="tr-spinner" /> Submitting…</>
                ) : step < 3 ? (
                  <>Continue <ArrowRight size={15} /></>
                ) : (
                  <>Submit Application <ArrowRight size={15} /></>
                )}
              </button>
            </div>
          </form>

          <div className="tr-login-link">
            Already have an account? <Link to="/auth">Log in</Link>
          </div>
        </div>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="cb-footer">
        <div className="cb-footer-inner">
          <div>
            <div className="cb-footer-brand">
              <HeartHandshake size={20} color="#34A092" />
              <span>CareBridge</span>
            </div>
            <p className="cb-footer-brand-p">Dedicated to providing a safe digital harbour for mental wellness.</p>
          </div>
          <div className="cb-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Help Center</a>
            <a href="#">988 Crisis Lifeline</a>
          </div>
          <div className="cb-footer-connect">
            <div className="cb-footer-icon"><Globe size={15} color="#7A9E97" /></div>
            <div className="cb-footer-icon"><MailIcon size={15} color="#7A9E97" /></div>
          </div>
        </div>
        <div className="cb-footer-bottom">
          <span>© 2026 CareBridge. All rights reserved.</span>
          <span>Building digital serenity for mental wellness</span>
        </div>
      </footer>
    </>
  );
}