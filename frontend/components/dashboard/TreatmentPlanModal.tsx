'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormTextarea from '@/components/forms/FormTextarea';
import { masterTreatmentService } from '@/lib/services/master-treatment';

interface TreatmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  saving?: boolean;
}

export default function TreatmentPlanModal({ isOpen, onClose, onSave, saving: externalSaving }: TreatmentPlanModalProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis || !treatment) return;

    try {
      setSaving(true);
      // Save both diagnosis and treatment to master tables
      await Promise.all([
        masterTreatmentService.createDiagnosis({ diagnosis_name: diagnosis }),
        masterTreatmentService.createTreatment({ treatment_name: treatment }),
      ]);
      
      setDiagnosis('');
      setTreatment('');
      onSave?.();
      onClose();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Treatment Plan" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormTextarea 
            label="Diagnosis" 
            value={diagnosis} 
            onChange={(e) => setDiagnosis(e.target.value)} 
            rows={2} 
            required 
            placeholder="Enter diagnosis..." 
          />
          <FormTextarea 
            label="Treatment Plan" 
            value={treatment} 
            onChange={(e) => setTreatment(e.target.value)} 
            rows={2} 
            required 
            placeholder="Enter treatment plan..." 
          />
        </div>
        <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
          <Button type="submit" loading={saving || externalSaving}>Save Treatment Plan</Button>
        </div>
      </form>
    </Modal>
  );
}
