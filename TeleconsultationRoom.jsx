import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, FileText, Send, CheckCircle2, ShieldCheck, Download, Plus, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TeleconsultationRoom({ session, onEndCall, isDoctor = false }) {
  const { t } = useLanguage();
  const [callStatus, setCallStatus] = useState('CONNECTING'); // CONNECTING | CONNECTED | ENDED
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOnlyMode, setAudioOnlyMode] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // notes | history | prescription
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptionList, setPrescriptionList] = useState([
    { medicine: 'Telmisartan 40mg', dosage: '1 Tab Daily (Morning)', duration: '30 Days' }
  ]);
  const [newMed, setNewMed] = useState({ medicine: '', dosage: '', duration: '' });
  const [followUpDays, setFollowUpDays] = useState('14');
  const [callDurationSecs, setCallDurationSecs] = useState(0);

  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallStatus('CONNECTED');
    }, 1500);

    const interval = setInterval(() => {
      setCallDurationSecs(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddMedicine = () => {
    if (newMed.medicine) {
      setPrescriptionList([...prescriptionList, newMed]);
      setNewMed({ medicine: '', dosage: '', duration: '' });
    }
  };

  const handleCompleteConsultation = async () => {
    try {
      await fetch('/api/teleconsult/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session?.id || 'cons_demo_1',
          clinicalNotes,
          diagnosis,
          prescription: prescriptionList,
          followUpDays
        })
      });
    } catch (err) {
      console.error(err);
    }
    setCallStatus('ENDED');
    if (onEndCall) onEndCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col">
      
      {/* Teleconsult Header */}
      <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between glass-panel">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <h2 className="font-heading font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>{t('appTitle')} {t('teleconsultation')}</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                SIMULATION DEMO
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {t('patient')} <span className="text-emerald-400 font-semibold">{session?.patientName || 'Ramesh Kumar'}</span> • {t('doctorLabel')} <span className="text-cyan-400 font-semibold">{session?.doctorName || 'Dr. Anjali Sharma'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-cyan-300 border border-slate-700">
            ⏱️ {formatTime(callDurationSecs)}
          </div>
          <button
            onClick={handleCompleteConsultation}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{t('endCall')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Video Area + Right Clinical Workstation */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        
        {/* Video Canvas Area */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 relative overflow-hidden">
          
          {/* Main Remote Video Stream (Simulated Doctor / Patient) */}
          <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center relative">
            {callStatus === 'CONNECTING' ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-medium">{t('audioVideoBridge')}</p>
              </div>
            ) : videoOn && !audioOnlyMode ? (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                {/* Simulated Doctor/Patient Avatar Video */}
                <div className="text-center space-y-3">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 mx-auto flex items-center justify-center text-3xl font-bold text-slate-950 shadow-2xl shadow-cyan-500/30 border-4 border-cyan-400/40">
                    {isDoctor ? 'PK' : 'AS'}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-slate-100">
                      {isDoctor ? session?.patientName || 'Ramesh Kumar' : session?.doctorName || 'Dr. Anjali Sharma'}
                    </h3>
                    <p className="text-xs text-emerald-400 font-medium">{t('hdStreamActive')}</p>
                  </div>
                </div>

                {/* Self View PIP Thumbnail */}
                <div className="absolute bottom-4 right-4 w-36 h-24 bg-slate-950 rounded-xl border border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold text-xs">
                      YOU
                    </div>
                    <span className="text-[10px] text-slate-400">{micOn ? 'Mic On' : 'Muted'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 text-slate-400">
                <VideoOff className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-xs">{t('cameraOffMode')}</p>
              </div>
            )}

            {/* Connection Quality Pill */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] text-emerald-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('networkExcellent')}</span>
            </div>
          </div>

          {/* Call Control Toolbar */}
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-center space-x-4">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-full border transition-all ${micOn ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'}`}
              title={micOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-full border transition-all ${videoOn ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'}`}
              title={videoOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setAudioOnlyMode(!audioOnlyMode)}
              className={`px-3 py-2 rounded-full text-xs font-semibold border ${audioOnlyMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
            >
              {audioOnlyMode ? t('lowBandwidthMode') : t('audioOnlyFallback')}
            </button>

            <button
              onClick={handleCompleteConsultation}
              className="p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40"
              title={t('endCall')}
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: Clinical Notes & Digital Prescription Workstation */}
        <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
          
          {/* Workstation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/60">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 text-center ${activeTab === 'notes' ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              {t('clinicalNotes')}
            </button>
            <button
              onClick={() => setActiveTab('prescription')}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 text-center ${activeTab === 'prescription' ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              {t('prescriptionsAndRx')}
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            
            {activeTab === 'notes' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t('observationDiagnosis')}</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder={t('mildHypertensionPlaceholder')}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t('doctorConsultNotes')}</label>
                  <textarea
                    rows={6}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder={t('enterClinicalFindings')}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t('followUpSchedule')}</label>
                  <select
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  >
                    <option value="7">{t('days7')}</option>
                    <option value="14">{t('days14')}</option>
                    <option value="30">{t('days30')}</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'prescription' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{t('prescribedMedicines')}</span>
                </div>

                <div className="space-y-2">
                  {prescriptionList.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-emerald-300">{item.medicine}</div>
                        <div className="text-[10px] text-slate-400">{item.dosage} • {item.duration}</div>
                      </div>
                      <span className="text-[10px] text-slate-500">{t('rxVerified')}</span>
                    </div>
                  ))}
                </div>

                {/* Add Medicine Form */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400">{t('addMedicineToRx')}</span>
                  <input
                    type="text"
                    placeholder={t('medicineNamePlaceholder')}
                    value={newMed.medicine}
                    onChange={(e) => setNewMed({ ...newMed, medicine: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded glass-input text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={t('dosagePlaceholder')}
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      className="px-2.5 py-1.5 rounded glass-input text-xs"
                    />
                    <input
                      type="text"
                      placeholder={t('durationPlaceholder')}
                      value={newMed.duration}
                      onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                      className="px-2.5 py-1.5 rounded glass-input text-xs"
                    />
                  </div>
                  <button
                    onClick={handleAddMedicine}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('addMedicine')}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/80">
            <button
              onClick={handleCompleteConsultation}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('saveConsultationRecord')}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
