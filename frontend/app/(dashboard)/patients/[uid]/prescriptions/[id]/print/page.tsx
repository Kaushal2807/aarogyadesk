'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { prescriptionService } from '@/lib/services/prescriptions';
import { clinicService } from '@/lib/services/clinic';
import { auth } from '@/lib/auth';
import { Prescription, Clinic } from '@/types';
import { BiPrinter } from 'react-icons/bi';

export default function PrintPrescriptionPage() {
  const params = useParams();
  const id = params.id as string;
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctorName, setDoctorName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, clinicData, doctorsData] = await Promise.all([
          prescriptionService.getById(Number(id)),
          clinicService.getMine().catch(() => null),
          clinicService.getDoctors().catch(() => []),
        ]);
        setPrescription(data);
        setClinic(clinicData);
        const user = auth.getCurrentUser();
        setDoctorName(doctorsData?.[0]?.doctor_name || user?.name || '');
      } catch (err) {
        console.error('Failed to fetch prescription for print:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (loading || !prescription) return;

    const timer = setTimeout(() => {
      window.print();
      try {
        window.close();
      } catch {
        // ignore
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [loading, prescription]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 bg-white min-h-screen">Loading prescription for print...</div>;
  }

  if (!prescription) {
    return <div className="p-8 text-center text-red-500 bg-white min-h-screen">Prescription not found</div>;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 py-6 px-4">
      {/* Screen Controls */}
      <div className="print-controls max-w-3xl mx-auto mb-6 flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
        <span className="text-xs font-semibold text-slate-600">Prescription Print View</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md transition-all"
        >
          <BiPrinter className="w-4 h-4" /> Print Prescription
        </button>
      </div>

      {/* Main Print Container */}
      <div className="print-page max-w-3xl mx-auto bg-white p-8 border border-slate-200 rounded-xl shadow-sm print:border-0 print:p-0 print:shadow-none">
        {/* Clinic Letterhead */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wider">
              {clinic?.clinic_name || 'AarogyaDesk Clinic'}
            </h1>
            {doctorName && <p className="text-sm font-semibold text-slate-700 mt-1">Dr. {doctorName}</p>}
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            {clinic?.address && <p>{clinic.address}</p>}
            {clinic?.phone && <p>📞 {clinic.phone}</p>}
            {clinic?.email && <p>✉️ {clinic.email}</p>}
          </div>
        </div>

        {/* Patient Details Row */}
        <div className="bg-slate-50/80 print:bg-slate-50 rounded-lg p-3 mb-6 flex flex-wrap justify-between items-center text-xs text-slate-700 border border-slate-100">
          <div>
            <span className="font-semibold text-slate-500">Patient:</span>{' '}
            <strong className="text-slate-900 text-sm">{prescription.patient_name}</strong> ({prescription.patient_uid})
          </div>
          <div>
            <span className="font-semibold text-slate-500">Date:</span>{' '}
            <strong className="text-slate-900">{prescription.prescription_date}</strong>
          </div>
        </div>

        {/* Rx Header */}
        <div className="text-xl font-bold font-serif text-slate-800 mb-3">Rx</div>

        {/* Medicines Table */}
        <table className="w-full border-collapse text-xs mb-8">
          <thead>
            <tr className="border-b-2 border-slate-300 text-slate-700 text-left bg-slate-50">
              <th className="py-2.5 px-3 font-bold">#</th>
              <th className="py-2.5 px-3 font-bold">Medicine</th>
              <th className="py-2.5 px-3 font-bold">Dose</th>
              <th className="py-2.5 px-3 font-bold">Frequency</th>
              <th className="py-2.5 px-3 font-bold">Duration</th>
              <th className="py-2.5 px-3 font-bold">QTY</th>
              <th className="py-2.5 px-3 font-bold">Instruction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {prescription.items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-2.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                <td className="py-2.5 px-3 font-bold text-slate-900">{item.drug_name || '—'}</td>
                <td className="py-2.5 px-3 text-slate-700">{item.dose_name || '—'}</td>
                <td className="py-2.5 px-3 text-slate-700">{item.frequency_name || '—'}</td>
                <td className="py-2.5 px-3 text-slate-700">{item.duration_name || '—'}</td>
                <td className="py-2.5 px-3 text-slate-700">{item.quantity_name || '—'}</td>
                <td className="py-2.5 px-3 text-slate-600">{item.instruction || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Doctor Signature */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">AarogyaDesk Clinical Management System</p>
          </div>
          <div className="text-right">
            <div className="h-10 border-b border-slate-400 mb-1 w-40 ml-auto"></div>
            <p className="font-bold text-slate-800">Doctor Signature</p>
          </div>
        </div>
      </div>

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
          .print-page {
            max-width: 100% !important;
            border: none !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
