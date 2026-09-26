import db from './db.js';
import { calculateCareReadiness } from './careReadiness.js';

export const EMERGENCY_KEYWORDS = [
  'cannot breathe', 'breathless', 'difficulty breathing', 'chest pain', 'heart attack',
  'unconscious', 'fainted', 'heavy bleeding', 'bleeding severely', 'seizure', 'fits',
  'accident', 'head injury', 'paralysis', 'snake bite', 'poison', 'severe burn'
];

export function processAIMessage(userMessage, context = {}, language = 'en') {
  const msgLower = (userMessage || '').toLowerCase();
  
  const aiConfig = db.find('ai_configs', c => c.status === 'APPROVED') || {
    version: 'v2.4.0',
    systemInstruction: 'Default AI Assistant'
  };

  const isEmergency = EMERGENCY_KEYWORDS.some(keyword => msgLower.includes(keyword));
  if (isEmergency) {
    const emergencyCare = calculateCareReadiness({ isEmergency: true, maxDistanceKm: 100 });
    const recommendedHospital = emergencyCare.length > 0 ? emergencyCare[0].hospital : null;

    return {
      intent: 'EMERGENCY',
      emergencyMode: true,
      triageLevel: 'EMERGENCY',
      confidence: 0.98,
      response: `🚨 HIGH RISK MEDICAL EMERGENCY DETECTED! Immediate emergency protocols activated. Please remain calm. We are ready to dispatch transport to your nearest emergency centre: ${recommendedHospital ? recommendedHospital.name : 'Nearest District Hospital'}.`,
      actions: [
        { type: 'CALL_EMERGENCY', label: 'Call 108 Emergency Ambulance', number: '108' },
        { type: 'ALERT_HOSPITAL', label: 'Alert Nearest Hospital', hospitalId: recommendedHospital ? recommendedHospital.id : 'hosp_medak_dist' },
        { type: 'SHARE_LOCATION', label: 'Share Live GPS Coordinates', lat: 18.045, lng: 78.261 }
      ],
      careReadinessRecommendations: emergencyCare.slice(0, 2),
      configVersion: aiConfig.version
    };
  }

  if (msgLower.includes('fever') || msgLower.includes('cough') || msgLower.includes('headache') || msgLower.includes('stomach') || msgLower.includes('vomiting') || msgLower.includes('pain') || msgLower.includes('symptom')) {
    let triageLevel = 'LOCAL_DOCTOR';
    let careRecommendation = 'Local Primary Health Centre (PHC) or Video Teleconsultation';
    let specialty = 'General Medicine';

    if (msgLower.includes('chest') || msgLower.includes('bp') || msgLower.includes('pressure')) {
      triageLevel = 'HOSPITAL';
      specialty = 'Cardiology';
      careRecommendation = 'District Area Hospital (Cardiology Evaluation)';
    } else if (msgLower.includes('child') || msgLower.includes('baby') || msgLower.includes('kid')) {
      specialty = 'Pediatrics';
      careRecommendation = 'Pediatric Clinic or Teleconsultation';
    } else if (msgLower.includes('fever') && !msgLower.includes('high')) {
      triageLevel = 'TELECONSULTATION';
    }

    const careReadiness = calculateCareReadiness({ specialtyRequired: specialty, isEmergency: triageLevel === 'HOSPITAL' });

    return {
      intent: 'SYMPTOMS_TRIAGE',
      emergencyMode: false,
      triageLevel,
      specialtyRequired: specialty,
      careRecommendation,
      response: `Based on your described symptoms, our digital triage indicates **${triageLevel.replace('_', ' ')}** level care. We recommend consulting a specialist in **${specialty}**.`,
      followUpQuestions: [
        'How many days have you had these symptoms?',
        'Do you have any history of high blood pressure, diabetes, or asthma?',
        'Would you like to book a instant Video/Audio Teleconsultation now?'
      ],
      actions: [
        { type: 'START_TELECONSULT', label: 'Start Video Teleconsultation', specialty },
        { type: 'FIND_CARE', label: 'View Suitable Nearby Hospitals', specialty }
      ],
      careReadinessRecommendations: careReadiness.slice(0, 2),
      configVersion: aiConfig.version
    };
  }

  if (msgLower.includes('doctor') || msgLower.includes('cardiologist') || msgLower.includes('pediatrician') || msgLower.includes('gynecologist') || msgLower.includes('specialist')) {
    let spec = 'General Medicine';
    if (msgLower.includes('cardiologist') || msgLower.includes('heart')) spec = 'Cardiology';
    if (msgLower.includes('pediatrician') || msgLower.includes('child')) spec = 'Pediatrics';
    if (msgLower.includes('gynecologist') || msgLower.includes('maternal')) spec = 'Obstetrics & Gynecology';

    const readiness = calculateCareReadiness({ specialtyRequired: spec });
    return {
      intent: 'DOCTOR_SEARCH',
      specialtyRequired: spec,
      response: `Searching Care Readiness Engine for available **${spec}** specialists near your village... We found ${readiness.length} verified hospitals with duty specialists.`,
      careReadinessRecommendations: readiness,
      actions: [
        { type: 'BOOK_APPOINTMENT', label: `Book Appointment with ${spec}` },
        { type: 'START_TELECONSULT', label: 'Audio/Video Teleconsultation' }
      ],
      configVersion: aiConfig.version
    };
  }

  if (msgLower.includes('queue') || msgLower.includes('token') || msgLower.includes('wait time')) {
    const queue = db.find('queues', q => q.patientId === 'pat_1') || { tokenNo: 14, currentToken: 11, patientsAhead: 3, estimatedWaitMins: 25 };
    return {
      intent: 'QUEUE_STATUS',
      response: `Your current OPD Queue Token is **#${queue.tokenNo}**. Currently token **#${queue.currentToken}** is being consulted. There are **${queue.patientsAhead} patients ahead** of you. Estimated wait time: **~${queue.estimatedWaitMins} minutes**.`,
      queueData: queue,
      configVersion: aiConfig.version
    };
  }

  return {
    intent: 'HEALTH_ASSIST',
    response: `Namaste! I am your Aayusetu Healthcare Assistant. I can help you check symptoms, perform digital triage, find ready hospitals with verified doctor availability, track referrals, or start a video teleconsultation. How can I support your health today?`,
    followUpQuestions: [
      'What symptoms are you experiencing?',
      'Find ready cardiologist near me',
      'Start video teleconsultation with a doctor',
      'Check my queue status'
    ],
    configVersion: aiConfig.version
  };
}
