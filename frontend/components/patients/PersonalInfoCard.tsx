'use client';

import { Patient } from '@/types';

interface PersonalInfoCardProps {
  patient: Patient;
}

export default function PersonalInfoCard({ patient }: PersonalInfoCardProps) {
  const fields = [
    { label: 'Patient ID', value: patient.patient_uid },
    { label: 'Full Name', value: patient.name },
    { label: 'Age', value: patient.age },
    { label: 'Contact Number', value: patient.contact_number },
    { label: 'Address', value: patient.address },
    { label: 'Date of Visit', value: patient.date_of_visit },
    { label: 'Total Visits', value: patient.total_visit },
    { label: 'Notes', value: patient.notes || '—' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="p-4 border-b-2 border-slate-100 bg-gradient-to-r from-indigo-50 to-white rounded-t-2xl">
        <h5 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-primary-500 rounded-full" />
          Personal Information
        </h5>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{f.label}</span>
              <span className="text-sm text-slate-700 mt-0.5">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
