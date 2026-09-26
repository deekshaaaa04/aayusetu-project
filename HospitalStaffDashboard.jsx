import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, CheckCircle2, XCircle, AlertOctagon, RefreshCw, Hospital, Activity } from 'lucide-react';

export default function HospitalStaffDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [showDenyModal, setShowDenyModal] = useState(null);
  const [denialReason, setDenialReason] = useState('No ICU bed capacity available');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalData();
  }, [user]);

  const fetchHospitalData = async () => {
    try {
      const hospId = user?.hospitalId || 'hosp_medak_dist';
      const res = await fetch(`/api/hospital/dashboard/${hospId}`);
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setDashboard(data);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleRespondEmergency = async (requestId, action, reason = null) => {
    try {
      const hospId = user?.hospitalId || 'hosp_medak_dist';
      const res = await fetch('/api/emergency/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, hospitalId: hospId, reason })
      });
      const data = await res.json();
      setShowDenyModal(null);
      fetchHospitalData();
      if (action === 'DENY' && data.rerouted) {
        alert(`Request DENIED: Reason recorded. System Care Readiness Engine automatically triggered DYNAMIC REROUTING to alternative facility: ${data.newHospital.name}!`);
      } else if (action === 'ACCEPT') {
        alert('Emergency Request ACCEPTED! Ambulance dispatched & Trauma Care Bay reserved.');
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {t('staffRole')}
            </span>
            <span className="text-xs text-slate-400">{t('triageOfficer')}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-100">
            {dashboard?.hospital?.name || t('medakAreaHospital')}
          </h1>
          <p className="text-xs text-slate-400">{t('emergencyStatusAccepting')} <strong className="text-emerald-400 font-bold">{dashboard?.hospital?.emergencyStatus || 'ACCEPTING'}</strong></p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchHospitalData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center space-x-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('refreshQueue')}</span>
          </button>
        </div>
      </div>

      {/* Emergency Request Review Cards (Part 27: Accept or Deny Workflow) */}
      <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            <span>{t('incomingEmergencyAction')}</span>
          </div>
        </div>

        <div className="space-y-3">
          {dashboard?.emergencyRequests?.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900 text-center text-xs text-slate-400">
              {t('noPendingEmergency')}
            </div>
          ) : (
            (dashboard?.emergencyRequests || [
              { id: 'emg_req_101', patientName: 'Ramesh Kumar', symptoms: 'Acute chest pain & elevated BP from Rampur Village', status: 'REQUESTED' }
            ]).map((req, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-100 flex items-center space-x-2">
                    <span>{t('patient')}: {req.patientName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-mono">
                      STATUS: {req.status}
                    </span>
                  </div>
                  <div className="text-slate-400">{t('symptoms')} {req.symptoms}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRespondEmergency(req.id, 'ACCEPT')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('accept')}</span>
                  </button>
                  <button
                    onClick={() => setShowDenyModal(req.id)}
                    className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{t('deny')}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Denial Reason Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-rose-500/40 space-y-4">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>{t('denialReasonRequired')}</span>
            </div>
            <p className="text-xs text-slate-300">
              {t('denialMandateDesc')}
            </p>

            <select
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
            >
              <option value="No emergency bed / ICU capacity available">{t('denialReason1')}</option>
              <option value="Required specialist doctor unavailable">{t('denialReason2')}</option>
              <option value="Operating theatre under maintenance">{t('denialReason3')}</option>
              <option value="Oxygen supply critical">{t('denialReason4')}</option>
            </select>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowDenyModal(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleRespondEmergency(showDenyModal, 'DENY', denialReason)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                {t('confirmDenial')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
