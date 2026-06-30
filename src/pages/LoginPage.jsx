import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { sendOTP, verifyOTP } from '../modules/auth/authService';
import { auth } from '../config/firebase';
import { RecaptchaVerifier } from 'firebase/auth';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const verifierRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Initialize RecaptchaVerifier once on mount
  useEffect(() => {
    initRecaptcha();
    return () => {
      clearRecaptcha();
    };
  }, []);

  const initRecaptcha = () => {
    clearRecaptcha();
    try {
      verifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          // Re-initialize when expired
          initRecaptcha();
        },
      });
      // Pre-render so it's ready when user clicks
      verifierRef.current.render().catch(() => {});
    } catch (err) {
      // Ignore render errors — will retry on send
    }
  };

  const clearRecaptcha = () => {
    if (verifierRef.current) {
      try { verifierRef.current.clear(); } catch (_) {}
      verifierRef.current = null;
    }
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatPhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('01') && digits.length === 11) return `+88${digits}`;
    if (digits.startsWith('8801') && digits.length === 13) return `+${digits}`;
    return `+88${digits}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length !== 11 || !digits.startsWith('01')) {
      toast.error('সঠিক ১১ ডিজিটের ফোন নম্বর দিন (01XXXXXXXXX)');
      return;
    }

    setLoading(true);
    try {
      // If verifier is missing or expired, re-init
      if (!verifierRef.current) {
        initRecaptcha();
        // Small delay to let reCAPTCHA initialize
        await new Promise(r => setTimeout(r, 500));
      }

      const formattedPhone = formatPhoneNumber(phoneNumber);
      const result = await sendOTP(formattedPhone, verifierRef.current);

      if (result.success) {
        setConfirmationResult(result.confirmation);
        setStep('otp');
        setCountdown(60);
        setOtp('');
        toast.success(`${formattedPhone} নম্বরে OTP পাঠানো হয়েছে`);
      } else {
        toast.error(result.error || 'OTP পাঠাতে ব্যর্থ');
        // Re-init verifier for next attempt
        initRecaptcha();
      }
    } catch (error) {
      toast.error('কিছু সমস্যা হয়েছে, আবার চেষ্টা করুন');
      initRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('৬ ডিজিটের OTP দিন');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(confirmationResult, otp);
      if (result.success) {
        setStep('success');
        toast.success('লগইন সফল! 🎉');
        setTimeout(() => navigate(from, { replace: true }), 1500);
      } else {
        toast.error(result.error || 'OTP ভুল!');
      }
    } catch (error) {
      toast.error('ভেরিফিকেশন ব্যর্থ, আবার চেষ্টা করুন');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    try {
      initRecaptcha();
      await new Promise(r => setTimeout(r, 500));
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const result = await sendOTP(formattedPhone, verifierRef.current);
      if (result.success) {
        setConfirmationResult(result.confirmation);
        setCountdown(60);
        setOtp('');
        toast.success('OTP আবার পাঠানো হয়েছে');
      } else {
        toast.error(result.error || 'OTP পাঠাতে ব্যর্থ');
        initRecaptcha();
      }
    } catch (err) {
      toast.error('কিছু সমস্যা হয়েছে');
      initRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = () => {
    setStep('phone');
    setOtp('');
    setConfirmationResult(null);
    initRecaptcha();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
              <span className="text-4xl">🛒</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">হাইপারলোকাল বাজার</h1>
            <p className="text-gray-500 text-sm mt-1">আপনার আশেপাশের সবচেয়ে trusted বাজার</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'phone' ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-600'}`}>1</div>
            <div className={`w-12 h-0.5 ${step !== 'phone' ? 'bg-primary-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'otp' ? 'bg-primary-500 text-white' : step === 'success' ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-400'}`}>2</div>
            <div className={`w-12 h-0.5 ${step === 'success' ? 'bg-primary-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'success' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>3</div>
          </div>

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">ফোন নম্বর দিন</h2>
                <p className="text-sm text-gray-500 mb-4">OTP পাঠানো হবে এই নম্বরে</p>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="01XXXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  leftIcon={<Phone size={18} className="text-gray-400" />}
                  maxLength={11}
                  helperText="১১ ডিজিটের নম্বর (যেমন: 01712345678)"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} rightIcon={<ArrowRight size={18} />}>
                OTP পাঠান
              </Button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">OTP ভেরিফাই করুন</h2>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-700">{formatPhoneNumber(phoneNumber)}</span> নম্বরে ৬ ডিজিটের কোড পাঠানো হয়েছে
                </p>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="_ _ _ _ _ _"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  leftIcon={<Shield size={18} className="text-gray-400" />}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <div className="mt-4 text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">আবার পাঠাতে অপেক্ষা করুন ({countdown}s)</p>
                  ) : (
                    <button type="button" onClick={handleResendOTP} disabled={loading}
                      className="text-sm text-primary-600 font-medium hover:underline disabled:opacity-50">
                      OTP আবার পাঠান
                    </button>
                  )}
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                ভেরিফাই করুন
              </Button>
              <button type="button" onClick={handleChangePhone}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
                ← নম্বর পরিবর্তন করুন
              </button>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">স্বাগতম! 🎉</h2>
              <p className="text-gray-500">আপনাকে হাইপারলোকাল বাজারে স্বাগতম</p>
            </div>
          )}
        </div>
      </div>

      {/* Invisible reCAPTCHA — must stay in DOM always */}
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, left: 0 }} />

      <div className="py-4 text-center text-xs text-gray-400">
        লগইন করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন
      </div>
    </div>
  );
};

export default LoginPage;
