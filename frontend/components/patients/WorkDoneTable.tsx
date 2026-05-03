'use client';

import { BiPrinter, BiTrash, BiSolidPencil } from 'react-icons/bi';
import { PatientWorkDone } from '@/types';

interface WorkDoneTableProps {
  records: PatientWorkDone[];
}

export default function WorkDoneTable({ records }: WorkDoneTableProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <div className="text-4xl mb-3 animate-float">📋</div>
        <p className="text-slate-500 text-sm">No work done records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="p-4 border-b-2 border-slate-100 bg-gradient-to-r from-orange-50 to-white rounded-t-2xl">
        <h5 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500 rounded-full" />
          Work Done History
        </h5>
      </div>
      <div className="overflow-x-auto">
        <table className="cms-table w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Work Name</th>
              <th>Description</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td className="text-slate-600">{r.work_date}</td>
                <td className="font-medium">{r.work_name}</td>
                <td className="text-slate-500 text-sm max-w-[300px] truncate">{r.description}</td>
                <td>
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all" title="Edit">
                      <BiSolidPencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Print">
                      <BiPrinter className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <BiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
