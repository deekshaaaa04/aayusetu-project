import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Header from './components/Header';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AshaDashboard from './pages/AshaDashboard';
import HospitalStaffDashboard from './pages/HospitalStaffDashboard';
import HospitalAdminDashboard from './pages/HospitalAdminDashboard';
import GovtDashboard from './pages/GovtDashboard';
import AIAssistantModal from './components/AIAssistantModal';
import TeleconsultationRoom from './components/TeleconsultationRoom';
import DemoController from './components/DemoController';
import { AlertTriangle, PhoneCall, MapPin, X } from 'lucide-react';

function MainApp() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showTeleconsult, setShowTeleconsult] = useState(false);
  const [teleconsultSpecialty, setTeleconsultSpecialty] = useState('Cardiology');
  const [emergencyActive, setEmergencyActive] = useState(false);

  if (!user) {
    return <Login />;
  }

  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'PATIENT':
        return (
          <PatientDashboard
            onOpenAI={() => setShowAIAssistant(true)}
            onStartTeleconsult={(spec) => {
              if (spec) setTeleconsultSpecialty(spec);
              setShowTeleconsult(true);
            }}
            onOpenEmergency={() => setEmergencyActive(true)}
          />
        );
      case 'DOCTOR':
        return (
          <DoctorDashboard
            onStartTeleconsult={() => setShowTeleconsult(true)}
          />
        );
      case 'ASHA_WORKER':
        return (
          <AshaDashboard
            onOpenAI={() => setShowAIAssistant(true)}
            onStartTeleconsult={() => setShowTeleconsult(true)}
          />
        );
      case 'HOSPITAL_STAFF':
        return <HospitalStaffDashboard />;
      case 'HOSPITAL_ADMIN':
        return <HospitalAdminDashboard />;
      case 'GOVERNMENT':
        return <GovtDashboard />;
      default:
        return <PatientDashboard onOpenAI={() => setShowAIAssistant(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Header */}
      <Header
        onOpenAI={() => setShowAIAssistant(true)}
        onOpenEmergency={() => setEmergencyActive(true)}
      />

      {/* Emergency Mode Alert Banner (Part 11 & Part 14) */}
      {emergencyActive && (
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 text-white p-4 sticky top-16 z-30 shadow-2xl border-b border-rose-500/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl animate-bounce">
                🚨
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-sm tracking-wide">
                  {t('emergencyAlertTitle')}
                </h3>
                <p className="text-xs opacity-90">
                  {t('emergencyAlertDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href="tel:108"
                className="px-4 py-1.5 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-lg flex items-center space-x-1"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t('call108Ambulance')}</span>
              </a>
              <button
                onClick={() => setEmergencyActive(false)}
                className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {renderDashboardByRole()}
      </main>

      {/* Conversational AI Assistant Modal */}
      <AIAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onStartTeleconsult={(spec) => {
          setShowAIAssistant(false);
          if (spec) setTeleconsultSpecialty(spec);
          setShowTeleconsult(true);
        }}
        onFindCare={() => {
          setShowAIAssistant(false);
        }}
        onTriggerEmergency={() => {
          setShowAIAssistant(false);
          setEmergencyActive(true);
        }}
      />

      {/* Video & Audio Teleconsultation Room */}
      {showTeleconsult && (
        <TeleconsultationRoom
          session={{
            patientName: 'Ramesh Kumar',
            doctorName: 'Dr. Anjali Sharma',
            specialty: teleconsultSpecialty
          }}
          isDoctor={user.role === 'DOCTOR'}
          onEndCall={() => setShowTeleconsult(false)}
        />
      )}

      {/* SIH Demo Control Drawer */}
      <DemoController />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
