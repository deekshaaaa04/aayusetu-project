import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, ShieldCheck, User, Lock, Phone, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const { demoAccounts, loginWithRole, loginWithCredentials, loading } = useAuth();
  const { t } = useLanguage();
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [role, setRole] = useState('PATIENT');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await loginWithCredentials(mobile, otp, null, role);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Mesh Gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <Activity className="w-9 h-9 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-slate-100 tracking-tight">
              {t('appTitle')}
            </h1>
            <p className="text-sm font-semibold text-emerald-400 mt-1">
              {t('ruralHealthcarePlatform')}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              "{t('tagline')}"
            </p>
          </div>
        </div>

        {/* Demo One-Click Role Selector Cards */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{t('selectDemoAccount')}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => loginWithRole(acc.role)}
                className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all hover:scale-[1.02] group"
              >
                <div className="font-bold text-xs text-slate-100 group-hover:text-emerald-400 flex items-center justify-between">
                  <span>{acc.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                  {t(acc.role === 'PATIENT' ? 'patientRole' : acc.role === 'DOCTOR' ? 'doctorRole' : acc.role === 'ASHA_WORKER' ? 'ashaRole' : acc.role === 'HOSPITAL_STAFF' ? 'staffRole' : acc.role === 'HOSPITAL_ADMIN' ? 'adminRole' : 'govtRole')}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{acc.specialty || acc.village || acc.designation}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile & OTP Auth Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-md mx-auto space-y-4">
          <h2 className="font-heading font-bold text-sm text-slate-200 text-center">{t('roleBasedLogin')}</h2>
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t('selectRole')}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="PATIENT">{t('patientRole')}</option>
                <option value="DOCTOR">{t('doctorRole')}</option>
                <option value="ASHA_WORKER">{t('ashaRole')}</option>
                <option value="HOSPITAL_STAFF">{t('staffRole')}</option>
                <option value="HOSPITAL_ADMIN">{t('adminRole')}</option>
                <option value="GOVERNMENT">{t('govtRole')}</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t('mobileNumber')}</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                placeholder={t('mobilePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t('otpLabel')}</label>
              <input
                type="password"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                placeholder={t('otpPlaceholder')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              <span>{loading ? t('authenticating') : t('signIn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
