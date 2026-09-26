import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Bot, Stethoscope, Search, Calendar, Video, FileText, Share2, Pill, Activity, AlertTriangle, Clock, MapPin, CheckCircle2, ChevronRight, Menu, X } from 'lucide-react';
import CareReadinessSearch from '../components/CareReadinessSearch';
import JourneyTracker from '../components/JourneyTracker';

export default function PatientDashboard({ onOpenAI, onStartTeleconsult, onOpenEmergency }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home'); // home | find_care | records | referrals | diagnostics
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/patient/dashboard/${user.id}`);
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Patient Welcome Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {t('patientRole')}
            </span>
            <span className="text-xs text-slate-400">{t('id')} {user?.id}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-100">
            {t('welcomeBack')} {user?.name || 'Ramesh Kumar'}
          </h1>
          <p className="text-xs text-slate-400 flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{user?.village || 'Rampur Village'}, Medak District, Telangana</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenEmergency}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center space-x-2 animate-pulse"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('emergency')}</span>
          </button>
        </div>
      </div>

      {/* Primary Action Buttons (Simple Non-Cluttered Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        
        <button
          onClick={onOpenAI}
          className="p-5 glass-panel rounded-2xl border border-emerald-500/30 hover:border-emerald-500 text-left transition-all hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <div className="font-heading font-bold text-sm text-slate-100">{t('aiAssistant')}</div>
          <div className="text-[11px] text-slate-400 mt-1">{t('checkSymptoms')}</div>
        </button>

        <button
          onClick={() => setActiveTab('find_care')}
          className="p-5 glass-panel rounded-2xl border border-slate-800 hover:border-teal-500 text-left transition-all hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <div className="font-heading font-bold text-sm text-slate-100">{t('findCare')}</div>
          <div className="text-[11px] text-slate-400 mt-1">{t('findHospitalsDesc')}</div>
        </button>

        <button
          onClick={() => onStartTeleconsult && onStartTeleconsult()}
          className="p-5 glass-panel rounded-2xl border border-slate-800 hover:border-cyan-500 text-left transition-all hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Video className="w-6 h-6" />
          </div>
          <div className="font-heading font-bold text-sm text-slate-100">{t('teleconsultation')}</div>
          <div className="text-[11px] text-slate-400 mt-1">{t('videoDoctorCall')}</div>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className="p-5 glass-panel rounded-2xl border border-slate-800 hover:border-indigo-500 text-left transition-all hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div className="font-heading font-bold text-sm text-slate-100">{t('myRecords')}</div>
          <div className="text-[11px] text-slate-400 mt-1">{t('recordsDesc')}</div>
        </button>

      </div>

      {/* OPD Queue Status Banner */}
      <div className="p-5 glass-panel rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Medak District Hospital {t('queueStatus')}</div>
            <div className="text-sm font-bold text-slate-100">{t('yourToken')} <span className="text-amber-400">#14</span> ({t('currentServing')} #11)</div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400">{t('estWaitTime')}</span>
          <div className="font-bold text-sm text-emerald-400">~25 {t('mins')}</div>
        </div>
      </div>

      {/* Active Tab Views */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Active Journey Tracker */}
          <JourneyTracker
            journey={dashboardData?.journey}
            request={dashboardData?.emergencyRequests?.[0]}
          />
        </div>
      )}

      {activeTab === 'find_care' && (
        <CareReadinessSearch
          onRequestHospital={(hosp) => {
            alert(`Pre-Travel Request sent to ${hosp.name}! Hospital staff notified for confirmation.`);
          }}
        />
      )}

      {activeTab === 'records' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="font-heading font-bold text-base text-slate-100">{t('healthPassport')}</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">{t('teleconsultRecord')} - 15 Aug 2026</span>
                <span className="text-slate-500">Dr. Anjali Sharma (Cardiology)</span>
              </div>
              <p className="text-xs text-slate-300">{t('diagnosis')} Stage 1 Essential Hypertension. Prescribed Telmisartan 40mg daily.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
