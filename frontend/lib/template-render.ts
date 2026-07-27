import { Patient, PatientTreatment, Template } from '@/types';

export type PrintTemplateType = 'case' | 'certificate';

export const caseTemplateVariables = [
  { label: 'Patient UID', value: '{{patient_uid}}' },
  { label: 'Patient Name', value: '{{patient_name}}' },
  { label: 'Patient Age', value: '{{patient_age}}' },
  { label: 'Contact Number', value: '{{patient_contact}}' },
  { label: 'Address', value: '{{patient_address}}' },
  { label: 'Visit Date', value: '{{visit_date}}' },
  { label: 'Chief Complaint', value: '{{chief_complaint}}' },
  { label: 'Medical History', value: '{{medical_history}}' },
  { label: 'Oral / Diet Habits', value: '{{oral_habit}}' },
  { label: 'Family History', value: '{{family_history}}' },
  { label: 'X-Ray Remark', value: '{{xray_remark}}' },
  { label: 'Doctor Name', value: '{{doctor_name}}' },
  { label: 'Clinic Name', value: '{{clinic_name}}' },
];

export const certificateTemplateVariables = [
  { label: 'Patient Name', value: '{{patient_name}}' },
  { label: 'Visit Date', value: '{{visit_date}}' },
  { label: 'Complaints', value: '{{complaints}}' },
  { label: 'Diagnosis', value: '{{diagnosis}}' },
  { label: 'Treatment Done', value: '{{treatment_done}}' },
  { label: 'Treatment From', value: '{{treatment_from}}' },
  { label: 'Treatment To', value: '{{treatment_to}}' },
  { label: 'Advise', value: '{{advise}}' },
  { label: 'Doctor Name', value: '{{doctor_name}}' },
  { label: 'Clinic Name', value: '{{clinic_name}}' },
];

export const defaultCaseTemplateContent = '<h2 style="text-align:center">CASE DETAIL SHEET</h2>' +
  '<table style="width:100%;border-collapse:collapse"><tbody>' +
  '<tr><td style="padding:6px;border:1px solid #ccc;width:30%"><strong>Patient UID:</strong></td><td style="padding:6px;border:1px solid #ccc">{{patient_uid}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>Patient Name:</strong></td><td style="padding:6px;border:1px solid #ccc">{{patient_name}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>Age:</strong></td><td style="padding:6px;border:1px solid #ccc">{{patient_age}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>Contact:</strong></td><td style="padding:6px;border:1px solid #ccc">{{patient_contact}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>Address:</strong></td><td style="padding:6px;border:1px solid #ccc">{{patient_address}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>Visit Date:</strong></td><td style="padding:6px;border:1px solid #ccc">{{visit_date}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>Chief Complaint:</strong></td><td style="padding:6px;border:1px solid #ccc">{{chief_complaint}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>Medical History:</strong></td><td style="padding:6px;border:1px solid #ccc">{{medical_history}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>Oral/Diet Habits:</strong></td><td style="padding:6px;border:1px solid #ccc">{{oral_habit}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>Family History:</strong></td><td style="padding:6px;border:1px solid #ccc">{{family_history}}</td></tr>' +
  '<tr><td style="padding:6px;border:1px solid #ccc"><strong>X-Ray Remark:</strong></td><td style="padding:6px;border:1px solid #ccc">{{xray_remark}}</td></tr>' +
  '</tbody></table>' +
  '<br/><p style="text-align:right">Dr. {{doctor_name}}<br/>{{clinic_name}}</p>';

export const defaultCertificateTemplateContent = '<h2 style="text-align:center">MEDICAL CERTIFICATE</h2>' +
  '<p>This is to certify that <strong>{{patient_name}}</strong> visited our clinic on <strong>{{visit_date}}</strong>.</p>' +
  '<p><strong>Complaints:</strong> {{complaints}}</p>' +
  '<p><strong>Diagnosis:</strong> {{diagnosis}}</p>' +
  '<p><strong>Treatment Done:</strong> {{treatment_done}}</p>' +
  '<p>Treatment period: <strong>{{treatment_from}}</strong> to <strong>{{treatment_to}}</strong></p>' +
  '<p><strong>Advise:</strong> {{advise}}</p>' +
  '<br/><p style="text-align:right">Dr. {{doctor_name}}<br/>{{clinic_name}}</p>';

export const getDefaultTemplateContent = (type: PrintTemplateType) =>
  type === 'case' ? defaultCaseTemplateContent : defaultCertificateTemplateContent;

export const getTemplateType = (template: Template): PrintTemplateType | null => {
  const name = template.template_name.toLowerCase();
  if (name.includes('case')) return 'case';
  if (name.includes('certificate')) return 'certificate';
  return null;
};

export const filterTemplatesByType = (templates: Template[], type: PrintTemplateType) =>
  templates.filter((template) => getTemplateType(template) === type);

const value = (input?: string | number | null) => String(input ?? '');

export function renderPatientTemplate(
  content: string,
  patient: Patient,
  latestTreatment?: PatientTreatment | null,
  doctorName?: string,
  clinicName?: string
): string {
  const treatmentDate = latestTreatment?.created_at?.slice(0, 10) || patient.date_of_visit || '';
  const replacements: Record<string, string> = {
    patient_uid: value(patient.patient_uid),
    patient_name: value(patient.name),
    patient_age: value(patient.age),
    patient_contact: value(patient.contact_number),
    patient_address: value(patient.address),
    visit_date: value(patient.date_of_visit),
    chief_complaint: value(patient.chief_complain),
    complaints: value(patient.chief_complain),
    medical_history: value(patient.medical_history),
    oral_habit: value(patient.oral_diet_habit),
    family_history: value(patient.family_history),
    xray_remark: value(patient.xray_remark),
    diagnosis: value(latestTreatment?.diagnosis),
    treatment_done: value(latestTreatment?.treatment),
    treatment_from: value(treatmentDate),
    treatment_to: value(treatmentDate),
    advise: value(latestTreatment?.remarks),
    doctor_name: doctorName || '',
    clinic_name: clinicName || '',
  };

  return Object.entries(replacements).reduce(
    (html, [key, replacement]) => html.replace(new RegExp(`{{${key}}}`, 'g'), replacement),
    content
  );
}

