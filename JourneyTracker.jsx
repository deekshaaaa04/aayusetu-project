import React from 'react';
import { Truck, CheckCircle2, AlertOctagon, MapPin, Clock, ArrowRight, ShieldAlert, Phone, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function JourneyTracker({ journey, request, onTriggerReroute }) {
  const { t } = useLanguage();
  if (!journey && !request) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center space-y-2">
        <Truck className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-300">{t('noActiveJourney')}</h3>
        <p className="text-xs text-slate-500">{t('noActiveJourneyDesc')}</p>
      </div>
    );
  }

  const timeline = journey?.timeline || [
    { stage: 'Referral/Emergency Created', done: true, time: '10:15 AM' },
    { stage: 'Care Readiness Verified', done: true, time: '10:16 AM' },
    { stage: 'Hospital Accepted Request', done: true, time: '10:18 AM' },
    { stage: 'Transport Dispatched', done: true, time: '10:20 AM' },
    { stage: 'En Route to Facility', done: true, time: '10:25 AM' },
    { stage: 'Hospital Admission & Care', done: false, time: 'Pending' }
  ];

  const isRerouted = journey?.rerouted || request?.status === 'ALTERNATIVE_SEARCHING';

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-5">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-heading font-bold text-sm text-slate-100">{t('referralTracking')}</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {t('activeGps')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t('refId')}: <span className="font-mono text-cyan-300">{request?.id || journey?.requestId || 'EMG-8472'}</span> • {t('vehicle')}: <span className="font-semibold text-slate-200">{journey?.ambulanceVehicleNo || 'TS 15 A 1081'}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">{t('estimatedArrival')}</div>
          <div className="font-heading font-extrabold text-lg text-emerald-400">
            ~{journey?.currentEtaMinutes || 18} {t('mins')}
          </div>
        </div>
      </div>

      {/* Dynamic Reroute Alert Notification (Part 31) */}
      {isRerouted && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-amber-400">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>{t('rerouteNotice')}</span>
          </div>
          <p className="text-[11px]">
            {t('rerouteDesc')} <strong className="text-slate-100">{journey?.hospitalName || request?.targetHospitalName}</strong>.
          </p>
        </div>
      )}

      {/* Simulated Live Route Map Canvas */}
      <div className="relative w-full h-40 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full text-cyan-500/20 opacity-30" width="100%" height="100%">
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Route Line */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M 60 100 Q 200 40 380 90" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6 6" className="animate-pulse" />
        </svg>

        {/* Pickup Pin */}
        <div className="absolute left-10 top-20 flex flex-col items-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center shadow-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold text-emerald-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
            {journey?.pickupLocation?.village || 'Rampur Village'}
          </span>
        </div>

        {/* Moving Ambulance Indicator */}
        <div className="absolute left-1/2 top-10 flex flex-col items-center space-y-1 -translate-x-1/2">
          <div className="w-9 h-9 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-xl shadow-cyan-500/50 animate-bounce">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/40">
            {t('ambulanceEnRoute')}
          </span>
        </div>

        {/* Hospital Destination Pin */}
        <div className="absolute right-10 top-16 flex flex-col items-center space-y-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border ${isRerouted ? 'bg-amber-500/20 text-amber-400 border-amber-500' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500'}`}>
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold text-cyan-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
            {journey?.hospitalName || request?.targetHospitalName || 'Medak District Hospital'}
          </span>
        </div>
      </div>

      {/* Visual Timeline */}
      <div>
        <div className="text-xs font-bold text-slate-300 mb-3">{t('journeyStageProgression')}</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {timeline.map((step, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-xs space-y-1 ${step.done ? 'bg-slate-900/80 border-emerald-500/40 text-slate-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}
            >
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${step.done ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className="font-semibold text-[11px] truncate">{t(step.stage)}</span>
              </div>
              <div className="text-[10px] text-slate-400 pl-5">{step.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Contact & Emergency Reroute Test Trigger */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>{t('driverContact')} <strong className="text-emerald-300">+91 {journey?.driverPhone || '9876599901'}</strong> (Mohd. Rafiq)</span>
        </div>

        {onTriggerReroute && (
          <button
            onClick={onTriggerReroute}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('simulateMidJourneyReroute')}</span>
          </button>
        )}
      </div>

    </div>
  );
}
