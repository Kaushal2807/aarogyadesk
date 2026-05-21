"use client";

import { useState } from 'react';
import { PatientTreatment } from '@/types';
import { treatmentService } from '@/lib/services/treatments';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

interface Props {
  treatment: PatientTreatment;
  uid: string;
  onDeleted?: () => void;
}

const parseTeeth = (val?: string) => (val ? val.split(',').filter(Boolean).map(Number) : []);

export default function TreatmentHistoryCard({ treatment, uid, onDeleted }: Props) {
  const ur = parseTeeth(treatment.tooth_upper_right);
  const ul = parseTeeth(treatment.tooth_upper_left);
  const lr = parseTeeth(treatment.tooth_lower_right);
  const ll = parseTeeth(treatment.tooth_lower_left);

  const dateLabel = treatment.created_at ? new Date(treatment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const renderNumber = (n: number, selected: number[]) => (
    <span
      key={n}
      className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-semibold border ${selected.includes(n) ? 'bg-primary-500 text-white border-primary-700' : 'bg-white text-slate-600 border-slate-200'}`}
    >
      {n}
    </span>
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await treatmentService.delete(treatment.id);
      toast.success('Treatment deleted', { position: 'bottom-right' });
      onDeleted?.();
      setShowConfirm(false);
    } catch (err) {
      console.error('Failed to delete treatment', err);
      toast.error('Failed to delete treatment', { position: 'bottom-right' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">Treatment Date: <span className="font-normal text-slate-600">{dateLabel}</span></h3>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowConfirm(true)} className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50" disabled={deleting}>
            🗑 Delete
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <div className="bg-slate-50 rounded-xl p-4 mb-3">
            <p className="text-xs text-slate-400 uppercase">Diagnosis</p>
            <p className="text-sm text-slate-800 font-medium mt-1">{treatment.diagnosis || '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 mb-3">
            <p className="text-xs text-slate-400 uppercase">Treatment</p>
            <p className="text-sm text-slate-800 font-medium mt-1">{treatment.treatment || '-'}</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase">Estimates</p>
            <p className="text-sm text-slate-800 font-medium mt-1">{treatment.estimates || '-'}</p>
            <p className="text-xs text-slate-400 uppercase mt-4">Remarks</p>
            <p className="text-sm text-slate-700 mt-1">{treatment.remarks || '-'}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium mb-3">Upper</p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                {/** Upper Right: 8..1 */}
                {[8,7,6,5,4,3,2,1].map((n) => renderNumber(n, ur))}
              </div>
              <div className="w-6" />
              <div className="flex items-center gap-2">
                {/** Upper Left: 1..8 */}
                {[1,2,3,4,5,6,7,8].map((n) => renderNumber(n, ul))}
              </div>
            </div>

            <div className="h-6" />

            <p className="text-sm text-slate-500 font-medium mb-3">Lower</p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                {/** Lower Right: 8..1 */}
                {[8,7,6,5,4,3,2,1].map((n) => renderNumber(n, lr))}
              </div>
              <div className="w-6" />
              <div className="flex items-center gap-2">
                {/** Lower Left: 1..8 */}
                {[1,2,3,4,5,6,7,8].map((n) => renderNumber(n, ll))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm delete" size="sm">
        <div className="py-4">
          <p className="text-sm text-slate-700">Are you sure you want to delete this treatment? This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-3 mt-4">
            <Button onClick={() => setShowConfirm(false)} size="md" className="bg-white border hover:bg-slate-50">Cancel</Button>
            <Button onClick={onDeleteConfirm} size="md" loading={deleting} className="bg-red-600 text-white hover:bg-red-700">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
