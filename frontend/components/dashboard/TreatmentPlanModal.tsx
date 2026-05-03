'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormTextarea from '@/components/forms/FormTextarea';

interface TreatmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { diagnosis: string; treatment: string }) => void;
  saving?: boolean;
}

export default function TreatmentPlanModal({ isOpen, onClose, onSave, saving }: TreatmentPlanModalProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ diagnosis, treatment });
    setDiagnosis('');
    setTreatment('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Treatment Plan" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormTextarea label="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} required placeholder="Enter diagnosis..." />
          <FormTextarea label="Treatment Plan" value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={2} required placeholder="Enter treatment plan..." />
        </div>
        <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
          <Button type="submit" loading={saving}>Save Treatment Plan</Button>
        </div>
      </form>
    </Modal>
  );
}
