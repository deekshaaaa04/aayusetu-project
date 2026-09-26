import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, Languages, Mic, User, LogOut, AlertTriangle, ShieldCheck, ChevronDown, Menu, X, Check } from 'lucide-react';

export default function Header({ onOpenAI, onOpenEmergency, activeTab, setActiveTab }) {
  const { user, demoAccounts, loginWithRole, logout } = useAuth();
  const { currentLang, setLanguage, languages, t } = useLanguage();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingSwitchAcc, setPendingSwitchAcc] = useState(null);

  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  // Click outside to close dropdowns without changing role
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'PATIENT': return { label: t('patientRole') || 'Patient', icon: '🧑‍🤝‍🧑', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'DOCTOR': return { label: t('doctorRole') || 'Doctor', icon: '👨‍⚕️', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'ASHA_WORKER': return { label: t('ashaRole') || 'ASHA / Health Worker', icon: '👩‍⚕️', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'HOSPITAL_STAFF': return { label: t('staffRole') || 'Hospital Staff', icon: '🏥', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
      case 'HOSPITAL_ADMIN': return { label: t('adminRole') || 'Hospital Admin', icon: '🏥', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'GOVERNMENT': return { label: t('govtRole') || 'Government', icon: '🏛️', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      default: return { label: role, icon: '👤', color: 'bg-slate-700 text-slate-300' };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;

  // 1. OPENING / TOGGLING THE ROLE MENU ONLY (Never changes role)
  const handleRoleMenuClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowRoleDropdown(prev => !prev);
  };

  // 2. EXPLICITLY SELECTING A ROLE FROM THE OPENED MENU
  const handleRoleChange = (acc, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!acc || acc.role === user?.role) {
      // Currently active role clicked: close menu without prompt or role state change
      setShowRoleDropdown(false);
      return;
    }
    // Show confirmation dialog for switching to a different role
    setPendingSwitchAcc(acc);
  };

  const confirmRoleSwitch = () => {
    if (pendingSwitchAcc) {
      loginWithRole(pendingSwitchAcc.role);
      setPendingSwitchAcc(null);
      setShowRoleDropdown(false);
      setMobileMenuOpen(false);
    }
  };

  const cancelRoleSwitch = () => {
    setPendingSwitchAcc(null);
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                {t('appTitle')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="hidden lg:flex items-center space-x-3">
          
          {/* AI Assistant Quick Trigger */}
          <button
            type="button"
            onClick={onOpenAI}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-medium text-xs transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t('aiAssistant')}</span>
          </button>

          {/* Emergency 108 Trigger */}
          <button
            type="button"
            onClick={onOpenEmergency}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all animate-pulse"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('emergency')}</span>
          </button>

          {/* Multilingual Selector */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium"
            >
              <Languages className="w-4 h-4 text-teal-400" />
              <span>{languages.find(l => l.code === currentLang)?.native || 'English'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl shadow-2xl py-2 z-50 max-h-64 overflow-y-auto border border-slate-700">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('selectLanguage')}
                </div>
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 ${currentLang === lang.code ? 'text-emerald-400 font-semibold bg-emerald-500/10' : 'text-slate-300'}`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] text-slate-500">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleRoleMenuClick}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${badge?.color}`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('role')} {badge?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl py-2 z-50 border border-slate-700">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                  {t('selectRole')}
                </div>
                <div className="divide-y divide-slate-800/60">
                  {demoAccounts.map(acc => {
                    const roleMeta = getRoleBadge(acc.role);
                    const isActive = user?.role === acc.role;

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={(e) => handleRoleChange(acc, e)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-800/80 transition-colors flex items-center justify-between ${isActive ? 'bg-slate-800/70 text-emerald-400 font-semibold' : 'text-slate-200'}`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-base">{roleMeta.icon}</span>
                          <div>
                            <div className="font-semibold text-slate-100">{roleMeta.label}</div>
                            <div className="text-[10px] text-slate-400">{acc.name} • {acc.specialty || acc.village || 'Medak'}</div>
                          </div>
                        </div>
                        {isActive && (
                          <div className="flex items-center space-x-1 text-emerald-400">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="lg:hidden flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenEmergency}
            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs"
          >
            108
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-slate-400">{t('loggedInAs')} <strong className="text-slate-200">{user?.name}</strong></span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${badge?.color}`}>{badge?.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => { onOpenAI(); setMobileMenuOpen(false); }}
              className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold text-center border border-emerald-500/30"
            >
              {t('aiAssistant')}
            </button>
            <button
              type="button"
              onClick={() => { onOpenEmergency(); setMobileMenuOpen(false); }}
              className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold text-center"
            >
              {t('emergency')}
            </button>
          </div>

          <div className="pt-2 text-xs font-semibold text-slate-400">{t('switchRole')}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {demoAccounts.map(acc => {
              const roleMeta = getRoleBadge(acc.role);
              const isActive = user?.role === acc.role;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={(e) => handleRoleChange(acc, e)}
                  className={`p-2 text-left rounded text-xs bg-slate-800/80 border flex items-center justify-between ${isActive ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-slate-700 text-slate-300'}`}
                >
                  <span>{roleMeta.icon} {roleMeta.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Switch Confirmation Modal */}
      {pendingSwitchAcc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-5 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto text-2xl">
              {getRoleBadge(pendingSwitchAcc.role).icon}
            </div>
            
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-100">
                {t('switchPrompt')}: {badge?.label} ➔ {getRoleBadge(pendingSwitchAcc.role).label}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('switchDesc')}
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={cancelRoleSwitch}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmRoleSwitch}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
