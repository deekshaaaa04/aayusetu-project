import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertOctagon, CheckCircle2, Truck, Activity, ShieldAlert, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DemoController({ onTriggerEvent, activeJourney }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const handleSimulate = async (eventType, payload = {}) => {
    setLoading(true);
    setLastMessage(null);
    try {
      const res = await fetch('/api/demo/trigger-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, ...payload })
      });
      const data = await res.json();
      setLoading(false);
      setLastMessage(data.message);
      if (onTriggerEvent) onTriggerEvent(eventType, data);
    } catch (err) {
      setLoading(false);
      setLastMessage('Simulation trigger error.');
    }
  };

  return (
    <>
      {/* Floating Demo Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white font-bold text-xs shadow-2xl shadow-cyan-500/40 hover:scale-105 transition-all border border-cyan-400/30"
      >
        <Sliders className="w-4 h-4 animate-spin-slow" />
        <span>{t('demoController')}</span>
      </button>

      {/* Controller Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 glass-panel border-l border-cyan-500/30 shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-100">{t('sihEvaluatorControls')}</h3>
                  <p className="text-[10px] text-cyan-400">{t('liveJourneyRecovery')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {lastMessage && (
              <div className="my-3 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{lastMessage}</span>
              </div>
            )}

            <div className="mt-4 space-y-4">
              
              {/* Scenario 1: Flip Hospital to NOT ACCEPTING Mid-Journey */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs">
                  <AlertOctagon className="w-4 h-4" />
                  <span>{t('scenario1')}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulate Medak District Hospital becoming full/unavailable while patient ambulance is en route.
                </p>
                <button
                  onClick={() => handleSimulate('FLIP_HOSPITAL_UNAVAILABLE', { hospitalId: 'hosp_medak_dist' })}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-semibold text-xs flex items-center justify-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t('triggerUnavailability')}</span>
                </button>
              </div>

              {/* Restore Hospital */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-emerald-400 font-semibold text-xs">{t('resetHospitalReadiness')}</div>
                <p className="text-[11px] text-slate-400">Restore Medak District Hospital back to ACCEPTING EMERGENCIES with 6 available ICU beds.</p>
                <button
                  onClick={() => handleSimulate('RESET_HOSPITAL_AVAILABLE', { hospitalId: 'hosp_medak_dist' })}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('restoreHospitalReadiness')}</span>
                </button>
              </div>

              {/* Scenario 2: Ambulance Movement */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs">
                  <Truck className="w-4 h-4" />
                  <span>{t('scenario2')}</span>
                </div>
                <p className="text-[11px] text-slate-400">Advance ambulance location on live GIS map towards Gandhi Tertiary Care Hospital.</p>
                <button
                  onClick={() => handleSimulate('ADVANCE_AMBULANCE')}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs"
                >
                  {t('advanceAmbulance')}
                </button>
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Demo control tools for Smart India Hackathon jury evaluations. All events trigger real database state updates.
          </div>
        </div>
      )}
    </>
  );
}
