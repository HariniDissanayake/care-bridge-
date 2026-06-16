import { Link } from 'react-router-dom';
import { HeartHandshake, Mail, Share2, Globe } from 'lucide-react';

const T = {
  teal700: '#155F5A', teal600: '#1D7A72', teal500: '#2A9D8F',
  teal200: '#A8DADA', teal100: '#C2EBE0', teal50: '#E8F5F2',
  gray900: '#1A2220', gray600: '#5A6462', gray400: '#8A9492', white: '#FFFFFF',
};

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        /* ══ FOOTER ══ */
        .cb-footer { width: 100%; background: #1A2220; padding: 64px 7vw 28px; }
        .cb-footer-top { display: flex; gap: 48px; flex-wrap: wrap; margin-bottom: 48px; }
        .cb-footer-brand { flex: 2; min-width: 200px; }
        .cb-footer-brand-name { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .cb-footer-brand-name span { color: #fff; font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; }
        .cb-footer-brand p { font-size: 13.5px; color: #4A7A72; line-height: 1.75; max-width: 240px; margin-bottom: 20px; font-family: 'DM Sans', sans-serif; }
        .cb-footer-col { flex: 1; min-width: 120px; }
        .cb-footer-col h4 { font-size: 10.5px; font-weight: 600; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 18px; font-family: 'DM Sans', sans-serif; }
        .cb-footer-col a { display: block; font-size: 13.5px; color: #4A7A72; margin-bottom: 11px; cursor: pointer; transition: color .2s; text-decoration: none; font-family: 'DM Sans', sans-serif; }
        .cb-footer-col a:hover { color: #A8DADA; }
        .cb-footer-connect { display: flex; gap: 10px; }
        .cb-footer-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s, border-color .2s;
        }
        .cb-footer-icon:hover { background: rgba(42,157,143,.22); border-color: rgba(42,157,143,.4); }
        .cb-footer-bottom {
          border-top: 1px solid #243230; padding-top: 24px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px; font-size: 12px; color: #2E5250; font-family: 'DM Sans', sans-serif;
        }
        .cb-footer-links { display: flex; gap: 20px; }
        .cb-footer-links a { color: #2E5250; text-decoration: none; transition: color .2s; }
        .cb-footer-links a:hover { color: #4A7A72; }

        @media (max-width: 768px) {
          .cb-footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <footer className="cb-footer">
        <div className="cb-footer-top">
          <div className="cb-footer-brand">
            <div className="cb-footer-brand-name">
              <HeartHandshake size={18} color={T.teal500} />
              <span>CareBridge</span>
            </div>
            <p>Building a future where digital serenity is accessible to everyone. Your mental well-being is our priority.</p>
            <div className="cb-footer-connect">
              <div className="cb-footer-icon"><Share2 size={15} color="#4A7A72" /></div>
              <div className="cb-footer-icon"><Mail size={15} color="#4A7A72" /></div>
              <div className="cb-footer-icon"><Globe size={15} color="#4A7A72" /></div>
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
            <div style={{ color: '#4A7A72', fontSize: '13.5px', marginTop: '4px' }}>
              San Francisco, CA
            </div>
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
