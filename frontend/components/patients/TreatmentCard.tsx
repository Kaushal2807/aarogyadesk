'use client';

import { PatientTreatment } from '@/types';

interface TreatmentCardProps {
  treatment: PatientTreatment;
}

export default function TreatmentCard({ treatment }: TreatmentCardProps) {
  const parseTeeth = (val?: string) => (val ? val.split(',').map(Number) : []);

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b-2 border-slate-100 bg-gradient-to-r from-teal-50 to-white rounded-t-2xl">
        <div>
          <h5 className="font-bold text-slate-800">Treatment Plan</h5>
          <p className="text-xs text-slate-400 mt-0.5">{treatment.created_at?.split('T')[0]}</p>
        </div>
        {treatment.estimates && (
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">
            {treatment.estimates}
          </span>
        )}
      </div>
      <div className="p-4 space-y-4">
        {/* Tooth Chart */}
        {(treatment.tooth_upper_right || treatment.tooth_upper_left || treatment.tooth_lower_right || treatment.tooth_lower_left) && (
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Teeth Involved</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Upper Right', teeth: parseTeeth(treatment.tooth_upper_right), color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                { label: 'Upper Left', teeth: parseTeeth(treatment.tooth_upper_left), color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { label: 'Lower Right', teeth: parseTeeth(treatment.tooth_lower_right), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { label: 'Lower Left', teeth: parseTeeth(treatment.tooth_lower_left), color: 'bg-amber-50 text-amber-700 border-amber-200' },
              ].map((quad) => (
                quad.teeth.length > 0 && (
                  <div key={quad.label} className={`rounded-xl p-3 border ${quad.color}`}>
                    <p className="text-xs font-medium opacity-70">{quad.label}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {quad.teeth.map((t) => (
                        <span key={t} className="w-7 h-7 rounded-md bg-white/70 flex items-center justify-center text-xs font-bold">{t}</span>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Diagnosis & Treatment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Diagnosis</p>
            <p className="text-sm text-slate-700 mt-1 font-medium">{treatment.diagnosis}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Treatment</p>
            <p className="text-sm text-slate-700 mt-1 font-medium">{treatment.treatment}</p>
          </div>
        </div>

        {/* Remarks */}
        {treatment.remarks && (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Remarks</p>
            <p className="text-sm text-slate-700 mt-1">{treatment.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}
