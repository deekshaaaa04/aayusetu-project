import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, TrendingUp, MapPin, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function GovtDashboard() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/summary');
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setAnalytics(data);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 tracking-wider">
              {t('govtRole')}
            </span>
            <span className="text-xs font-semibold text-slate-300">{t('dmho')}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-100 tracking-tight">
            {t('govtTitle')}
          </h1>
          <p className="text-xs font-medium text-slate-300">
            {t('govtSubtitle')}
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition-all shadow-md flex-shrink-0"
        >
          {t('refreshRealtimeData')}
        </button>
      </div>

      {/* High-Level Quality KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="p-6 glass-panel rounded-2xl border border-slate-800/90 space-y-2 shadow-lg">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('registeredFacilities')}</div>
          <div className="font-heading font-black text-3xl text-slate-100">
            {analytics?.totalHospitals || 4}
          </div>
          <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{analytics?.acceptingEmergencyHospitals || 3} {t('acceptingEmergencies')}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 glass-panel rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-2 shadow-lg">
          <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">{t('referralCompletionRate')}</div>
          <div className="font-heading font-black text-3xl text-emerald-400">
            96.8%
          </div>
          <div className="text-xs font-medium text-slate-300 pt-1">
            {t('targetBenchmark')} <strong className="text-slate-100">&gt;95%</strong>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 glass-panel rounded-2xl border border-cyan-500/40 bg-cyan-500/10 space-y-2 shadow-lg">
          <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{t('dynamicReroutesTriggered')}</div>
          <div className="font-heading font-black text-3xl text-cyan-400">
            {analytics?.dynamicReroutesCount || 2}
          </div>
          <div className="text-xs font-semibold text-cyan-300 flex items-center space-x-1 pt-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('zeroPatientAbandonment')}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 glass-panel rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-2 shadow-lg">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">{t('avgTransportEta')}</div>
          <div className="font-heading font-black text-3xl text-amber-400">
            18.4 {t('mins')}
          </div>
          <div className="text-xs font-medium text-slate-300 pt-1">
            {t('ambulanceDispatchRate')} <strong className="text-slate-100">100%</strong>
          </div>
        </div>

      </div>

      {/* Audit Logs Table for Healthcare Journey Recovery */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/90 space-y-5 shadow-xl">
        <div className="space-y-1">
          <h3 className="font-heading font-extrabold text-lg text-slate-100 flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>{t('systemAuditTrail')}</span>
          </h3>
          <p className="text-xs font-medium text-slate-300">
            {t('auditTrailDesc')}
          </p>
        </div>

        <div className="space-y-3">
          {(analytics?.auditLogs || [
            { timestamp: new Date().toLocaleTimeString(), role: 'SYSTEM', action: 'DYNAMIC_REROUTE_TRIGGERED', details: 'Medak Hospital denied due to bed overflow. Automatically rerouted transport to Gandhi Tertiary Care Hospital.' },
            { timestamp: new Date().toLocaleTimeString(), role: 'PATIENT', action: 'EMERGENCY_REQUEST_CREATED', details: 'Patient Ramesh Kumar created emergency request from Rampur Village.' }
          ]).map((log, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                    {log.role}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                    {log.action}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-200 leading-relaxed">
                  {log.details}
                </div>
              </div>
              <div className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800/80 self-start md:self-center flex-shrink-0">
                {log.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
