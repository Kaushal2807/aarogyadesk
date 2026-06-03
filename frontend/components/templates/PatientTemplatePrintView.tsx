'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { BiPencil, BiPrinter, BiRefresh, BiSolidAward, BiSolidFile } from 'react-icons/bi';
import Button from '@/components/ui/Button';
import { patientService } from '@/lib/services/patients';
import { templateService } from '@/lib/services/templates';
import { treatmentService } from '@/lib/services/treatments';
import {
  filterTemplatesByType,
  getDefaultTemplateContent,
  PrintTemplateType,
  renderPatientTemplate,
} from '@/lib/template-render';
import { Patient, PatientTreatment, Template } from '@/types';

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
    return renderPatientTemplate(content, patient, latestTreatment);
  }, [latestTreatment, patient, selectedTemplate, type]);

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

        const firstTemplate = filterTemplatesByType(templateData, type)[0];
        setSelectedTemplateId(firstTemplate?.id || 'default');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load print template');
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

              <Button onClick={() => window.print()} icon={<BiPrinter />}>
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="print-page max-w-5xl mx-auto bg-white min-h-[1120px] shadow-sm border border-slate-200 px-10 py-8 print:max-w-none print:min-h-0 print:shadow-none print:border-0 print:px-0 print:py-0">
        <div className="template-preview prose max-w-none" dangerouslySetInnerHTML={{ __html: renderedContent }} />
      </main>

      <style jsx global>{`
        @media print {
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
