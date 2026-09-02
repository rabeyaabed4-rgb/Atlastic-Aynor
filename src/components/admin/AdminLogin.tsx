import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Key,
  User,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { AdminUser } from '../../types';

interface AdminLoginProps {
  onLoginSuccess: (admin: AdminUser) => void;
  onBackToShop: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToShop }) => {
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(true);

  // Login form state (STRICTLY NO HARDCODED DEFAULTS)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Setup form state
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    setIsCheckingAdmin(true);
    try {
      const res = await api.checkHasAdmin();
      setHasAdmin(res.hasAdmin);
    } catch {
      setHasAdmin(true); // Fallback to login if check fails
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.adminLogin({ email: email.trim(), password });
      onLoginSuccess(data.admin);
    } catch (err: any) {
      setError(err.message || 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য দিন।');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!setupName.trim() || setupName.trim().length < 2) {
      setError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }

    if (!setupEmail.trim() || !setupEmail.includes('@')) {
      setError('অনুগ্রহ করে সঠিক ইমেইল এড্রেস লিখুন।');
      return;
    }

    if (!setupPassword || setupPassword.length < 6) {
      setError('পাসওয়ার্ড অবশ্যই অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setError('দুইটি পাসওয়ার্ড মিলছে না। পুনরায় চেক করুন।');
      return;
    }

    setLoading(true);
    try {
      const data = await api.setupAdmin({
        name: setupName.trim(),
        email: setupEmail.trim(),
        password: setupPassword,
      });
      setSuccessMessage('সুপার অ্যাডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
      onLoginSuccess(data.admin);
    } catch (err: any) {
      setError(err.message || 'অ্যাডমিন অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
          <p className="text-xs">সুরক্ষা যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-rose-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Top */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-rose-600 to-rose-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-rose-900/40 mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {hasAdmin ? 'অ্যাডমিন প্যানেল লগইন' : 'প্রাথমিক অ্যাডমিন সেটআপ'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {hasAdmin
              ? 'পছন্দের শপ • সুরক্ষিত এডমিন ম্যানেজমেন্ট সিস্টেম'
              : 'সিস্টেমের প্রথম সুপার অ্যাডমিন অ্যাকাউন্ট তৈরি করুন'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="p-3.5 mb-5 bg-rose-950/70 border border-rose-800 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 mb-5 bg-emerald-950/70 border border-emerald-800 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {!hasAdmin ? (
            /* FIRST TIME SETUP FORM */
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>প্রথমবার সিস্টেম ইনিশিয়ালাইজেশন</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  ডাটাবেজে কোনো অ্যাডমিন নেই। প্রথম সুপার অ্যাডমিন হিসেবে আপনার লগইন তথ্য নির্ধারণ করুন।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  অ্যাডমিনের পূর্ণ নাম <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="setup-name-input"
                    type="text"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    placeholder="যেমন: সুপার অ্যাডমিন"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  অ্যাডমিন ইমেইল <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="setup-email-input"
                    type="email"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    placeholder="admin@yourdomain.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="setup-password-input"
                    type="password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  পাসওয়ার্ড নিশ্চিত করুন <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="setup-confirm-password-input"
                    type="password"
                    value={setupConfirmPassword}
                    onChange={(e) => setSetupConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                    required
                  />
                </div>
              </div>

              <button
                id="admin-setup-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>সুপার অ্যাডমিন তৈরি করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STANDARD LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  অ্যাডমিন ইমেইল
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="admin-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="আপনার অ্যাডমিন ইমেইল লিখুন"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="admin-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                    required
                  />
                </div>
              </div>

              <button
                id="admin-login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>লগইন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>সুরক্ষিত অ্যাডমিন অথেনটিকেশন ও বিসিপশন এনক্রিপশন</span>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Back to shop button */}
        <div className="text-center mt-6">
          <button
            onClick={onBackToShop}
            className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>কাস্টমার ল্যান্ডিং পেজে ফিরে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};

