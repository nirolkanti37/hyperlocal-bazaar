import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { loginWithEmail, registerWithEmail, resetPassword } from '../modules/auth/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

// Utility function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function to sanitize error messages (XSS Protection)
const sanitizeErrorMessage = (message) => {
  if (typeof message !== 'string') return 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।';
  // Remove any HTML tags and limit length
  return message
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, 200);
};

// Utility function to get safe redirect path
// Prevents open redirect vulnerabilities
const getSafeRedirectPath = (pathname) => {
  // List of allowed redirect paths
  const allowedPaths = ['/', '/home', '/sell', '/product', '/search', '/chat', '/profile'];
  
  // Check if path is allowed
  if (pathname && allowedPaths.some(path => pathname.startsWith(path))) {
    return pathname;
  }
  
  // Default to home if path is suspicious or not in whitelist
  return '/';
};

const LoginPage = () => {
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  // Separate password visibility states for each form
  const [showPassLogin, setShowPassLogin] = useState(false);
  const [showPassRegister, setShowPassRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  // Get safe redirect path - prevents open redirect vulnerability
  const from = getSafeRedirectPath(location.state?.from?.pathname);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate inputs with trimming
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      toast.error('ইমেইল ও পাসওয়ার্ড দিন');
      return;
    }
    
    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      toast.error('সঠিক ইমেইল ঠিকানা দিন');
      return;
    }
    
    setLoading(true);
    const result = await loginWithEmail(trimmedEmail, trimmedPassword);
    setLoading(false);
    
    if (result.success) {
      toast.success('লগইন সফল! 🎉');
      setView('success');
      // Use safe redirect path
      setTimeout(() => navigate(from, { replace: true }), 1200);
    } else {
      toast.error(sanitizeErrorMessage(result.error));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate inputs with trimming
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedName) {
      toast.error('আপনার নাম দিন');
      return;
    }
    
    if (!trimmedEmail) {
      toast.error('ইমেইল দিন');
      return;
    }
    
    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      toast.error('সঠিক ইমেইল ঠিকানা দিন');
      return;
    }
    
    if (trimmedPassword.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    
    setLoading(true);
    const result = await registerWithEmail(trimmedEmail, trimmedPassword, trimmedName);
    setLoading(false);
    
    if (result.success) {
      toast.success('অ্যাকাউন্ট তৈরি হয়েছে! 🎉');
      setView('success');
      // Use safe redirect path
      setTimeout(() => navigate(from, { replace: true }), 1200);
    } else {
      toast.error(sanitizeErrorMessage(result.error));
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    
    // Validate email with trimming
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      toast.error('ইমেইল দিন');
      return;
    }
    
    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      toast.error('সঠিক ইমেইল ঠিকানা দিন');
      return;
    }
    
    setLoading(true);
    const result = await resetPassword(trimmedEmail);
    setLoading(false);
    
    if (result.success) {
      toast.success('পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!');
      setView('login');
      setEmail('');
    } else {
      toast.error(sanitizeErrorMessage(result.error));
    }
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

          {/* Success */}
          {view === 'success' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">স্বাগতম! 🎉</h2>
              <p className="text-gray-500">হাইপারলোকাল বাজারে আপনাকে স্বাগতম</p>
            </div>
          )}

          {/* Login */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">লগইন করুন</h2>
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="আপনার ইমেইল"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    leftIcon={<Mail size={18} className="text-gray-400" />}
                    autoComplete="email"
                  />
                  <div className="relative">
                    <Input
                      type={showPassLogin ? 'text' : 'password'}
                      placeholder="পাসওয়ার্ড"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      leftIcon={<Lock size={18} className="text-gray-400" />}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassLogin(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassLogin ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                    >
                      {showPassLogin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setView('reset')}
                  className="mt-3 text-sm text-primary-600 hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} rightIcon={<ArrowRight size={18} />}>
                লগইন করুন
              </Button>
              <p className="text-center text-sm text-gray-500">
                অ্যাকাউন্ট নেই?{' '}
                <button type="button" onClick={() => setView('register')} className="text-primary-600 font-semibold hover:underline">
                  নিবন্ধন করুন
                </button>
              </p>
            </form>
          )}

          {/* Register */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">নতুন অ্যাকাউন্ট</h2>
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="আপনার নাম"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    leftIcon={<User size={18} className="text-gray-400" />}
                    autoComplete="name"
                  />
                  <Input
                    type="email"
                    placeholder="আপনার ইমেইল"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    leftIcon={<Mail size={18} className="text-gray-400" />}
                    autoComplete="email"
                  />
                  <div className="relative">
                    <Input
                      type={showPassRegister ? 'text' : 'password'}
                      placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      leftIcon={<Lock size={18} className="text-gray-400" />}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassRegister(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassRegister ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                    >
                      {showPassRegister ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} rightIcon={<ArrowRight size={18} />}>
                অ্যাকাউন্ট তৈরি করুন
              </Button>
              <p className="text-center text-sm text-gray-500">
                আগেই অ্যাকাউন্ট আছে?{' '}
                <button type="button" onClick={() => setView('login')} className="text-primary-600 font-semibold hover:underline">
                  লগইন করুন
                </button>
              </p>
            </form>
          )}

          {/* Password Reset */}
          {view === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">পাসওয়ার্ড রিসেট</h2>
                <p className="text-sm text-gray-500 mb-4">ইমেইলে রিসেট লিংক পাঠানো হবে</p>
                <Input
                  type="email"
                  placeholder="আপনার ইমেইল"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  leftIcon={<Mail size={18} className="text-gray-400" />}
                  autoComplete="email"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} rightIcon={<ArrowRight size={18} />}>
                রিসেট লিংক পাঠান
              </Button>
              <button type="button" onClick={() => setView('login')} className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
                ← লগইনে ফিরে যান
              </button>
            </form>
          )}

        </div>
      </div>
      <div className="py-4 text-center text-xs text-gray-400">
        লগইন করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন
      </div>
    </div>
  );
};

export default LoginPage;
