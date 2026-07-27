'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { patientService } from '@/lib/services/patients';
import { templateService } from '@/lib/services/templates';
import { treatmentService } from '@/lib/services/treatments';
import { clinicService } from '@/lib/services/clinic';
import { auth } from '@/lib/auth';
import {
  filterTemplatesByType,
  getDefaultTemplateContent,
  renderPatientTemplate,
} from '@/lib/template-render';
import { Patient, PatientTreatment, Template, Clinic } from '@/types';

export default function CaseDetailsPage() {
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
  // Start in template view if a default template is saved
  const [activeSection, setActiveSection] = useState<'case' | 'template'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('default_case_template_id')) {
      return 'template';
    }
    return 'case';
  });

  const caseTemplates = useMemo(() => filterTemplatesByType(templates, 'case'), [templates]);

  const selectedTemplate = useMemo(() => {
    if (selectedTemplateId === 'default') return null;
    return caseTemplates.find((t) => t.id === selectedTemplateId) || null;
  }, [selectedTemplateId, caseTemplates]);

  const renderedContent = useMemo(() => {
    if (!patient) return '';
    const content = selectedTemplate?.template_content || getDefaultTemplateContent('case');
    return renderPatientTemplate(content, patient, latestTreatment, doctorName, clinicName);
  }, [patient, selectedTemplate, latestTreatment, doctorName, clinicName]);

  useEffect(() => {
    if (!uid) return;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const [patientData, templateData, treatmentData] = await Promise.all([
          patientService.getByUid(uid),
          templateService.getAll(),
          treatmentService.getByPatient(uid),
        ]);
        setPatient(patientData);
        setTemplates(templateData);
        setLatestTreatment(treatmentData?.[0] || null);

        // Prefer the doctor's saved default, fall back to first case template
        const savedId = localStorage.getItem('default_case_template_id');
        const caseTemplateList = filterTemplatesByType(templateData, 'case');
        const preferred = savedId ? caseTemplateList.find(t => t.id === Number(savedId)) : null;
        const fallback = caseTemplateList[0];
        const toUse = preferred || fallback;
        if (toUse) {
          setSelectedTemplateId(toUse.id);
          // Auto-switch to template view if we found a default
          if (preferred) setActiveSection('template');
        }

        // Fetch doctor & clinic names
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
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load case details.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading case file…</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-10 shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Case Not Found</h2>
          <p className="text-slate-500 mb-6">{error || 'Patient not found.'}</p>
          <button onClick={() => window.close()} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
            Close
          </button>
        </div>
      </div>
    );
  }

  const initials = patient.name.charAt(0).toUpperCase();
  const paymentColor = patient.payment_status === 'paid' ? '#10b981' : '#f59e0b';

  return (
    <>
      {/* Global print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { box-shadow: none !important; border: none !important; }
          body { background: white !important; }
          @page { margin: 15mm; size: A4; }
        }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .case-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
        .case-table td:first-child { font-weight: 600; background: #f8fafc; width: 35%; color: #374151; }
        .section-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 16px; overflow: hidden; }
        .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; padding: 12px 16px; border-bottom: 1px solid #e0e7ff; background: #f5f3ff; }
        .template-preview table { width: 100%; border-collapse: collapse; }
        .template-preview td { padding: 8px 12px; border: 1px solid #e2e8f0; }
        .template-preview h2 { text-align: center; font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
      `}</style>

      <div className="min-h-screen bg-slate-100 print:bg-white">

        {/* ── TOP ACTION BAR (no-print) ── */}
        <div className="no-print bg-white border-b border-slate-200 shadow-sm px-4 py-3 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.close()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <div className="h-5 w-px bg-slate-200" />
              <span className="text-sm font-semibold text-slate-700">Case File — {patient.name}</span>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">{patient.patient_uid}</span>
              {selectedTemplateId !== 'default' && (
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                  📄 {caseTemplates.find(t => t.id === selectedTemplateId)?.template_name || 'Custom Template'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Tab toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setActiveSection('case')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${activeSection === 'case' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  📋 Case Details
                </button>
                <button
                  onClick={() => setActiveSection('template')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${activeSection === 'template' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  📄 Template View
                </button>
              </div>

              {/* Template selector (only in template view) */}
              {activeSection === 'template' && (
                <select
                  value={selectedTemplateId}
                  onChange={(e) =>
                    setSelectedTemplateId(e.target.value === 'default' ? 'default' : Number(e.target.value))
                  }
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-700 font-medium"
                >
                  <option value="default">Default Case Sheet</option>
                  {caseTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.template_name}</option>
                  ))}
                </select>
              )}

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>

        {/* ── PATIENT HEADER BANNER ── */}
        <div className="max-w-4xl mx-auto px-4 pt-6 no-print">
          <div
            className="rounded-2xl p-6 text-white mb-6 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
                  {initials}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{patient.name}</h1>
                  <div className="flex flex-wrap gap-3 mt-1 text-white/80 text-sm">
                    <span>🪪 {patient.patient_uid}</span>
                    {patient.age && <span>🎂 Age: {patient.age}</span>}
                    {patient.contact_number && <span>📞 {patient.contact_number}</span>}
                    {patient.date_of_visit && <span>📅 {patient.date_of_visit}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Payment Status</p>
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
                  style={{ background: paymentColor + '33', border: `1.5px solid ${paymentColor}` }}
                >
                  {patient.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </span>
                {patient.total_amount > 0 && (
                  <p className="text-white/60 text-xs mt-1">Total: ₹{patient.total_amount}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── PRINT HEADER (only visible when printing) ── */}
        <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wider">
                {clinic?.clinic_name || clinicName || 'CASE DETAIL FILE'}
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

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-4xl mx-auto px-4 pb-10">

          {/* CASE DETAILS VIEW */}
          {(activeSection === 'case') && (
            <div className="space-y-4 print-page">

              {/* Personal Information */}
              <div className="section-card">
                <div className="section-title">👤 Personal Information</div>
                <div className="p-0">
                  <table className="case-table w-full border-collapse">
                    <tbody>
                      <tr>
                        <td>Patient UID</td>
                        <td>{patient.patient_uid}</td>
                      </tr>
                      <tr>
                        <td>Full Name</td>
                        <td>{patient.name}</td>
                      </tr>
                      <tr>
                        <td>Age</td>
                        <td>{patient.age ?? '—'}</td>
                      </tr>
                      <tr>
                        <td>Contact Number</td>
                        <td>{patient.contact_number || '—'}</td>
                      </tr>
                      <tr>
                        <td>Address</td>
                        <td>{patient.address || '—'}</td>
                      </tr>
                      <tr>
                        <td>Date of Visit</td>
                        <td>{patient.date_of_visit || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Medical Information */}
              <div className="section-card">
                <div className="section-title">🏥 Medical Information</div>
                <div className="p-0">
                  <table className="case-table w-full border-collapse">
                    <tbody>
                      <tr>
                        <td>Chief Complaint</td>
                        <td>{patient.chief_complain || '—'}</td>
                      </tr>
                      <tr>
                        <td>Medical History</td>
                        <td>{patient.medical_history || '—'}</td>
                      </tr>
                      <tr>
                        <td>Oral / Diet Habits</td>
                        <td>{patient.oral_diet_habit || '—'}</td>
                      </tr>
                      <tr>
                        <td>Family History</td>
                        <td>{patient.family_history || '—'}</td>
                      </tr>
                      <tr>
                        <td>X-Ray Remark</td>
                        <td>{patient.xray_remark || '—'}</td>
                      </tr>
                      {patient.notes && (
                        <tr>
                          <td>Additional Notes</td>
                          <td>{patient.notes}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Information */}
              <div className="section-card">
                <div className="section-title">💳 Payment Information</div>
                <div className="p-0">
                  <table className="case-table w-full border-collapse">
                    <tbody>
                      <tr>
                        <td>Payment Status</td>
                        <td>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: patient.payment_status === 'paid' ? '#d1fae5' : '#fef3c7',
                              color: patient.payment_status === 'paid' ? '#065f46' : '#92400e',
                            }}
                          >
                            {patient.payment_status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Total Amount</td>
                        <td>₹{patient.total_amount ?? 0}</td>
                      </tr>
                      <tr>
                        <td>Pending Amount</td>
                        <td>₹{patient.payment_pending ?? 0}</td>
                      </tr>
                      <tr>
                        <td>Total Visits</td>
                        <td>{patient.total_visit ?? 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Latest Treatment */}
              {latestTreatment && (
                <div className="section-card">
                  <div className="section-title">🦷 Latest Treatment Record</div>
                  <div className="p-0">
                    <table className="case-table w-full border-collapse">
                      <tbody>
                        <tr>
                          <td>Diagnosis</td>
                          <td>{latestTreatment.diagnosis || '—'}</td>
                        </tr>
                        <tr>
                          <td>Treatment Done</td>
                          <td>{latestTreatment.treatment || '—'}</td>
                        </tr>
                        <tr>
                          <td>Remarks / Advise</td>
                          <td>{latestTreatment.remarks || '—'}</td>
                        </tr>
                        <tr>
                          <td>Treatment Date</td>
                          <td>{latestTreatment.created_at?.slice(0, 10) || '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Signature Row */}
              <div className="section-card">
                <div className="p-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Prepared by</p>
                      <div className="h-10 w-40 border-b border-slate-400" />
                      <p className="text-xs text-slate-500 mt-1">Clinic Staff</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Doctor&apos;s Signature</p>
                      <div className="h-10 w-40 border-b border-slate-400" />
                      <p className="text-xs text-slate-500 mt-1">Attending Physician</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE VIEW */}
          {activeSection === 'template' && (
            <div className="print-page bg-white rounded-2xl shadow-sm border border-slate-200 px-10 py-8">
              <div className="template-preview prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
