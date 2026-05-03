'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import ToothChart from '@/components/shared/ToothChart';
import { treatmentService } from '@/lib/services/treatments';

interface PatientTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUid?: string;
  patientName?: string;
  onSave?: () => void;
}

export default function PatientTreatmentModal({ isOpen, onClose, patientUid, patientName, onSave }: PatientTreatmentModalProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [estimates, setEstimates] = useState('');
  const [remarks, setRemarks] = useState('');
  const [toothData, setToothData] = useState({ upperRight: '', upperLeft: '', lowerRight: '', lowerLeft: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientUid || !patientName) return;
    try {
      setSaving(true);
      await treatmentService.create({
        patient_uid: patientUid,
        patient_name: patientName,
        diagnosis,
        treatment,
        estimates: estimates || undefined,
        remarks: remarks || undefined,
        tooth_upper_right: toothData.upperRight || undefined,
        tooth_upper_left: toothData.upperLeft || undefined,
        tooth_lower_right: toothData.lowerRight || undefined,
        tooth_lower_left: toothData.lowerLeft || undefined,
      });
      onSave?.();
      onClose();
    } catch (err) {
      console.error('Failed to save treatment:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Treatment" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Patient ID" value={patientUid || ''} readOnly className="bg-slate-50" />
            <FormInput label="Patient Name" value={patientName || ''} readOnly className="bg-slate-50" />
          </div>
          <ToothChart onChange={setToothData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea label="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} required />
            <FormTextarea label="Treatment" value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={2} required />
            <FormInput label="Estimates" value={estimates} onChange={(e) => setEstimates(e.target.value)} placeholder="e.g., ₹5,000" />
            <FormTextarea label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
          </div>
        </div>
        <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
          <Button type="submit" loading={saving}>Save Treatment</Button>
        </div>
      </form>
    </Modal>
  );
}
