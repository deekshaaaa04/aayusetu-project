import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, MapPin, Clock, Hospital, UserCheck, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CareReadinessSearch({ defaultSpecialty = 'Cardiology', onRequestHospital }) {
  const { t } = useLanguage();
  const [specialty, setSpecialty] = useState(defaultSpecialty);
  const [isEmergency, setIsEmergency] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    fetchReadiness();
  }, [specialty, isEmergency]);

  const fetchReadiness = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/care-readiness/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialtyRequired: specialty, isEmergency })
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Filter Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{t('careReadinessEngine')}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {t('careReadinessDesc')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEmergency(!isEmergency)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${isEmergency ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}`}
            >
              {isEmergency ? t('emergencyModeOn') : t('standardMode')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t('specialtyNeeded')}</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="Cardiology">{t('cardiology')}</option>
              <option value="General Medicine">{t('generalMedicine')}</option>
              <option value="Pediatrics">{t('pediatrics')}</option>
              <option value="Obstetrics & Gynecology">{t('gynecology')}</option>
              <option value="Orthopedics">{t('orthopedics')}</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t('maxDistance')}</label>
            <select className="w-full px-3 py-2 rounded-xl glass-input text-xs">
              <option value="25">{t('dist25')}</option>
              <option value="50">{t('dist50')}</option>
              <option value="100">{t('dist100')}</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReadiness}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{t('recalculateReadiness')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 glass-panel rounded-2xl text-center text-xs text-slate-400">
            {t('searchingFacilities')}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 glass-panel rounded-2xl text-center text-xs text-slate-400">
            {t('noFacilitiesFound')}
          </div>
        ) : (
          recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`p-5 glass-panel rounded-2xl border transition-all ${idx === 0 ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/10' : 'border-slate-800'}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Hospital Main Meta */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {t('rank')}{idx + 1}
                    </span>
                    <h3 className="font-heading font-bold text-base text-slate-100">{rec.hospital.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rec.hospital.emergencyStatus === 'ACCEPTING' ? 'status-pill-available' : rec.hospital.emergencyStatus === 'LIMITED' ? 'status-pill-limited' : 'status-pill-unavailable'}`}>
                      {rec.hospital.emergencyStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{rec.hospital.district} ({rec.hospital.distanceKm} km)</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>~{rec.hospital.travelTimeMinutes} {t('mins')} {t('travel')}</span>
                    </span>
                  </p>

                  {/* Why Chosen Statement (Primary Differentiator) */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                    <strong className="text-emerald-400 font-bold block mb-0.5">{t('whyRecommended')}</strong>
                    {rec.summaryWhy}
                  </div>

                  {/* Warning Flags if any */}
                  {rec.warningFlags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rec.warningFlags.map((flag, fIdx) => (
                        <span key={fIdx} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          ⚠️ {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Readiness Score & Pre-Travel Confirmation Action */}
                <div className="flex lg:flex-col items-center justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-6 space-y-3">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('careReadinessScore')}</div>
                    <div className="font-heading font-extrabold text-2xl text-emerald-400">
                      {rec.readinessScore}<span className="text-xs text-slate-500">/100</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRequestHospital && onRequestHospital(rec.hospital)}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
                  >
                    <span>{t('sendPreTravel')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
