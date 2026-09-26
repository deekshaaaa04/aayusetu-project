import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, ShieldCheck, HeartPulse, Pill, Clock, Hospital, User, Activity, X, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PatientHistoryModal({ patientId = 'pat_1', isOpen, onClose, onAcceptAfterReview }) {
  const { t } = useLanguage();
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // summary | consultations | medicines | diagnostics | visits
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPatientHistory();
    }
  }, [isOpen, patientId]);

  const fetchPatientHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patient/history/${patientId}`, {
        headers: {
          'x-user-role': 'DOCTOR',
          'x-user-id': 'usr_doctor_1'
        }
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setPatientData(data.patient);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const pat = patientData || {
    name: 'Ramesh Kumar',
    age: 42,
    gender: 'Male',
    bloodGroup: 'O+',
    mobile: '9876543210',
    emergencyContact: '+91 9876500001 (Wife - Lakshmi Devi)',
    location: { village: 'Rampur', district: 'Medak' },
    highRiskStatus: 'HIGH RISK',
    chronicConditions: ['Hypertension', 'Diabetes Mellitus (Type 2)', 'Seasonal Asthma'],
    allergies: ['Penicillin (Severe skin rash & anaphylactoid reaction)', 'Sulfa Drugs (Mild hives)'],
    currentMedicines: [
      { medicine: 'Metformin 500mg', dosage: '1 Tab BD (After Meals)', duration: 'Ongoing Chronic' },
      { medicine: 'Amlodipine 5mg', dosage: '1 Tab Night', duration: 'Ongoing Chronic' },
      { medicine: 'Telmisartan 40mg', dosage: '1 Tab Morning', duration: 'Ongoing Chronic' }
    ],
    lastConsultationDate: '12 Sept 2026',
    recentDiagnosis: 'Stage 1 Essential Hypertension & Acute Exertional Dyspnea',
    significantVitals: 'BP: 150/98 mmHg | HR: 92 bpm | SpO2: 96% | FBS: 138 mg/dL'
  };

  const isHighRisk = (pat.highRiskStatus || 'HIGH RISK').toUpperCase().includes('HIGH');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl glass-panel rounded-3xl border border-cyan-500/30 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-heading font-extrabold text-base text-slate-100">
                  {t('patientHistoryTitle')}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  {t('authorizedDoctorAccess')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('patient')} <strong className="text-slate-200">{pat.name}</strong> • {t('age')} {pat.age}y • {t('bloodGroup')} <span className="text-emerald-400 font-bold">{pat.bloodGroup || 'O+'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Concise Clinical Summary Banner at Top (User Requirement 5) */}
        <div className="p-5 bg-slate-900/90 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{t('clinicalSummary')}</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 ${isHighRisk ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>🔴 {t('riskStatus')} {pat.highRiskStatus || 'HIGH RISK'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">{t('existingConditions')}</span>
              <div className="font-bold text-slate-200">
                {Array.isArray(pat.chronicConditions) ? pat.chronicConditions.join(', ') : pat.chronicConditions || 'Hypertension, Diabetes'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">{t('currentMedicines')}</span>
              <div className="font-bold text-emerald-400">
                {Array.isArray(pat.currentMedicines) ? pat.currentMedicines.map(m => m.medicine || m).join(', ') : 'Metformin, Amlodipine, Telmisartan'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/30 bg-rose-500/5">
              <span className="text-[10px] font-semibold text-rose-300 block mb-0.5">{t('knownAllergies')}</span>
              <div className="font-bold text-rose-400">
                {Array.isArray(pat.allergies) ? pat.allergies.join(', ') : pat.allergies || 'Penicillin'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">{t('recentDiagnosis')}</span>
              <div className="font-semibold text-slate-200 truncate">
                {pat.recentDiagnosis || 'Hypertension Stage 1'}
              </div>
              <div className="text-[10px] text-cyan-400 mt-0.5">{t('lastConsult')} {pat.lastConsultationDate || '12 Sept 2026'}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs font-semibold px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 border-b-2 text-center whitespace-nowrap transition-colors ${activeTab === 'summary' ? 'border-cyan-400 text-cyan-300 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {t('overviewAndVitals')}
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`py-3 px-4 border-b-2 text-center whitespace-nowrap transition-colors ${activeTab === 'consultations' ? 'border-cyan-400 text-cyan-300 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {t('consultationsAndNotes')}
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`py-3 px-4 border-b-2 text-center whitespace-nowrap transition-colors ${activeTab === 'medicines' ? 'border-cyan-400 text-cyan-300 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {t('prescriptionsAndRx')}
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`py-3 px-4 border-b-2 text-center whitespace-nowrap transition-colors ${activeTab === 'diagnostics' ? 'border-cyan-400 text-cyan-300 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {t('labReportsAndDiagnostics')}
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`py-3 px-4 border-b-2 text-center whitespace-nowrap transition-colors ${activeTab === 'visits' ? 'border-cyan-400 text-cyan-300 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {t('hospitalVisits')}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">{t('loadingProfile')}</div>
          ) : activeTab === 'summary' && (
            <div className="space-y-4">
              
              {/* Patient Basic Details Grid */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-heading font-bold text-xs text-slate-200 flex items-center space-x-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>{t('patientDemographics')}</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('fullName')}</span>
                    <span className="font-bold text-slate-100">{pat.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('ageGender')}</span>
                    <span className="font-bold text-slate-100">{pat.age} {t('years')} • {pat.gender}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('mobileNumber')}</span>
                    <span className="font-mono text-slate-200">{pat.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('emergencyContact')}</span>
                    <span className="text-slate-200">{pat.emergencyContact}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block">{t('residentialAddress')}</span>
                    <span className="text-slate-200">{pat.location?.address || `${pat.location?.village || 'Rampur'}, Medak District, Telangana`}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block">{t('significantVitals')}</span>
                    <span className="font-mono text-emerald-400 font-semibold">{pat.significantVitals || 'BP: 150/98 mmHg | HR: 92 bpm | SpO2: 96%'}</span>
                  </div>
                </div>
              </div>

              {/* Allergies Warning Panel */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <h4 className="font-heading font-bold text-xs text-rose-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{t('criticalAllergies')}</span>
                </h4>
                <div className="space-y-1">
                  {(pat.allergies || ['Penicillin']).map((allergy, idx) => (
                    <div key={idx} className="text-xs font-semibold text-rose-300 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{allergy}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs text-slate-200">{t('previousConsultations')}</h4>
              {(pat.consultationHistory || [
                {
                  date: '12 Sept 2026',
                  doctorName: 'Dr. Anjali Sharma (Cardiology)',
                  hospitalName: 'Medak District Area Hospital',
                  type: 'Teleconsultation (Video)',
                  symptoms: 'Substernal chest tightness & exertional breathlessness',
                  diagnosis: 'Hypertensive Heart Disease / Exertional Angina Screening',
                  clinicalNotes: 'BP 150/98 mmHg, Pulse 92 bpm. Advised immediate 12-lead ECG, Troponin-I test, and daily BP logging.',
                  prescription: [
                    { medicine: 'Telmisartan 40mg', dosage: '1 Tab Morning', duration: '30 Days' },
                    { medicine: 'Amlodipine 5mg', dosage: '1 Tab Night', duration: '30 Days' }
                  ]
                }
              ]).map((cons, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-bold text-emerald-400">{cons.date} • {cons.type}</span>
                    <span className="text-slate-400">{cons.doctorName} ({cons.hospitalName})</span>
                  </div>
                  <div>
                    <strong className="text-slate-400">{t('chiefSymptoms')}</strong> {cons.symptoms}
                  </div>
                  <div>
                    <strong className="text-slate-400">{t('diagnosis')}</strong> <span className="font-semibold text-cyan-300">{cons.diagnosis}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-[11px]">
                    <span className="text-slate-400 block mb-1 text-[10px] font-sans">{t('doctorNotesLabel')}</span>
                    {cons.clinicalNotes}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'medicines' && (
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs text-slate-200">{t('currentActivePrescriptions')}</h4>
              <div className="space-y-2">
                {(pat.currentMedicines || [
                  { medicine: 'Metformin 500mg', dosage: '1 Tab BD', duration: 'Ongoing' },
                  { medicine: 'Amlodipine 5mg', dosage: '1 Tab Night', duration: 'Ongoing' },
                  { medicine: 'Telmisartan 40mg', dosage: '1 Tab Morning', duration: 'Ongoing' }
                ]).map((med, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-emerald-300">{med.medicine}</div>
                      <div className="text-[10px] text-slate-400">{med.dosage} • {med.duration}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {t('activeRx')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs text-slate-200">{t('diagnosticReports')}</h4>
              <div className="space-y-2">
                {(pat.diagnosticReports || [
                  { testName: '12-Lead ECG Test', category: 'Cardiology', date: '12 Sept 2026', result: 'Sinus Rhythm, Mild LV strain pattern', hospitalName: 'Medak District Area Hospital' },
                  { testName: 'Fasting Blood Sugar & HbA1c', category: 'Pathology', date: '15 Aug 2026', result: 'FBS: 138 mg/dL | HbA1c: 7.2%', hospitalName: 'Rampur PHC' },
                  { testName: 'Digital Chest X-Ray', category: 'Radiology', date: '01 Aug 2026', result: 'Clear lung fields, Normal cardiothoracic ratio', hospitalName: 'Medak District Area Hospital' }
                ]).map((diag, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{diag.testName} ({diag.category})</span>
                      <span className="text-[10px] text-slate-400">{diag.date}</span>
                    </div>
                    <div className="text-cyan-300 font-mono text-[11px]">{t('finding')} {diag.result}</div>
                    <div className="text-[10px] text-slate-500">{t('facility')} {diag.hospitalName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs text-slate-200">{t('hospitalVisitLog')}</h4>
              <div className="space-y-2">
                {(pat.hospitalVisits || [
                  { date: '12 Sept 2026', facilityName: 'Medak District Area Hospital', reason: 'Emergency Referral - Chest tightness', status: 'Evaluated & Stabilized' },
                  { date: '15 Aug 2026', facilityName: 'Rampur PHC', reason: 'Routine Chronic Care Review', status: 'Completed' }
                ]).map((v, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{v.facilityName}</div>
                      <div className="text-[10px] text-slate-400">{t('reason')} {v.reason} • {t('date')} {v.date}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300">
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('passportSecurityNote')}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
            >
              {t('closeHistory')}
            </button>
            {onAcceptAfterReview && (
              <button
                onClick={() => {
                  onClose();
                  onAcceptAfterReview();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('acceptReferralProceed')}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
