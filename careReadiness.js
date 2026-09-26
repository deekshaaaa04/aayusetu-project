import db from './db.js';

export function calculateCareReadiness(patientReq) {
  const {
    symptomCategory = 'General',
    specialtyRequired = 'General Medicine',
    isEmergency = false,
    requiredDiagnostics = [],
    requiredMedicines = [],
    maxDistanceKm = 100
  } = patientReq;

  const hospitals = db.get('hospitals');
  const doctors = db.get('doctors');
  const diagnostics = db.get('diagnostics');
  const medicines = db.get('medicines');

  const results = hospitals.map(hosp => {
    let score = 0;
    const matchReasons = [];
    const warningFlags = [];

    if (isEmergency) {
      if (hosp.emergencyStatus === 'NOT_ACCEPTING') {
        return {
          hospital: hosp,
          readinessScore: 0,
          eligible: false,
          reason: 'FACILITY IS CURRENTLY NOT ACCEPTING EMERGENCIES',
          matchReasons: [],
          warningFlags: ['Emergency Status: NOT ACCEPTING']
        };
      } else if (hosp.emergencyStatus === 'ACCEPTING') {
        score += 30;
        matchReasons.push('Emergency Department is active and accepting critical cases (+30)');
      } else if (hosp.emergencyStatus === 'LIMITED') {
        score += 15;
        warningFlags.push('Emergency Department running at LIMITED capacity');
      }
    } else {
      score += 20;
    }

    if (isEmergency && hosp.icuBedsAvailable > 0) {
      score += 20;
      matchReasons.push(`${hosp.icuBedsAvailable} ICU beds available (+20)`);
    } else if (hosp.generalBedsAvailable > 0) {
      score += 15;
      matchReasons.push(`${hosp.generalBedsAvailable} general beds available (+15)`);
    } else {
      warningFlags.push('No immediate bed availability reported');
    }

    const matchingDocs = doctors.filter(d => 
      d.hospitalId === hosp.id && 
      d.specialty.toLowerCase() === specialtyRequired.toLowerCase() &&
      d.availabilityStatus === 'AVAILABLE'
    );

    if (matchingDocs.length > 0) {
      score += 25;
      matchReasons.push(`On-duty specialist (${specialtyRequired}) verified available: ${matchingDocs[0].name} (+25)`);
    } else {
      const genDocs = doctors.filter(d => d.hospitalId === hosp.id && d.availabilityStatus === 'AVAILABLE');
      if (genDocs.length > 0) {
        score += 10;
        warningFlags.push(`No dedicated ${specialtyRequired} specialist on duty; General Doctor available`);
      } else {
        warningFlags.push(`No available specialist or doctor currently registered on duty`);
      }
    }

    if (requiredDiagnostics.length > 0) {
      const hospDiags = diagnostics.filter(d => d.hospitalId === hosp.id && d.status === 'AVAILABLE');
      const foundCount = requiredDiagnostics.filter(req => hospDiags.some(hd => hd.name.toLowerCase().includes(req.toLowerCase()))).length;
      if (foundCount === requiredDiagnostics.length) {
        score += 15;
        matchReasons.push(`Required diagnostic tests available (+15)`);
      }
    } else {
      score += 10;
    }

    if (requiredMedicines.length > 0) {
      const hospMeds = medicines.filter(m => m.hospitalId === hosp.id && m.stockCount > 0);
      const foundMeds = requiredMedicines.filter(req => hospMeds.some(hm => hm.name.toLowerCase().includes(req.toLowerCase()))).length;
      if (foundMeds === requiredMedicines.length) {
        score += 10;
        matchReasons.push('Required emergency medicines in stock (+10)');
      }
    } else {
      score += 10;
    }

    const dist = hosp.distanceKm || 10;
    if (dist <= 15) {
      score += 10;
      matchReasons.push(`Proximity: ${dist} km (${hosp.travelTimeMinutes} mins travel time) (+10)`);
    } else if (dist <= 40) {
      score += 5;
    } else {
      score -= Math.min(15, Math.round((dist - 40) / 5));
      warningFlags.push(`Distance is ${dist} km (${hosp.travelTimeMinutes} mins)`);
    }

    const finalScore = Math.max(0, Math.min(100, score));

    const summaryWhy = matchReasons.length > 0
      ? `${hosp.name} is recommended because: ${matchReasons.slice(0, 3).join('. ')}.`
      : `${hosp.name} meets basic facility criteria with score ${finalScore}/100.`;

    return {
      hospital: hosp,
      readinessScore: finalScore,
      eligible: true,
      summaryWhy,
      matchReasons,
      warningFlags,
      doctorsAvailable: matchingDocs
    };
  });

  return results.filter(r => r.eligible).sort((a, b) => b.readinessScore - a.readinessScore);
}
