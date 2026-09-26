import db from './db.js';
import { calculateCareReadiness } from './careReadiness.js';

export function createEmergencyRequest(patientId, symptomDescription, currentLat, currentLng, requestedHospitalId = null) {
  const patient = db.find('patients', p => p.id === patientId || p.userId === patientId) || {
    id: 'pat_1',
    name: 'Ramesh Kumar',
    mobile: '9876543210',
    location: { village: 'Rampur', district: 'Medak' }
  };

  let targetHospital = null;
  if (requestedHospitalId) {
    targetHospital = db.find('hospitals', h => h.id === requestedHospitalId);
  } else {
    const ready = calculateCareReadiness({ isEmergency: true });
    targetHospital = ready.length > 0 ? ready[0].hospital : db.get('hospitals')[0];
  }

  const req = db.insert('emergency_requests', {
    patientId: patient.id,
    patientName: patient.name,
    patientMobile: patient.mobile,
    location: { lat: currentLat || 18.045, lng: currentLng || 78.261, village: patient.location.village || 'Rampur' },
    symptoms: symptomDescription || 'Acute emergency triage escalation',
    targetHospitalId: targetHospital.id,
    targetHospitalName: targetHospital.name,
    status: 'REQUESTED',
    denialReason: null,
    attemptCount: 1,
    history: [
      { status: 'REQUESTED', hospitalName: targetHospital.name, timestamp: new Date().toISOString() }
    ]
  });

  db.logAudit(patient.id, 'PATIENT', 'EMERGENCY_REQUEST_CREATED', req.id, `Emergency requested for ${targetHospital.name}`);

  db.insert('notifications', {
    recipientRole: 'HOSPITAL_STAFF',
    hospitalId: targetHospital.id,
    title: '🚨 CRITICAL EMERGENCY REQUEST',
    message: `Patient ${patient.name} from ${patient.location.village} requested immediate emergency admission.`,
    category: 'EMERGENCY',
    requestId: req.id,
    read: false
  });

  return req;
}

export function respondToEmergencyRequest(requestId, action, hospitalId, reason = null, doctorId = null) {
  const req = db.find('emergency_requests', r => r.id === requestId);
  if (!req) return { error: 'Request not found' };

  if (action === 'ACCEPT') {
    const hospital = db.find('hospitals', h => h.id === hospitalId) || { name: 'Hospital' };
    const ambulance = db.find('ambulances', a => a.status === 'AVAILABLE') || db.get('ambulances')[0];
    
    if (ambulance) {
      db.update('ambulances', ambulance.id, { status: 'DISPATCHED', activeRequestId: req.id });
    }

    const updated = db.update('emergency_requests', requestId, {
      status: 'ACCEPTED',
      assignedDoctorId: doctorId || 'doc_1',
      assignedAmbulanceId: ambulance ? ambulance.id : null,
      acceptedHospitalId: hospitalId,
      acceptedHospitalName: hospital.name,
      history: [
        ...req.history,
        { status: 'ACCEPTED', hospitalName: hospital.name, timestamp: new Date().toISOString() }
      ]
    });

    db.insert('journey_tracking', {
      requestId: req.id,
      patientId: req.patientId,
      patientName: req.patientName,
      hospitalId,
      hospitalName: hospital.name,
      ambulanceId: ambulance ? ambulance.id : null,
      ambulanceVehicleNo: ambulance ? ambulance.vehicleNo : 'TS 15 A 1081',
      driverPhone: ambulance ? ambulance.driverPhone : '9876599901',
      pickupLocation: req.location,
      destinationLocation: { lat: hospital.lat || 18.041, lng: hospital.lng || 78.258 },
      currentEtaMinutes: hospital.travelTimeMinutes || 20,
      journeyStatus: 'AMBULANCE_ASSIGNED',
      timeline: [
        { stage: 'Referral/Emergency Created', done: true, time: new Date().toLocaleTimeString() },
        { stage: 'Hospital Accepted', done: true, time: new Date().toLocaleTimeString() },
        { stage: 'Transport Dispatched', done: true, time: new Date().toLocaleTimeString() },
        { stage: 'En Route to Destination', done: false, time: 'Pending' },
        { stage: 'Arrived at Emergency Care', done: false, time: 'Pending' }
      ]
    });

    db.insert('notifications', {
      recipientRole: 'PATIENT',
      patientId: req.patientId,
      title: '✅ Emergency Request ACCEPTED',
      message: `${hospital.name} accepted your request! Ambulance ${ambulance ? ambulance.vehicleNo : '108'} has been dispatched.`,
      category: 'EMERGENCY',
      read: false
    });

    db.logAudit('STAFF', 'HOSPITAL_STAFF', 'EMERGENCY_ACCEPTED', req.id, `Emergency accepted by ${hospital.name}`);
    return { success: true, request: updated };
  } else if (action === 'DENY') {
    if (!reason) reason = 'Facility capacity exhausted / Required specialist currently unavailable';

    const history = [
      ...req.history,
      { status: 'DENIED', hospitalName: req.targetHospitalName, reason, timestamp: new Date().toISOString() }
    ];

    const alternatives = calculateCareReadiness({ isEmergency: true }).filter(r => r.hospital.id !== hospitalId);

    if (alternatives.length > 0) {
      const nextHosp = alternatives[0].hospital;
      const updated = db.update('emergency_requests', requestId, {
        status: 'ALTERNATIVE_SEARCHING',
        denialReason: reason,
        targetHospitalId: nextHosp.id,
        targetHospitalName: nextHosp.name,
        attemptCount: req.attemptCount + 1,
        history: [
          ...history,
          { status: 'REROUTED_ALTERNATIVE_SEARCH', hospitalName: nextHosp.name, timestamp: new Date().toISOString() }
        ]
      });

      db.insert('notifications', {
        recipientRole: 'PATIENT',
        patientId: req.patientId,
        title: '⚠️ Dynamic Rerouting Triggered',
        message: `Initial facility (${req.targetHospitalName}) denied: "${reason}". Automatically rerouting to ready alternative: ${nextHosp.name}.`,
        category: 'EMERGENCY',
        read: false
      });

      db.logAudit('SYSTEM', 'ENGINE', 'DYNAMIC_REROUTE_TRIGGERED', req.id, `Denied by ${req.targetHospitalName}. Rerouted to ${nextHosp.name}`);

      return {
        success: true,
        request: updated,
        rerouted: true,
        newHospital: nextHosp,
        message: `Denied by ${req.targetHospitalName}. Automatically rerouted to ${nextHosp.name}.`
      };
    } else {
      const updated = db.update('emergency_requests', requestId, {
        status: 'DENIED_NO_ALTERNATIVE',
        denialReason: reason,
        history
      });
      return { success: false, request: updated, message: 'All local facilities currently report full capacity. Escalated to State Tele-Triage.' };
    }
  }
}

export function triggerMidJourneyReroute(requestId, reason = 'Target facility turned unavailable mid-journey') {
  const req = db.find('emergency_requests', r => r.id === requestId);
  const journey = db.find('journey_tracking', j => j.requestId === requestId);
  if (!req || !journey) return { error: 'Active journey not found' };

  const currentHospId = req.targetHospitalId || req.acceptedHospitalId;
  const alternatives = calculateCareReadiness({ isEmergency: true }).filter(r => r.hospital.id !== currentHospId);

  if (alternatives.length > 0) {
    const newHosp = alternatives[0].hospital;
    
    db.update('emergency_requests', requestId, {
      targetHospitalId: newHosp.id,
      targetHospitalName: newHosp.name,
      acceptedHospitalId: newHosp.id,
      acceptedHospitalName: newHosp.name,
      status: 'ACCEPTED',
      history: [
        ...req.history,
        { status: 'MID_JOURNEY_REROUTE', hospitalName: newHosp.name, reason, timestamp: new Date().toISOString() }
      ]
    });

    const updatedJourney = db.update('journey_tracking', journey.id, {
      hospitalId: newHosp.id,
      hospitalName: newHosp.name,
      destinationLocation: { lat: newHosp.lat, lng: newHosp.lng },
      currentEtaMinutes: newHosp.travelTimeMinutes,
      rerouted: true,
      rerouteReason: reason,
      timeline: [
        ...journey.timeline,
        { stage: `⚠️ REROUTED MID-JOURNEY to ${newHosp.name}`, done: true, time: new Date().toLocaleTimeString() }
      ]
    });

    db.insert('notifications', {
      recipientRole: 'PATIENT',
      patientId: req.patientId,
      title: '🔄 HEALTHCARE JOURNEY RECOVERY: REROUTED',
      message: `Mid-journey alert: Primary facility updated to ${newHosp.name} due to unexpected capacity shift. Ambulance route updated.`,
      category: 'EMERGENCY',
      read: false
    });

    db.logAudit('SYSTEM', 'JOURNEY_ENGINE', 'MID_JOURNEY_REROUTE', requestId, `Rerouted to ${newHosp.name}: ${reason}`);

    return { success: true, journey: updatedJourney, newHospital: newHosp };
  } else {
    return { error: 'No ready alternative facilities found.' };
  }
}
