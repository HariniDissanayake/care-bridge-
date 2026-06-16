import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import TherapistRegister from './pages/TherapistRegister';
import FindTherapist from './pages/FindTherapist';
import TherapistListing from './pages/TherapistListing';
import TherapistDetail from './pages/TherapistDetail';
import BookingCheckout from './pages/BookingCheckout';
import BookingConfirmation from './pages/BookingConfirmation';
import UserDashboard from './pages/UserDashboard';

interface SessionData {
  email: string;
  token: string;
  role: string;
}

function App() {
  const [session, setSession] = useState<SessionData | null>(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role  = localStorage.getItem('role');
    if (token && email && role) return { email, token, role };
    return null;
  });

  const handleLoginSuccess = (newSession: SessionData) => {
    setSession(newSession);
  };

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"                          element={<Landing />} />
        <Route path="/about"                     element={<AboutUs />} />
        <Route path="/contact"                   element={<Contact />} />
        <Route path="/register-therapist"        element={<TherapistRegister />} />
        <Route path="/find-therapist"            element={<FindTherapist />} />
        <Route path="/therapists/:category"      element={<TherapistListing />} />
        <Route path="/therapists/profile/:id"    element={<TherapistDetail />} />

        {/* Booking flow */}
        <Route path="/booking/checkout"                      element={<BookingCheckout />} />
        <Route path="/booking/confirmation/:bookingId"       element={<BookingConfirmation />} />
        <Route path="/booking/cancelled"                     element={<BookingConfirmation />} />
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* Auth */}
        <Route path="/auth" element={<Auth onLoginSuccess={handleLoginSuccess} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;