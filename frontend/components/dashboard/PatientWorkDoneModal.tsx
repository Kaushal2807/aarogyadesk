'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import FormSelect from '@/components/forms/FormSelect';
import { workDoneService } from '@/lib/services/work-done';

interface PatientWorkDoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUid?: string;
  patientName?: string;
  onSave?: () => void;
}

export default function PatientWorkDoneModal({ isOpen, onClose, patientUid, patientName, onSave }: PatientWorkDoneModalProps) {
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [workDoneId, setWorkDoneId] = useState('');
  const [description, setDescription] = useState('');
  const [workDoneOptions, setWorkDoneOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchWorkTypes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workDoneService.getWorkTypes();
      setWorkDoneOptions(data.map(w => ({ value: String(w.id), label: w.work_name })));
    } catch (err) {
      console.error('Failed to fetch work types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchWorkTypes();
    }
  }, [isOpen, fetchWorkTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientUid || !patientName) return;
    try {
      setSaving(true);
      await workDoneService.create({
        patient_uid: patientUid,
        patient_name: patientName,
        work_done_id: workDoneId ? Number(workDoneId) : undefined,
        description: description || undefined,
        work_date: workDate,
      });
      onSave?.();
      onClose();
    } catch (err) {
      console.error('Failed to save work done:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Work Done" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Patient ID" value={patientUid || ''} readOnly className="bg-slate-50" />
          <FormInput label="Patient Name" value={patientName || ''} readOnly className="bg-slate-50" />
          <FormInput label="Date" type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required />
          {loading ? (
            <div className="flex items-center text-sm text-slate-400 py-2">Loading work types...</div>
          ) : (
          <FormSelect label="Work Done" value={workDoneId} onChange={(e) => setWorkDoneId(e.target.value)} options={workDoneOptions} placeholder="Select Work" required />
          )}
        </div>
        <div className="mt-4">
          <FormTextarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Describe the work done..." />
        </div>
        <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
          <Button type="submit" loading={saving}>Save Work Done</Button>
        </div>
      </form>
    </Modal>
  );
}
