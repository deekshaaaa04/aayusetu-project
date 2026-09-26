import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Activity, Users, Bed, Save, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function HospitalAdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [hospital, setHospital] = useState({
    name: 'Medak District Area Hospital',
    emergencyStatus: 'ACCEPTING', // ACCEPTING | LIMITED | NOT_ACCEPTING
    icuBedsTotal: 15,
    icuBedsAvailable: 6,
    generalBedsTotal: 120,
    generalBedsAvailable: 34
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateStatus = async () => {
    try {
      const hospId = user?.hospitalId || 'hosp_medak_dist';
      const res = await fetch('/api/hospital/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospId,
          emergencyStatus: hospital.emergencyStatus,
          icuBedsAvailable: hospital.icuBedsAvailable,
          generalBedsAvailable: hospital.generalBedsAvailable
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {t('adminRole')}
            </span>
            <span className="text-xs text-slate-400">{t('medicalSuperintendent')}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-100">
            {hospital.name}
          </h1>
          <p className="text-xs text-slate-400">{t('adminPortalDesc')}</p>
        </div>

        <button
          onClick={handleUpdateStatus}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{t('saveReadiness')}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{t('readinessSavedNotice')}</span>
        </div>
      )}

      {/* Emergency Status Controls (Part 24 & Part 26) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-100 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span>{t('emergencyDeptReadinessControl')}</span>
        </h3>
        <p className="text-xs text-slate-400">
          {t('notAcceptingDesc')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <button
            onClick={() => setHospital({ ...hospital, emergencyStatus: 'ACCEPTING' })}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${hospital.emergencyStatus === 'ACCEPTING' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            <div>
              <div className="font-bold text-sm">🟢 {t('acceptingEmergencies')}</div>
              <div className="text-[10px] opacity-80 mt-1">{t('acceptingSubtext')}</div>
            </div>
          </button>

          <button
            onClick={() => setHospital({ ...hospital, emergencyStatus: 'LIMITED' })}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${hospital.emergencyStatus === 'LIMITED' ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            <div>
              <div className="font-bold text-sm">🟡 {t('limitedCapacity')}</div>
              <div className="text-[10px] opacity-80 mt-1">{t('limitedSubtext')}</div>
            </div>
          </button>

          <button
            onClick={() => setHospital({ ...hospital, emergencyStatus: 'NOT_ACCEPTING' })}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${hospital.emergencyStatus === 'NOT_ACCEPTING' ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            <div>
              <div className="font-bold text-sm">🔴 {t('notAccepting')}</div>
              <div className="text-[10px] opacity-80 mt-1">{t('notAcceptingSubtext')}</div>
            </div>
          </button>

        </div>
      </div>

      {/* Bed & Facility Capacity Manager */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-100 flex items-center space-x-2">
          <Bed className="w-5 h-5 text-cyan-400" />
          <span>{t('realtimeBedOccupancy')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300">{t('icuAvailable')}</div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={hospital.icuBedsAvailable}
                onChange={(e) => setHospital({ ...hospital, icuBedsAvailable: e.target.value })}
                className="w-24 px-3 py-2 rounded-xl glass-input text-lg font-bold text-emerald-400"
              />
              <span className="text-xs text-slate-400">{t('outOfIcuBeds')} ({hospital.icuBedsTotal})</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300">{t('generalWardBeds')}</div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={hospital.generalBedsAvailable}
                onChange={(e) => setHospital({ ...hospital, generalBedsAvailable: e.target.value })}
                className="w-24 px-3 py-2 rounded-xl glass-input text-lg font-bold text-cyan-400"
              />
              <span className="text-xs text-slate-400">{t('outOfBeds')} ({hospital.generalBedsTotal})</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
