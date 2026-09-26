import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserCheck, Video, Clock, FileText, AlertTriangle, CheckCircle2, XCircle, ShieldCheck, Power, Eye } from 'lucide-react';
import PatientHistoryModal from '../components/PatientHistoryModal';

export default function DoctorDashboard({ onStartTeleconsult }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [availability, setAvailability] = useState('AVAILABLE'); // AVAILABLE | ON_CALL | BUSY | OFF_DUTY
  const [loading, setLoading] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('pat_1');

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const fetchDoctorData = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/doctor/dashboard/${user.id}`);
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setDashboard(data);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleOpenHistory = (patId = 'pat_1') => {
    setSelectedPatientId(patId);
    setShowHistoryModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Doctor Welcome Header & Duty Availability Toggle */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {t('doctorRole')}
            </span>
            <span className="text-xs text-slate-400">{t('regNo')} TSMC/2015/8472</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-100">
            {user?.name || 'Dr. Anjali Sharma'}
          </h1>
          <p className="text-xs text-slate-400">
            Specialty: <span className="text-cyan-400 font-semibold">{user?.specialty || 'Cardiology'}</span> • Medak District Area Hospital
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center space-x-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 pl-2">{t('dutyAvailability')}</span>
          {['AVAILABLE', 'ON_CALL', 'BUSY', 'OFF_DUTY'].map((status) => {
            const statusKey = status === 'AVAILABLE' ? 'available' : status === 'ON_CALL' ? 'onCall' : status === 'BUSY' ? 'busy' : 'offDuty';
            return (
              <button
                key={status}
                onClick={() => setAvailability(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${availability === status ? status === 'AVAILABLE' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' : status === 'BUSY' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t(statusKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* High-Priority Referral Request Card (Exact Requested Layout) */}
      <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
            <span>{t('highPriorityReferral')}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-mono font-bold">1 {t('pendingReview')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-slate-100 text-sm">
              {t('patient')} Ramesh Kumar
            </div>
            <div className="text-slate-300 flex items-center space-x-3 text-xs">
              <span>{t('age')} <strong className="text-slate-100">42</strong></span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                {t('risk')} {t('highRisk')}
              </span>
            </div>
            <div className="text-slate-400 text-xs">
              {t('currentComplaint')} <span className="text-amber-300 font-medium">{t('chestPainDyspnea')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 md:pt-0">
            <button
              onClick={() => handleOpenHistory('pat_1')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('viewPatientHistory')}</span>
            </button>

            <button
              onClick={() => alert('Referral Request ACCEPTED! Reserving Trauma Bay & Specialist Team.')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('acceptAndPrepare')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: OPD Queue + Teleconsultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* OPD Token Queue */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-100 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{t('todayOpdQueue')}</span>
            </h3>
            <span className="text-xs text-slate-400">{t('currentToken')} <strong className="text-amber-400">#11</strong></span>
          </div>

          <div className="space-y-2">
            {[
              { token: 11, name: 'Srinivas Rao', age: 54, status: 'IN_CONSULTATION', symptoms: 'Hypertension Follow-up', patId: 'pat_1' },
              { token: 12, name: 'Lakshmi Devi', age: 38, status: 'WAITING', symptoms: 'Severe Headache & Dizziness', patId: 'pat_1' },
              { token: 13, name: 'Mallesh Goud', age: 47, status: 'WAITING', symptoms: 'Type 2 Diabetes Review', patId: 'pat_1' },
              { token: 14, name: 'Ramesh Kumar', age: 42, status: 'WAITING', symptoms: 'Chest Exertion Dyspnea', patId: 'pat_1' }
            ].map((p, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${p.status === 'IN_CONSULTATION' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                <div>
                  <div className="font-bold flex items-center space-x-2">
                    <span>{t('token')}{p.token}</span>
                    <span className="text-slate-100">{p.name} ({p.age} {t('years')})</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{p.symptoms}</div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenHistory(p.patId)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                    title={t('viewPatientHistory')}
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button
                    onClick={() => onStartTeleconsult && onStartTeleconsult()}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 font-semibold text-xs"
                  >
                    {t('callPatient')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teleconsultation Quick Call Room Launcher */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-100 flex items-center space-x-2">
              <Video className="w-4 h-4 text-cyan-400" />
              <span>{t('digitalTeleconsultRoom')}</span>
            </h3>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">{t('encryptedWebRtc')}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-center">
            <Video className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
            <div className="text-xs text-slate-300 font-semibold">{t('readyForConsultation')}</div>
            <p className="text-[11px] text-slate-400">{t('consultationDesc')}</p>
            <div className="flex items-center justify-center space-x-2 pt-1">
              <button
                onClick={() => handleOpenHistory('pat_1')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center space-x-1.5"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{t('viewPatientHistory')}</span>
              </button>
              <button
                onClick={() => onStartTeleconsult && onStartTeleconsult()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-cyan-600/30"
              >
                {t('openTeleconsultRoom')}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Patient Medical History Modal */}
      <PatientHistoryModal
        patientId={selectedPatientId}
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onAcceptAfterReview={() => {
          alert('Referral Request ACCEPTED! Reserving Trauma Bay & Specialist Team.');
        }}
      />

    </div>
  );
}
