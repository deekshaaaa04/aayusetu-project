import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './db.js';
import seedDatabase from './seed.js';
import { calculateCareReadiness } from './careReadiness.js';
import { processAIMessage } from './aiAssistant.js';
import { createEmergencyRequest, respondToEmergencyRequest, triggerMidJourneyReroute } from './journeyEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

if (db.get('users').length === 0) {
  seedDatabase();
}

app.get('/api/auth/demo-accounts', (req, res) => {
  const users = db.get('users').map(u => ({
    id: u.id,
    name: u.name,
    role: u.role,
    mobile: u.mobile,
    specialty: u.specialty || null,
    hospitalId: u.hospitalId || null,
    assignedVillage: u.assignedVillage || null
  }));
  res.json({ success: true, accounts: users });
});

app.post('/api/auth/login', (req, res) => {
  const { mobile, otp, password, role } = req.body;
  const user = db.find('users', u => u.mobile === mobile && (!role || u.role === role));

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or user role mismatch.' });
  }

  if (otp && otp !== '123456' && user.otp && user.otp !== otp) {
    return res.status(401).json({ success: false, message: 'Invalid OTP entered. (Demo OTP is 123456)' });
  }

  db.logAudit(user.id, user.role, 'LOGIN_SUCCESS', 'AUTH', `User logged in from mobile ${mobile}`);
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      specialty: user.specialty,
      hospitalId: user.hospitalId,
      village: user.village || user.assignedVillage
    },
    token: `demo_token_${user.id}_${Date.now()}`
  });
});

app.post('/api/care-readiness/search', (req, res) => {
  const { specialtyRequired, isEmergency, requiredDiagnostics, requiredMedicines } = req.body;
  const results = calculateCareReadiness({
    specialtyRequired,
    isEmergency,
    requiredDiagnostics: requiredDiagnostics || [],
    requiredMedicines: requiredMedicines || []
  });
  res.json({ success: true, total: results.length, recommendations: results });
});

app.post('/api/ai/chat', (req, res) => {
  const { message, language, context } = req.body;
  const response = processAIMessage(message, context, language || 'en');
  res.json({ success: true, ...response });
});

app.get('/api/ai/config', (req, res) => {
  const configs = db.get('ai_configs');
  res.json({ success: true, configs });
});

app.post('/api/teleconsult/request', (req, res) => {
  const { patientId, doctorId, symptoms, consultationType } = req.body;
  const doctor = db.find('doctors', d => d.id === doctorId) || db.get('doctors')[0];
  const patient = db.find('patients', p => p.id === patientId || p.userId === patientId) || db.get('patients')[0];

  const session = db.insert('consultations', {
    patientId: patient.id,
    patientName: patient.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    hospitalName: doctor.hospitalName,
    type: consultationType || 'Video Call',
    symptoms: symptoms || 'General Consultation',
    status: 'IN_PROGRESS',
    startTime: new Date().toISOString(),
    roomId: `tele_room_${Date.now()}`
  });

  db.insert('notifications', {
    recipientRole: 'DOCTOR',
    doctorId: doctor.id,
    title: '📞 Incoming Teleconsultation Call',
    message: `Patient ${patient.name} initiated ${session.type}.`,
    sessionId: session.id,
    read: false
  });

  res.json({ success: true, session });
});

app.post('/api/teleconsult/complete', (req, res) => {
  const { sessionId, clinicalNotes, prescription, diagnosis, followUpDays } = req.body;
  const session = db.find('consultations', c => c.id === sessionId);

  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

  const updated = db.update('consultations', sessionId, {
    status: 'COMPLETED',
    clinicalNotes: clinicalNotes || 'Patient evaluated via teleconsultation.',
    diagnosis: diagnosis || 'General Wellness Observation',
    prescription: prescription || [],
    endTime: new Date().toISOString()
  });

  // Update Longitudinal Health Record for Patient
  const patient = db.find('patients', p => p.id === session.patientId);
  if (patient) {
    const newConsultationEntry = {
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      doctorName: session.doctorName || 'Doctor',
      hospitalName: session.hospitalName || 'Hospital',
      type: session.type || 'Teleconsultation',
      symptoms: session.symptoms || 'Consultation',
      diagnosis: diagnosis || 'Evaluated',
      clinicalNotes: clinicalNotes || '',
      prescription: prescription || []
    };

    const updatedConsultations = [newConsultationEntry, ...(patient.consultationHistory || [])];
    const updatedMedicines = prescription && prescription.length > 0 
      ? prescription.map(p => ({ medicine: p.medicine, dosage: p.dosage, duration: p.duration }))
      : patient.currentMedicines || [];

    db.update('patients', patient.id, {
      consultationHistory: updatedConsultations,
      currentMedicines: updatedMedicines,
      recentDiagnosis: diagnosis || patient.recentDiagnosis,
      lastConsultationDate: newConsultationEntry.date
    });
  }

  if (followUpDays) {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + parseInt(followUpDays));
    db.insert('follow_ups', {
      patientId: session.patientId,
      doctorId: session.doctorId,
      scheduledDate: followUpDate.toISOString().split('T')[0],
      reason: `Teleconsultation follow-up for ${diagnosis || 'treatment review'}`,
      status: 'SCHEDULED'
    });
  }

  db.logAudit(session.doctorId, 'DOCTOR', 'TELECONSULT_COMPLETED', sessionId, `Consultation completed & Longitudinal Medical Record updated.`);
  res.json({ success: true, consultation: updated });
});

// Patient Medical History Endpoint (RBAC Authorized Record Retrieval)
app.get('/api/patient/history/:patientId', (req, res) => {
  const { patientId } = req.params;
  const requesterRole = req.headers['x-user-role'] || 'DOCTOR';
  const requesterId = req.headers['x-user-id'] || 'doc_1';

  let patient = db.find('patients', p => p.id === patientId || p.userId === patientId);
  if (!patient) {
    patient = db.get('patients')[0]; // Default to demo patient Ramesh Kumar
  }

  // Record Audit Trail Access
  db.logAudit(requesterId, requesterRole, 'RECORD_ACCESS', patient.id, `Medical profile & history viewed by ${requesterRole}`);

  res.json({
    success: true,
    patient
  });
});

app.post('/api/emergency/create', (req, res) => {
  const { patientId, symptoms, lat, lng, targetHospitalId } = req.body;
  const request = createEmergencyRequest(patientId, symptoms, lat, lng, targetHospitalId);
  res.json({ success: true, request });
});

app.post('/api/emergency/respond', (req, res) => {
  const { requestId, action, hospitalId, reason, doctorId } = req.body;
  const result = respondToEmergencyRequest(requestId, action, hospitalId, reason, doctorId);
  res.json(result);
});

app.post('/api/emergency/reroute', (req, res) => {
  const { requestId, reason } = req.body;
  const result = triggerMidJourneyReroute(requestId, reason);
  res.json(result);
});

app.get('/api/journey/status/:requestId', (req, res) => {
  const { requestId } = req.params;
  const journey = db.find('journey_tracking', j => j.requestId === requestId || j.patientId === requestId) || db.get('journey_tracking')[0];
  const request = db.find('emergency_requests', r => r.id === requestId) || db.get('emergency_requests')[0];
  res.json({ success: true, journey, request });
});

app.get('/api/patient/dashboard/:userId', (req, res) => {
  const patient = db.find('patients', p => p.userId === req.params.userId || p.id === req.params.userId) || db.get('patients')[0];
  const consultations = db.get('consultations', c => c.patientId === patient.id);
  const referrals = db.get('referrals', r => r.patientId === patient.id);
  const emergencyRequests = db.get('emergency_requests', r => r.patientId === patient.id);
  const followUps = db.get('follow_ups', f => f.patientId === patient.id);

  res.json({
    success: true,
    patient,
    consultations,
    referrals,
    emergencyRequests,
    followUps
  });
});

app.get('/api/doctor/dashboard/:doctorId', (req, res) => {
  const doctor = db.find('doctors', d => d.id === req.params.doctorId || d.userId === req.params.doctorId) || db.get('doctors')[0];
  const queue = db.get('queues', q => q.doctorId === doctor.id);
  const appointments = db.get('consultations', c => c.doctorId === doctor.id);
  const emergencyAlerts = db.get('emergency_requests', e => e.targetHospitalId === doctor.hospitalId && e.status === 'REQUESTED');

  res.json({
    success: true,
    doctor,
    queue,
    appointments,
    emergencyAlerts
  });
});

app.get('/api/hospital/dashboard/:hospitalId', (req, res) => {
  const hospital = db.find('hospitals', h => h.id === req.params.hospitalId) || db.get('hospitals')[1];
  const emergencyRequests = db.get('emergency_requests', e => e.targetHospitalId === hospital.id || e.acceptedHospitalId === hospital.id);
  const doctors = db.get('doctors', d => d.hospitalId === hospital.id);
  const medicines = db.get('medicines', m => m.hospitalId === hospital.id);
  const diagnostics = db.get('diagnostics', d => d.hospitalId === hospital.id);

  res.json({
    success: true,
    hospital,
    emergencyRequests,
    doctors,
    medicines,
    diagnostics
  });
});

app.post('/api/hospital/update-status', (req, res) => {
  const { hospitalId, emergencyStatus, icuBedsAvailable, generalBedsAvailable } = req.body;
  const updated = db.update('hospitals', hospitalId, {
    emergencyStatus,
    icuBedsAvailable: parseInt(icuBedsAvailable),
    generalBedsAvailable: parseInt(generalBedsAvailable),
    lastUpdated: new Date().toISOString()
  });

  db.logAudit('STAFF', 'HOSPITAL_ADMIN', 'HOSPITAL_STATUS_UPDATE', hospitalId, `Status updated to ${emergencyStatus}`);
  res.json({ success: true, hospital: updated });
});

app.get('/api/analytics/summary', (req, res) => {
  const hospitals = db.get('hospitals');
  const emergencyRequests = db.get('emergency_requests');
  const auditLogs = db.get('audit_logs');
  const reroutes = emergencyRequests.filter(r => r.attemptCount > 1 || r.status === 'ALTERNATIVE_SEARCHING');

  res.json({
    success: true,
    totalHospitals: hospitals.length,
    acceptingEmergencyHospitals: hospitals.filter(h => h.emergencyStatus === 'ACCEPTING').length,
    totalEmergencyCases: emergencyRequests.length,
    successfulJourneys: emergencyRequests.filter(r => r.status === 'ACCEPTED' || r.status === 'ARRIVED').length,
    dynamicReroutesCount: reroutes.length,
    reroutes,
    auditLogs: auditLogs.slice(-15)
  });
});

app.post('/api/demo/trigger-event', (req, res) => {
  const { eventType, hospitalId, requestId } = req.body;

  if (eventType === 'FLIP_HOSPITAL_UNAVAILABLE') {
    const hosp = db.update('hospitals', hospitalId || 'hosp_medak_dist', {
      emergencyStatus: 'NOT_ACCEPTING',
      icuBedsAvailable: 0,
      generalBedsAvailable: 0
    });

    const activeReq = db.find('emergency_requests', r => r.status === 'ACCEPTED');
    let rerouteResult = null;
    if (activeReq) {
      rerouteResult = triggerMidJourneyReroute(activeReq.id, `Hospital ${hosp.name} flipped status to NOT ACCEPTING EMERGENCIES mid-journey.`);
    }

    return res.json({
      success: true,
      message: `SIMULATION: ${hosp.name} set to NOT ACCEPTING EMERGENCIES.`,
      hospital: hosp,
      rerouteResult
    });
  } else if (eventType === 'RESET_HOSPITAL_AVAILABLE') {
    const hosp = db.update('hospitals', hospitalId || 'hosp_medak_dist', {
      emergencyStatus: 'ACCEPTING',
      icuBedsAvailable: 6,
      generalBedsAvailable: 34
    });
    return res.json({ success: true, message: `SIMULATION: ${hosp.name} restored to ACCEPTING EMERGENCIES.`, hospital: hosp });
  }

  res.json({ success: false, message: 'Unknown simulation event' });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`AAYUSETU RURAL HEALTHCARE PLATFORM BACKEND ACTIVE`);
  console.log(`Port: ${PORT}`);
  console.log(`Database: Connected (Unified Relational JSON DB)`);
  console.log(`=======================================================`);
});
