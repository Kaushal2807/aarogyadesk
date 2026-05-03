'use client';

import { Patient } from '@/types';

interface MedicalInfoCardProps {
  patient: Patient;
}

export default function MedicalInfoCard({ patient }: MedicalInfoCardProps) {
  const fields = [
    { label: 'Chief Complaint', value: patient.chief_complain },
    { label: 'Medical History', value: patient.medical_history },
    { label: 'Oral / Diet Habits', value: patient.oral_diet_habit },
    { label: 'Family History', value: patient.family_history },
    { label: 'X-Ray Remark', value: patient.xray_remark },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="p-4 border-b-2 border-slate-100 bg-gradient-to-r from-purple-50 to-white rounded-t-2xl">
        <h5 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full" />
          Medical Information
        </h5>
      </div>
      <div className="p-4 space-y-3">
        {fields.map((f) => (
          <div key={f.label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide sm:w-36 shrink-0">{f.label}</span>
            <span className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5 flex-1">{f.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
