import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, UserCheck, HeartHandshake,
  Eye, EyeOff, ArrowRight, Phone, Sparkles, Globe,
  Mail as MailIcon   // ← add this alias
} from 'lucide-react';
import API from '../api';

type AuthProps = {
  onLoginSuccess?: (newSession: { email: string; token: string; role: string }) => void;
};
 
export default function Auth({ onLoginSuccess = () => {} }: AuthProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: ''
  });
  const [message, setMessage] = useState({ text: '', isError: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  // ── SUBMIT ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: false });
 
    try {
      if (isLogin) {
        // ── LOGIN ──────────────────────────────────────────────────────────
        const response = await API.post('/auth/login', {
          email:    formData.email,
          password: formData.password,
        });
 
        const data = response.data;
 
        // Save all fields to localStorage so every page can read them
        localStorage.setItem('token',     data.token);
        localStorage.setItem('email',     data.email);
        localStorage.setItem('role',      data.role);
        localStorage.setItem('firstname', data.firstName);
        localStorage.setItem('lastname',  data.lastName);
 
        // Notify parent (App.tsx) of session
        onLoginSuccess({ email: data.email, token: data.token, role: data.role });
 
        // Redirect based on role
        if (data.role === 'THERAPIST') {
          navigate('/therapist-dashboard');
        } else {
          navigate('/dashboard');
        }
 
      } else {
        // ── REGISTER ───────────────────────────────────────────────────────
        const response = await API.post('/auth/register', {
          firstName: formData.firstName,
          lastName:  formData.lastName,
          email:     formData.email,
          password:  formData.password,
          role:      'USER',
          phone:     formData.phone,
        }, { responseType: 'text' });
 
        setMessage({
          text: response.data || 'Registration completed! Please log in.',
          isError: false
        });
        setIsLogin(true);
        setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '' });
      }
 
    } catch (error: any) {
      let errorText = 'Authentication failed. Please check your credentials.';
      if (error?.response?.data) {
        errorText = typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data.message || errorText;
      } else if (error?.message) {
        errorText = error.message;
      }
      setMessage({ text: errorText, isError: true });
    } finally {
      setLoading(false);
    }
  };
 
  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; overflow-x: hidden; font-family: 'Plus Jakarta Sans', sans-serif; background: #EBF7F4; color: #2C3E3B; }

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
        .cb-nav { display: flex; gap: 32px; margin-left: auto; margin-right: 40px; }
        .cb-nav a { font-size: 14px; color: #4A6360; transition: color .2s; font-weight: 500; text-decoration: none; }
        .cb-nav a:hover { color: #1D5F55; }

        .auth-page {
          min-height: 100vh; padding-top: 80px;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(circle at 10% 80%, #E0F5F0 0%, #EAF6F3 50%, #D8F0EA 100%);
          padding: 100px 5vw 60px;
        }

        .auth-form-wrap {
          width: 100%; max-width: 660px;
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 28px; padding: 44px 40px;
          box-shadow: 0 20px 60px rgba(21,66,60,0.06);
        }

        .auth-form-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.9);
          border-radius: 100px; padding: 5px 14px; font-size: 11px; font-weight: 600;
          color: #1D5F55; letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 16px; box-shadow: 0 4px 15px rgba(21,66,60,0.02);
        }
        .auth-form-title { font-size: clamp(24px,2.8vw,34px); font-weight: 700; color: #15423C; margin-bottom: 6px; line-height: 1.2; letter-spacing: -0.02em; }
        .auth-form-sub { font-size: 14px; color: #536C68; margin-bottom: 28px; }

        .auth-tabs {
          display: flex; background: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.7); border-radius: 14px;
          padding: 4px; margin-bottom: 24px; gap: 4px;
          backdrop-filter: blur(10px);
        }
        .auth-tab { flex: 1; padding: 10px; border-radius: 11px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #536C68; transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .auth-tab.active { background: #1D5F55; color: #fff; box-shadow: 0 4px 16px rgba(21,95,85,0.25); }

        .auth-msg { padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-bottom: 20px; }
        .auth-msg.error { background: rgba(229,57,53,0.08); color: #C53030; border: 1px solid rgba(229,57,53,0.2); }
        .auth-msg.success { background: rgba(52,160,146,0.08); color: #1D5F55; border: 1px solid rgba(52,160,146,0.2); }

        .auth-name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .auth-field { margin-bottom: 16px; }
        .auth-field.in-row { margin-bottom: 0; }

        .auth-label { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; color: #15423C; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 7px; }
        .auth-label a { font-size: 12px; font-weight: 500; color: #1D5F55; cursor: pointer; text-decoration: none; text-transform: none; letter-spacing: 0; }
        .auth-label a:hover { text-decoration: underline; }

        .auth-input-wrap { position: relative; }
        .auth-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #7A9E97; pointer-events: none; }
        .auth-input-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #7A9E97; cursor: pointer; background: none; border: none; padding: 0; display: flex; align-items: center; }
        .auth-input {
          width: 100%; padding: 12px 44px;
          background: rgba(255,255,255,0.55);
          border: 1.5px solid rgba(255,255,255,0.75);
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #15423C;
          transition: all .2s; outline: none;
          backdrop-filter: blur(8px);
        }
        .auth-input:focus { background: rgba(255,255,255,0.8); border-color: #1D5F55; box-shadow: 0 0 0 3px rgba(29,95,85,0.1); }
        .auth-input::placeholder { color: #7A9E97; }

        .auth-submit {
          width: 100%; padding: 14px;
          background: #1D5F55; color: #fff;
          border: none; border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all .25s ease; margin-top: 6px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 28px rgba(21,95,85,0.25);
        }
        .auth-submit:hover:not(:disabled) { background: #15423C; transform: translateY(-1px); box-shadow: 0 12px 36px rgba(21,95,85,0.3); }
        .auth-submit:disabled { opacity: .65; cursor: not-allowed; transform: none; }

        .auth-spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-switch { text-align: center; margin-top: 20px; font-size: 13.5px; color: #536C68; }
        .auth-switch button { background: none; border: none; color: #1D5F55; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; padding: 0 2px; }
        .auth-switch button:hover { text-decoration: underline; }

        .auth-divider { display: flex; align-items: center; gap: 14px; margin: 20px 0; color: #AEE4DB; font-size: 12px; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(174,228,219,0.4); }

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

        @media (max-width: 768px) {
          .cb-nav { display: none; }
          .auth-form-wrap { padding: 32px 24px; }
          .cb-footer-inner { flex-direction: column; align-items: flex-start; }
          .cb-footer-bottom { flex-direction: column; text-align: center; }
        }
        @media (max-width: 520px) {
          .auth-name-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HEADER */}
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

      {/* MAIN */}
      <div className="auth-page">
        <div className="auth-form-wrap">

          <div className="auth-form-badge">
            <Sparkles size={11} fill="currentColor" opacity={0.3} />
            {isLogin ? 'Welcome Back' : 'Join CareBridge'}
          </div>

          <h3 className="auth-form-title">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h3>
          <p className="auth-form-sub">
            {isLogin ? 'Continue your healing journey.' : 'Join thousands on their path to well-being.'}
          </p>

          {/* Tabs */}
          <div className="auth-tabs">
            <button type="button" className={`auth-tab${isLogin ? ' active' : ''}`} onClick={() => setIsLogin(true)}>Log In</button>
            <button type="button" className={`auth-tab${!isLogin ? ' active' : ''}`} onClick={() => setIsLogin(false)}>Sign Up</button>
          </div>

          {message.text && (
            <div className={`auth-msg${message.isError ? ' error' : ' success'}`}>{message.text}</div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Name row — signup only */}
            {!isLogin && (
              <div className="auth-name-row">
                <div className="auth-field in-row">
                  <div className="auth-label"><span>First Name</span></div>
                  <div className="auth-input-wrap">
                    <UserCheck size={15} className="auth-input-icon" />
                    <input type="text" required placeholder="Jane" name="firstName"
                      value={formData.firstName} onChange={handleInputChange} className="auth-input" />
                  </div>
                </div>
                <div className="auth-field in-row">
                  <div className="auth-label"><span>Last Name</span></div>
                  <div className="auth-input-wrap">
                    <UserCheck size={15} className="auth-input-icon" />
                    <input type="text" required placeholder="Doe" name="lastName"
                      value={formData.lastName} onChange={handleInputChange} className="auth-input" />
                  </div>
                </div>
              </div>
            )}

            <div className="auth-field">
              <div className="auth-label"><span>Email Address</span></div>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input type="email" required placeholder="name@example.com" name="email"
                  value={formData.email} onChange={handleInputChange} className="auth-input" />
              </div>
            </div>

            {/* Phone — signup only */}
            {!isLogin && (
              <div className="auth-field">
                <div className="auth-label"><span>Phone Number</span></div>
                <div className="auth-input-wrap">
                  <Phone size={15} className="auth-input-icon" />
                  <input type="tel" required placeholder="+94 77 123 4567" name="phone"
                    value={formData.phone} onChange={handleInputChange} className="auth-input" />
                </div>
              </div>
            )}

            <div className="auth-field">
              <div className="auth-label">
                <span>Password</span>
                {isLogin && <a href="#">Forgot password?</a>}
              </div>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input type={showPw ? 'text' : 'password'} required placeholder="••••••••" name="password"
                  value={formData.password} onChange={handleInputChange}
                  className="auth-input" style={{ paddingRight: 44 }} />
                <button type="button" className="auth-input-toggle" onClick={() => setShowPw(p => !p)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? <><div className="auth-spinner" />Processing…</>
                : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin
              ? <>Don't have an account? <button type="button" onClick={() => setIsLogin(false)}>Sign up free</button></>
              : <>Already have an account? <button type="button" onClick={() => setIsLogin(true)}>Log in</button></>}
          </div>

          <div className="auth-divider">or</div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#7A9E97', lineHeight: 1.65 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.<br />
            If you're in crisis, please call <strong style={{ color: '#1D5F55' }}>988</strong> immediately.
          </p>

        </div>
      </div>

      {/* FOOTER */}
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
            <div className="cb-footer-icon"><Mail size={15} color="#7A9E97" /></div>
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