import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Users, HeartPulse, UserPlus, PhoneCall, Truck, Wifi, WifiOff, AlertCircle, CheckCircle2, Bot } from 'lucide-react';

export default function AshaDashboard({ onOpenAI, onStartTeleconsult }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [offlineMode, setOfflineMode] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', mobile: '', village: 'Rampur', condition: '' });
  const [patients, setPatients] = useState([
    { id: 'pat_1', name: 'Ramesh Kumar', age: 42, category: 'Chronic Hypertension', risk: 'Medium', lastVisit: '15 Aug 2026' },
    { id: 'pat_2', name: 'Lakshmi Bai', age: 26, category: 'High-Risk Pregnancy (Trimester 3)', risk: 'HIGH RISK', lastVisit: '01 Sep 2026' },
    { id: 'pat_3', name: 'Sammiah', age: 68, category: 'Type 2 Diabetes', risk: 'Medium', lastVisit: '20 Aug 2026' },
    { id: 'pat_4', name: 'Baby Anusha', age: 1.5, category: 'Routine Immunization', risk: 'Low Risk', lastVisit: '28 Aug 2026' }
  ]);

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatient.name) return;
    const added = {
      id: `pat_${Date.now()}`,
      name: newPatient.name,
      age: newPatient.age || 30,
      category: newPatient.condition || 'General Evaluation',
      risk: 'Low Risk',
      lastVisit: new Date().toLocaleDateString()
    };
    setPatients([added, ...patients]);
    setShowRegisterModal(false);
    setNewPatient({ name: '', age: '', mobile: '', village: 'Rampur', condition: '' });
  };

  return (
    <div className="space-y-6">
      
      {/* ASHA Welcome Header & Offline Sync Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {t('ashaRole')}
            </span>
            <span className="text-xs text-slate-400">{t('assignedArea')}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-100">
            {user?.name || 'Sunitha Devi'} (ASHA)
          </h1>
          <p className="text-xs text-slate-400">{t('assignedAreaSubtext')}</p>
        </div>

        {/* Offline Mode Toggle (Part 48) */}
        <div className="flex items-center space-x-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setOfflineMode(!offlineMode)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${offlineMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}
          >
            {offlineMode ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
            <span>{offlineMode ? t('offlineModeActive') : t('onlineSynced')}</span>
          </button>
        </div>
      </div>

      {/* ASHA Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 glass-panel rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">{t('assignedPatients')}</div>
          <div className="font-heading font-extrabold text-2xl text-slate-100 mt-1">142</div>
        </div>
        <div className="p-4 glass-panel rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center">
          <div className="text-xs text-amber-300 font-medium">{t('highRiskMaternal')}</div>
          <div className="font-heading font-extrabold text-2xl text-amber-400 mt-1">4 {t('cases')}</div>
        </div>
        <div className="p-4 glass-panel rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">{t('chronicDiseases')}</div>
          <div className="font-heading font-extrabold text-2xl text-cyan-400 mt-1">11 {t('cases')}</div>
        </div>
        <div className="p-4 glass-panel rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">{t('pendingFollowUps')}</div>
          <div className="font-heading font-extrabold text-2xl text-emerald-400 mt-1">3 {t('today')}</div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('registerNewPatient')}</span>
        </button>

        <button
          onClick={onOpenAI}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center space-x-2"
        >
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>{t('assistTriageAi')}</span>
        </button>

        <button
          onClick={onStartTeleconsult}
          className="px-4 py-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center space-x-2"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{t('startAssistedTeleconsult')}</span>
        </button>
      </div>

      {/* Patient Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-100">{t('registerVillagePatient')}</h3>
            <form onSubmit={handleRegisterPatient} className="space-y-3">
              <input
                type="text"
                placeholder={t('fullName')}
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder={t('age')}
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  className="px-3 py-2 rounded-xl glass-input text-xs"
                />
                <input
                  type="text"
                  placeholder={t('mobileNumber')}
                  value={newPatient.mobile}
                  onChange={(e) => setNewPatient({ ...newPatient, mobile: e.target.value })}
                  className="px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
              <input
                type="text"
                placeholder={t('conditionPlaceholder')}
                value={newPatient.condition}
                onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  {t('saveRegistration')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assigned Patients Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-100">{t('villagePatientsTitle')}</h3>
        <div className="space-y-2">
          {patients.map((pat, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-200 flex items-center space-x-2">
                  <span>{pat.name} ({pat.age} {t('years')})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pat.risk === 'HIGH RISK' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {pat.risk}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{pat.category} • {t('lastVisited')} {pat.lastVisit}</div>
              </div>
              <button
                onClick={onStartTeleconsult}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 font-semibold text-xs"
              >
                {t('teleconsultation')}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
