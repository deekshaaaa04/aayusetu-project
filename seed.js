import db from './db.js';

export default function seedDatabase() {
  console.log('Seeding initial database with complete longitudinal medical records...');

  db.data.users = [];
  db.data.patients = [];
  db.data.doctors = [];
  db.data.asha_workers = [];
  db.data.hospitals = [];
  db.data.departments = [];
  db.data.facilities = [];
  db.data.facility_availability = [];
  db.data.appointments = [];
  db.data.queues = [];
  db.data.consultations = [];
  db.data.prescriptions = [];
  db.data.referrals = [];
  db.data.emergency_requests = [];
  db.data.ambulances = [];
  db.data.journey_tracking = [];
  db.data.diagnostics = [];
  db.data.medicines = [];
  db.data.medicine_availability = [];
  db.data.follow_ups = [];
  db.data.notifications = [];
  db.data.audit_logs = [];
  db.data.ai_configs = [];

  const users = [
    {
      id: 'usr_patient_1',
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      role: 'PATIENT',
      otp: '123456',
      password: 'password123',
      village: 'Rampur',
      mandal: 'Medak Rural',
      district: 'Medak',
      state: 'Telangana',
      verified: true
    },
    {
      id: 'usr_doctor_1',
      name: 'Dr. Anjali Sharma',
      mobile: '9876543211',
      role: 'DOCTOR',
      password: 'password123',
      specialty: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology)',
      registrationNo: 'TSMC/2015/8472',
      hospitalId: 'hosp_medak_dist',
      verified: true
    },
    {
      id: 'usr_asha_1',
      name: 'Sunitha Devi',
      mobile: '9876543212',
      role: 'ASHA_WORKER',
      password: 'password123',
      assignedVillage: 'Rampur',
      assignedBlock: 'Medak Rural',
      district: 'Medak',
      verified: true
    },
    {
      id: 'usr_staff_1',
      name: 'Rajesh Patel',
      mobile: '9876543213',
      role: 'HOSPITAL_STAFF',
      password: 'password123',
      hospitalId: 'hosp_medak_dist',
      designation: 'Triage Desk Officer',
      verified: true
    },
    {
      id: 'usr_admin_1',
      name: 'Dr. V. K. Rao',
      mobile: '9876543214',
      role: 'HOSPITAL_ADMIN',
      password: 'password123',
      hospitalId: 'hosp_medak_dist',
      designation: 'Medical Superintendent',
      verified: true
    },
    {
      id: 'usr_govt_1',
      name: 'Suresh Varma',
      mobile: '9876543215',
      role: 'GOVERNMENT',
      password: 'password123',
      designation: 'District Health Director',
      district: 'Medak',
      verified: true
    }
  ];

  users.forEach(u => db.insert('users', u));

  // Enriched Patient Profile with Complete Longitudinal History
  db.insert('patients', {
    id: 'pat_1',
    userId: 'usr_patient_1',
    name: 'Ramesh Kumar',
    age: 42,
    gender: 'Male',
    bloodGroup: 'O+',
    mobile: '9876543210',
    emergencyContact: '+91 9876500001 (Wife - Lakshmi Devi)',
    location: {
      address: 'House #4-12, Main Street, Rampur Village',
      village: 'Rampur',
      block: 'Medak Rural',
      district: 'Medak',
      state: 'Telangana',
      lat: 18.045,
      lng: 78.261
    },
    // Clinical Summary & Profile Data
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
    significantVitals: 'BP: 150/98 mmHg | HR: 92 bpm | SpO2: 96% | FBS: 138 mg/dL',
    
    // Detailed Longitudinal Records
    consultationHistory: [
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
          { medicine: 'Amlodipine 5mg', dosage: '1 Tab Night', duration: '30 Days' },
          { medicine: 'Sorbitrate 5mg (Sublingual)', dosage: 'SOS during acute chest tightness', duration: 'As needed' }
        ]
      },
      {
        date: '15 Aug 2026',
        doctorName: 'Dr. Prakash Reddy (General Medicine)',
        hospitalName: 'Rampur PHC',
        type: 'OPD Physical Consultation',
        symptoms: 'Routine Diabetes & BP Review',
        diagnosis: 'Type 2 Diabetes & Stage 1 Essential Hypertension',
        clinicalNotes: 'Fasting blood sugar 138 mg/dL, HbA1c 7.2%. Adjusted Metformin dosage to 500mg BD. Advised low salt diet.',
        prescription: [
          { medicine: 'Metformin 500mg', dosage: '1 Tab BD', duration: '90 Days' },
          { medicine: 'Telmisartan 40mg', dosage: '1 Tab Morning', duration: '90 Days' }
        ]
      }
    ],

    diagnosticReports: [
      { testName: '12-Lead ECG Test', category: 'Cardiology', date: '12 Sept 2026', result: 'Sinus Rhythm, Mild LV strain pattern', hospitalName: 'Medak District Area Hospital', status: 'COMPLETED' },
      { testName: 'Fasting Blood Sugar & HbA1c', category: 'Pathology', date: '15 Aug 2026', result: 'FBS: 138 mg/dL | HbA1c: 7.2% (Moderate control)', hospitalName: 'Rampur PHC', status: 'COMPLETED' },
      { testName: 'Digital Chest X-Ray (PA View)', category: 'Radiology', date: '01 Aug 2026', result: 'Clear lung fields, Normal cardiothoracic ratio', hospitalName: 'Medak District Area Hospital', status: 'COMPLETED' }
    ],

    hospitalVisits: [
      { date: '12 Sept 2026', facilityName: 'Medak District Area Hospital', department: 'Cardiology OPD', reason: 'Emergency Referral - Chest tightness & BP Spike', status: 'Evaluated & Stabilized' },
      { date: '15 Aug 2026', facilityName: 'Rampur PHC', department: 'General Medicine', reason: 'Routine Chronic Disease Follow-up', status: 'Completed' }
    ],

    followUpHistory: [
      { scheduledDate: '26 Sept 2026', doctorName: 'Dr. Anjali Sharma', hospitalName: 'Medak District Area Hospital', reason: 'Cardiology 2-week BP & ECG progress check', status: 'SCHEDULED' },
      { scheduledDate: '29 Aug 2026', doctorName: 'Dr. Prakash Reddy', hospitalName: 'Rampur PHC', reason: '14-day Diabetes check', status: 'COMPLETED' }
    ],

    maternalStatus: 'N/A',
    languagePreference: 'en'
  });

  const hospitals = [
    {
      id: 'hosp_phc_rampur',
      name: 'Rampur Primary Health Centre (PHC)',
      type: 'PHC',
      level: 'Primary',
      district: 'Medak',
      mandal: 'Medak Rural',
      address: 'Rampur Main Road, Medak',
      contact: '08452-220111',
      lat: 18.048,
      lng: 78.265,
      distanceKm: 1.2,
      travelTimeMinutes: 5,
      emergencyStatus: 'ACCEPTING',
      icuBedsTotal: 0,
      icuBedsAvailable: 0,
      generalBedsTotal: 10,
      generalBedsAvailable: 4,
      oxygenAvailable: true,
      ventilatorAvailable: false,
      ambulanceAvailable: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'hosp_medak_dist',
      name: 'Medak District Area Hospital',
      type: 'District Hospital',
      level: 'Secondary',
      district: 'Medak',
      mandal: 'Medak Urban',
      address: 'Hospital Road, Medak Town',
      contact: '08452-223456',
      lat: 18.041,
      lng: 78.258,
      distanceKm: 14.5,
      travelTimeMinutes: 22,
      emergencyStatus: 'ACCEPTING',
      icuBedsTotal: 15,
      icuBedsAvailable: 6,
      generalBedsTotal: 120,
      generalBedsAvailable: 34,
      oxygenAvailable: true,
      ventilatorAvailable: true,
      ambulanceAvailable: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'hosp_gandhi_secunderabad',
      name: 'Gandhi Tertiary Care & Medical College',
      type: 'Tertiary Hospital',
      level: 'Tertiary',
      district: 'Hyderabad',
      mandal: 'Musheerabad',
      address: 'Padmarao Nagar, Secunderabad',
      contact: '040-27505555',
      lat: 17.425,
      lng: 78.501,
      distanceKm: 85.0,
      travelTimeMinutes: 95,
      emergencyStatus: 'ACCEPTING',
      icuBedsTotal: 80,
      icuBedsAvailable: 18,
      generalBedsTotal: 600,
      generalBedsAvailable: 140,
      oxygenAvailable: true,
      ventilatorAvailable: true,
      ambulanceAvailable: true,
      lastUpdated: new Date().toISOString()
    }
  ];

  hospitals.forEach(h => db.insert('hospitals', h));

  const doctors = [
    {
      id: 'doc_1',
      userId: 'usr_doctor_1',
      name: 'Dr. Anjali Sharma',
      specialty: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology)',
      hospitalId: 'hosp_medak_dist',
      hospitalName: 'Medak District Area Hospital',
      consultationFee: 200,
      experienceYears: 12,
      availabilityStatus: 'AVAILABLE',
      teleconsultAvailable: true,
      workingHours: '09:00 AM - 04:00 PM',
      rating: 4.8
    },
    {
      id: 'doc_2',
      userId: 'usr_doc_2',
      name: 'Dr. Prakash Reddy',
      specialty: 'General Medicine',
      qualification: 'MBBS, MD',
      hospitalId: 'hosp_phc_rampur',
      hospitalName: 'Rampur Primary Health Centre (PHC)',
      consultationFee: 0,
      experienceYears: 8,
      availabilityStatus: 'AVAILABLE',
      teleconsultAvailable: true,
      workingHours: '08:00 AM - 02:00 PM',
      rating: 4.6
    }
  ];

  doctors.forEach(d => db.insert('doctors', d));

  db.insert('asha_workers', {
    id: 'asha_1',
    userId: 'usr_asha_1',
    name: 'Sunitha Devi',
    mobile: '9876543212',
    village: 'Rampur',
    block: 'Medak Rural',
    district: 'Medak',
    assignedPatientsCount: 142,
    highRiskMaternalCount: 4,
    highRiskChronicCount: 11
  });

  const ambulances = [
    {
      id: 'amb_108_medak_1',
      vehicleNo: 'TS 15 A 1081',
      driverName: 'Mohd. Rafiq',
      driverPhone: '9876599901',
      type: 'ALS (Advanced Life Support)',
      baseHospitalId: 'hosp_medak_dist',
      currentLocation: { lat: 18.043, lng: 78.260 },
      status: 'AVAILABLE',
      equipment: ['Defibrillator', 'Ventilator', 'ECG', 'Oxygen']
    }
  ];
  ambulances.forEach(a => db.insert('ambulances', a));

  const diagnostics = [
    { id: 'diag_ecg', name: '12-Lead ECG Test', category: 'Cardiology', hospitalId: 'hosp_medak_dist', status: 'AVAILABLE', price: 150, turnsTimeMins: 15 },
    { id: 'diag_blood_sugar', name: 'Fasting Blood Sugar & HbA1c', category: 'Pathology', hospitalId: 'hosp_phc_rampur', status: 'AVAILABLE', price: 50, turnsTimeMins: 10 }
  ];
  diagnostics.forEach(d => db.insert('diagnostics', d));

  const medicines = [
    { id: 'med_telmisartan', name: 'Telmisartan 40mg', category: 'Hypertension', hospitalId: 'hosp_medak_dist', stockCount: 450, status: 'AVAILABLE' },
    { id: 'med_amlodipine', name: 'Amlodipine 5mg', category: 'Hypertension', hospitalId: 'hosp_phc_rampur', stockCount: 120, status: 'AVAILABLE' }
  ];
  medicines.forEach(m => db.insert('medicines', m));

  db.insert('ai_configs', {
    version: 'v2.4.0',
    status: 'APPROVED',
    createdTime: new Date().toISOString(),
    systemInstruction: 'You are Aayusetu AI Health Assistant, supporting rural healthcare triage, facility navigation, and medical guidance.',
    safetyDisclaimer: 'Notice: Aayusetu AI is an assistive decision tool and does not provide definitive medical diagnosis.'
  });

  db.insert('queues', {
    id: 'q_medak_101',
    hospitalId: 'hosp_medak_dist',
    doctorId: 'doc_1',
    patientId: 'pat_1',
    patientName: 'Ramesh Kumar',
    tokenNo: 14,
    currentToken: 11,
    patientsAhead: 3,
    estimatedWaitMins: 25,
    status: 'WAITING'
  });

  db.insert('consultations', {
    id: 'cons_prev_101',
    patientId: 'pat_1',
    doctorId: 'doc_1',
    doctorName: 'Dr. Anjali Sharma',
    hospitalName: 'Medak District Area Hospital',
    date: '2026-09-12',
    type: 'Teleconsultation (Video)',
    symptoms: 'Chest pain + breathing difficulty',
    diagnosis: 'Hypertensive Heart Disease / Exertional Angina',
    clinicalNotes: 'BP 150/98 mmHg. Patient presented with acute chest tightness. Advised 12-lead ECG & sublingual Sorbitrate SOS.',
    prescription: [
      { medicine: 'Telmisartan 40mg', dosage: '1 Tab Morning', duration: '30 Days' },
      { medicine: 'Amlodipine 5mg', dosage: '1 Tab Night', duration: '30 Days' },
      { medicine: 'Metformin 500mg', dosage: '1 Tab BD', duration: '30 Days' }
    ],
    status: 'COMPLETED'
  });

  console.log('Database successfully seeded with complete longitudinal health records.');
}
