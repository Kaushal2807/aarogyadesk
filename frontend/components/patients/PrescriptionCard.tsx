'use client';

import { BiPrinter, BiTrash } from 'react-icons/bi';
import { PrescriptionItem } from '@/types';

type LocalPrescriptionItem = PrescriptionItem;

interface PrescriptionCardProps {
  prescription: {
    id: number;
    prescription_date: string;
    items: LocalPrescriptionItem[];
  };
}

export default function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b-2 border-slate-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
        <div>
          <h5 className="font-bold text-slate-800">Prescription</h5>
          <p className="text-xs text-slate-400 mt-0.5">{prescription.prescription_date}</p>
        </div>
        <div className="flex gap-1">
          <button className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all" title="Print">
            <BiPrinter className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
            <BiTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="cms-table w-full">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dose</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Quantity</th>
                <th>Instruction</th>
              </tr>
            </thead>
            <tbody>
              {prescription.items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.drug_name}</td>
                  <td>{item.dose_name}</td>
                  <td>{item.frequency_name}</td>
                  <td>{item.duration_name}</td>
                  <td>{item.quantity_name}</td>
                  <td className="text-slate-500">{item.instruction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
