'use client';

import { Patient } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

interface PaymentInfoCardProps {
  patient: Patient;
}

export default function PaymentInfoCard({ patient }: PaymentInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="p-4 border-b-2 border-slate-100 bg-gradient-to-r from-emerald-50 to-white rounded-t-2xl">
        <h5 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          Payment Information
        </h5>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-indigo-700">&#8377;{patient.total_amount.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Payment Status</p>
            <div className="flex justify-center mt-1"><StatusBadge status={patient.payment_status} /></div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Pending Amount</p>
            <p className="text-2xl font-bold text-amber-700">&#8377;{patient.payment_pending.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
