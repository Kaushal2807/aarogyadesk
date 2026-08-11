'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import SearchableSelect from '@/components/forms/SearchableSelect';
import ToothChart from '@/components/shared/ToothChart';
import { treatmentService } from '@/lib/services/treatments';
import { masterTreatmentService } from '@/lib/services/master-treatment';

import { toast } from 'react-hot-toast';

interface PatientTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUid?: string;
  patientName?: string;
  onSave?: () => void;
}

export default function PatientTreatmentModal({ isOpen, onClose, patientUid, patientName, onSave }: PatientTreatmentModalProps) {
  const [diagnosisId, setDiagnosisId] = useState<string | number>('');
  const [treatmentId, setTreatmentId] = useState<string | number>('');
  const [estimates, setEstimates] = useState('');
  const [remarks, setRemarks] = useState('');
  const [toothData, setToothData] = useState({ upperRight: '', upperLeft: '', lowerRight: '', lowerLeft: '' });
  const [diagnoses, setDiagnoses] = useState<{ value: string | number; label: string }[]>([]);
  const [treatments, setTreatments] = useState<{ value: string | number; label: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const [diagnosisData, treatmentData] = await Promise.all([
        masterTreatmentService.getDiagnoses(),
        masterTreatmentService.getTreatments(),
      ]);
      setDiagnoses(diagnosisData.map(d => ({ value: d.id, label: d.diagnosis_name })));
      setTreatments(treatmentData.map(t => ({ value: t.id, label: t.treatment_name })));
    } catch (err) {
      console.error('Failed to fetch master data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDiagnosisId('');
      setTreatmentId('');
      setEstimates('');
      setRemarks('');
      setToothData({ upperRight: '', upperLeft: '', lowerRight: '', lowerLeft: '' });
      fetchMasterData();
    }
  }, [isOpen, patientUid, fetchMasterData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientUid || !patientName) return;
    try {
      setSaving(true);
      await treatmentService.create({
        patient_uid: patientUid,
        patient_name: patientName,
        diagnosis_id: diagnosisId ? Number(diagnosisId) : undefined,
        treatment_id: treatmentId ? Number(treatmentId) : undefined,
        estimates: estimates || undefined,
        remarks: remarks || undefined,
        tooth_upper_right: toothData.upperRight || undefined,
        tooth_upper_left: toothData.upperLeft || undefined,
        tooth_lower_right: toothData.lowerRight || undefined,
        tooth_lower_left: toothData.lowerLeft || undefined,
      });
      toast.success('Treatment plan added successfully', {
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
      onSave?.();
      setDiagnosisId('');
      setTreatmentId('');
      setEstimates('');
      setRemarks('');
      setToothData({ upperRight: '', upperLeft: '', lowerRight: '', lowerLeft: '' });
      onClose();
    } catch (err: any) {
      console.error('Failed to save treatment:', err);
      toast.error(err.response?.data?.detail || 'Failed to save treatment plan');
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
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-3"></div>
              <span>Loading treatment options...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect
                label="Diagnosis"
                value={diagnosisId}
                onChange={setDiagnosisId}
                options={diagnoses}
                placeholder="Select diagnosis"
                searchable
                maxDisplay={5}
              />
              <SearchableSelect
                label="Treatment"
                value={treatmentId}
                onChange={setTreatmentId}
                options={treatments}
                placeholder="Select treatment"
                searchable
                maxDisplay={5}
              />
              <FormInput label="Estimates" value={estimates} onChange={(e) => setEstimates(e.target.value)} placeholder="e.g., ₹5,000" />
              <FormTextarea label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
            </div>
          )}
        </div>
        <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
          <Button type="submit" loading={saving || loading} disabled={loading}>Save Treatment</Button>
        </div>
      </form>
    </Modal>
  );
}
