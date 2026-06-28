import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Shield, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { sendOTP, verifyOTP, resetRecaptcha } from '../services/authService';
import { useAuthContext } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef([]);
  // Stable ref for reCAPTCHA container - never changes between renders
  const recaptchaContainerRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Format phone number
  const formatPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (cleaned.startsWith('88')) cleaned = cleaned.substring(2);
    return `+88${cleaned}`;
  };

  const isValidPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return /^(01[3-9]\d{8}|8801[3-9]\d{8})$/.test(cleaned);
  };

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isValidPhone(phoneNumber)) {
      setError('সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)');
      setLoading(false);
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      // Pass the actual DOM element ref, not an ID string
      await sendOTP(formattedPhone, recaptchaContainerRef.current);

      setStep(2);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.message || 'OTP পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;

    setError('');
    setLoading(true);
    setCanResend(false);
    setCountdown(60);

    try {
      resetRecaptcha();
      const formattedPhone = formatPhoneNumber(phoneNumber);
      await sendOTP(formattedPhone, recaptchaContainerRef.current);
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'OTP পুনরায় পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = otpCode.split('');
    newOtp[index] = value;
    const joined = newOtp.join('');
    setOtpCode(joined);
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtpCode(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    otpInputsRef.current[focusIndex]?.focus();
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otpCode.length !== 6) {
      setError('৬ ডিজিটের OTP কোড দিন');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOTP(otpCode);
      await login(result.user);
      setStep(3);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'ভুল OTP। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">

      {/* 
        CRITICAL: reCAPTCHA container must be in DOM at all times.
        It is positioned off-screen and never removed by React.
        Using useRef ensures we pass the actual DOM element to Firebase.
      */}
      <div
        ref={recaptchaContainerRef}
        style={{
          position: 'fixed',
          bottom: '-100px',
          left: '0',
          opacity: '0',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            হাইপারলোকাল বাজার
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            আপনার এলাকার সেরা বাজার
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 mx-2 transition-colors ${step > s ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-700'
                  }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6">

          {/* Step 1: Phone */}
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primaryLight dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  মোবাইল নম্বর দিন
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  OTP পাঠানো হবে এই নম্বরে
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                    🇧🇩 +88
                  </span>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01712345678"
                    className="pl-20"
                    maxLength={11}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                  icon={!loading && <ArrowRight className="w-4 h-4" />}
                >
                  {loading ? 'OTP পাঠানো হচ্ছে...' : 'OTP পাঠান'}
                </Button>

                <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  reCAPTCHA দ্বারা সুরক্ষিত
                </p>
              </div>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primaryLight dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  OTP কোড দিন
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {formatPhoneNumber(phoneNumber)} নম্বরে ৬ ডিজিটের কোড পাঠানো হয়েছে
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputsRef.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpCode[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      disabled={loading}
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={otpCode.length !== 6 || loading}
                >
                  {loading ? 'যাচাই করা হচ্ছে...' : 'যাচাই করুন'}
                </Button>

                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm text-primary hover:text-primaryDark font-medium inline-flex items-center gap-1"
                      disabled={loading}
                    >
                      <RefreshCw className="w-3 h-3" />
                      OTP আবার পাঠান
                    </button>
                  ) : (
                    <p className="text-sm text-neutral-400 dark:text-neutral-500">
                      {countdown} সেকেন্ড পর আবার পাঠাতে পারবেন
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpCode('');
                    setError('');
                    resetRecaptcha();
                  }}
                  className="w-full text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  নম্বর পরিবর্তন করুন
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                সফলভাবে লগইন হয়েছে!
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400">
                হোমপেজে নিয়ে যাওয়া হচ্ছে...
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-6">
          লগইন করার মাধ্যমে আমাদের{' '}
          <a href="#" className="text-primary hover:underline">শর্তাবলী</a>
          {' '}এবং{' '}
          <a href="#" className="text-primary hover:underline">গোপনীয়তা নীতি</a>
          {' '}মেনে নিচ্ছেন
        </p>
      </div>
    </div>
  );
};

export default LoginPage;