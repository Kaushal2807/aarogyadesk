'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { BiPencil, BiPrinter, BiRefresh, BiSolidAward, BiSolidFile } from 'react-icons/bi';
import Button from '@/components/ui/Button';
import { patientService } from '@/lib/services/patients';
import { templateService } from '@/lib/services/templates';
import { treatmentService } from '@/lib/services/treatments';
import { clinicService } from '@/lib/services/clinic';
import { auth } from '@/lib/auth';
import {
  filterTemplatesByType,
  getDefaultTemplateContent,
  PrintTemplateType,
  renderPatientTemplate,
} from '@/lib/template-render';
import { Patient, PatientTreatment, Template, Clinic } from '@/types';

interface PatientTemplatePrintViewProps {
  type: PrintTemplateType;
}

export default function PatientTemplatePrintView({ type }: PatientTemplatePrintViewProps) {
  const params = useParams();
  const uid = params.uid as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [latestTreatment, setLatestTreatment] = useState<PatientTreatment | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | 'default'>('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState<string>('');
  const [clinicName, setClinicName] = useState<string>('');
  const [clinic, setClinic] = useState<Clinic | null>(null);

  const title = type === 'case' ? 'Case Template' : 'Certificate Template';
  const switchLabel = type === 'case' ? 'Certificate Template' : 'Case Template';
  const switchHref = type === 'case'
    ? `/patients/${uid}/certificate/print`
    : `/patients/${uid}/case-details/print`;
  const editorHref = type === 'case' ? '/templates/cases' : '/templates/certificates';
  const icon = type === 'case'
    ? <BiSolidFile className="w-4 h-4" />
    : <BiSolidAward className="w-4 h-4" />;

  const typedTemplates = useMemo(() => filterTemplatesByType(templates, type), [templates, type]);

  const selectedTemplate = useMemo(() => {
    if (selectedTemplateId === 'default') return null;
    return typedTemplates.find((template) => template.id === selectedTemplateId) || null;
  }, [selectedTemplateId, typedTemplates]);

  const renderedContent = useMemo(() => {
    if (!patient) return '';
    const content = selectedTemplate?.template_content || getDefaultTemplateContent(type);
    return renderPatientTemplate(content, patient, latestTreatment, doctorName, clinicName);
  }, [latestTreatment, patient, selectedTemplate, type, doctorName, clinicName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [patientData, templateData, treatmentData] = await Promise.all([
          patientService.getByUid(uid),
          templateService.getAll(),
          type === 'certificate' ? treatmentService.getByPatient(uid) : Promise.resolve([]),
        ]);

        setPatient(patientData);
        setTemplates(templateData);
        setLatestTreatment(treatmentData?.[0] || null);

        const typedList = filterTemplatesByType(templateData, type);
        // Prefer doctor's saved default, else first match
        const lsKey = type === 'case' ? 'default_case_template_id' : 'default_certificate_template_id';
        const savedId = localStorage.getItem(lsKey);
        const preferred = savedId ? typedList.find(t => t.id === Number(savedId)) : null;
        const fallback = typedList[0];
        const toUse = preferred || fallback;
        setSelectedTemplateId(toUse?.id || 'default');

        // ── Fetch doctor & clinic names ──────────────────────────────────────
        // 1. Doctor name: use first clinic doctor name, fall back to logged-in user name
        const [doctorsData, clinicData] = await Promise.all([
          clinicService.getDoctors(),
          clinicService.getMine(),
        ]);

        const primaryDoctor = doctorsData?.[0]?.doctor_name;
        const loggedInUser = auth.getCurrentUser();
        const resolvedDoctor = primaryDoctor || loggedInUser?.name || '';
        setDoctorName(resolvedDoctor);
        setClinicName(clinicData?.clinic_name || '');
        setClinic(clinicData);

      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setError(msg || 'Failed to load print template');
      } finally {
        setLoading(false);
      }
    };

    if (uid) fetchData();
  }, [type, uid]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading print preview...</div>;
  }

  if (error || !patient) {
    return <div className="p-8 text-center text-red-500">{error || 'Patient not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="print-controls max-w-5xl mx-auto px-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-bold text-sm">
                {icon}
                {title}
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{patient.name}</h1>
              <p className="text-sm text-slate-500">{patient.patient_uid} - {patient.contact_number || 'No contact number'}</p>
              {(doctorName || clinicName) && (
                <p className="text-xs text-slate-400 mt-1">
                  {[doctorName, clinicName].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <select
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value === 'default' ? 'default' : Number(event.target.value))}
                className="min-w-[240px] border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 font-medium"
              >
                <option value="default">Default {title}</option>
                {typedTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.template_name}
                  </option>
                ))}
              </select>

              <Link
                href={switchHref}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <BiRefresh className="w-4 h-4" />
                {switchLabel}
              </Link>

              <Link
                href={editorHref}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <BiPencil className="w-4 h-4" />
                Edit
              </Link>

              <Button onClick={() => {
                window.onafterprint = () => { try { window.close(); } catch {} };
                window.print();
              }} icon={<BiPrinter />}>
                Print / Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="print-page max-w-5xl mx-auto bg-white min-h-[1120px] shadow-sm border border-slate-200 px-10 py-8 print:max-w-none print:min-h-0 print:shadow-none print:border-0 print:px-0 print:py-0">
        
        {/* CLINIC LETTERHEAD HEADER FOR PRINT */}
        <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wider">
                {clinic?.clinic_name || clinicName}
              </h1>
              {doctorName && <p className="text-lg font-semibold text-slate-700 mt-1">Dr. {doctorName}</p>}
            </div>
            <div className="text-right text-sm text-slate-600 space-y-1">
              {clinic?.address && <p>{clinic.address}</p>}
              {clinic?.phone && <p>📞 {clinic.phone}</p>}
              {clinic?.email && <p>✉️ {clinic.email}</p>}
            </div>
          </div>
        </div>

        <div className="template-preview prose max-w-none" dangerouslySetInnerHTML={{ __html: renderedContent }} />
      </main>

      <style jsx global>{`
        @media print {
          body, html {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-controls {
            display: none !important;
          }

          .template-preview {
            font-size: 12pt;
          }

          @page {
            margin: 18mm;
          }
        }
      `}</style>
    </div>
  );
}
