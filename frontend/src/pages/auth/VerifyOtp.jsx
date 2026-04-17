import React, { useContext, useEffect, useMemo, useState } from 'react';
import './VerifyOtp.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const VerifyOtp = () => {
  const { URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = useMemo(() => {
    return location.state?.email || localStorage.getItem('pendingVerifyEmail') || '';
  }, [location.state?.email]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchOtpStatus = async (targetEmail) => {
    const safeEmail = String(targetEmail || '').trim();
    if (!safeEmail) {
      setRemainingSeconds(0);
      return;
    }

    try {
      const res = await axios.post(
        `${URL}/api/user/otp-status`,
        { email: safeEmail },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const nextSeconds = Number(res?.data?.remainingSeconds || 0);
      setRemainingSeconds(nextSeconds > 0 ? nextSeconds : 0);
      setStatusMessage(
        nextSeconds > 0
          ? ''
          : 'OTP expired or not found. Click "Resend OTP" to get a new one.'
      );
    } catch (error) {
      setStatusMessage('Could not sync OTP timer from server.');
    }
  };

  useEffect(() => {
    fetchOtpStatus(email);
    const timer = setInterval(() => {
      fetchOtpStatus(email);
    }, 1000);

    return () => clearInterval(timer);
  }, [email]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim()) {
      alert('Please enter both email and OTP');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `${URL}/api/user/verify-otp`,
        { email: email.trim(), otp: otp.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = res?.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.removeItem('pendingVerifyEmail');

      alert(res?.data?.message || 'Email verified successfully');
      navigate('/');
      window.location.reload();
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      alert(backendMessage || `Verification failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      alert('Please enter your email first');
      return;
    }

    try {
      setIsResending(true);
      const res = await axios.post(
        `${URL}/api/user/resend-otp`,
        { email: email.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      localStorage.setItem('pendingVerifyEmail', email.trim());
      await fetchOtpStatus(email.trim());
      alert(res?.data?.message || 'OTP resent successfully');
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      alert(backendMessage || `Resend failed: ${error.message}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-otp-page">
      <form className="verify-otp-card" onSubmit={handleVerify}>
        <h2>Verify OTP</h2>
        <p>Enter the OTP sent to your email to complete signup.</p>

        <label htmlFor="verify-email">Email</label>
        <input
          id="verify-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <label htmlFor="verify-otp">OTP</label>
        <input
          id="verify-otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="6-digit OTP"
        />

        <p className="otp-timer-text">
          OTP expires in: <strong>{formatTime(remainingSeconds)}</strong>
        </p>
        {statusMessage ? <p className="otp-status-text">{statusMessage}</p> : null}

        <button className="verify-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button
          className="resend-btn"
          type="button"
          onClick={handleResend}
          disabled={isResending || remainingSeconds > 0}
        >
          {isResending
            ? 'Resending...'
            : remainingSeconds > 0
              ? `Resend OTP in ${formatTime(remainingSeconds)}`
              : 'Resend OTP'}
        </button>

        <button
          className="back-login-btn"
          type="button"
          onClick={() => navigate('/login')}
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
