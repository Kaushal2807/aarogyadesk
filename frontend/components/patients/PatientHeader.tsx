'use client';

import Link from 'next/link';
import { BiArrowBack } from 'react-icons/bi';
import { Patient } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

interface PatientHeaderProps {
  patient: Patient;
}

export default function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-5 text-white mb-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{patient.name}</h2>
            <p className="text-white/80 text-sm">{patient.patient_uid} &middot; Age: {patient.age} &middot; {patient.contact_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-white/70">Payment Status</p>
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <StatusBadge status={patient.payment_status} />
            </div>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium backdrop-blur-sm transition-all">
            <BiArrowBack className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
