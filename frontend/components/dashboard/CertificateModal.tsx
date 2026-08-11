'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';

import { toast } from 'react-hot-toast';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUid?: string;
  patientName?: string;
}

export default function CertificateModal({ isOpen, onClose, patientUid, patientName }: CertificateModalProps) {
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [complaints, setComplaints] = useState('');
  const [treatmentDone, setTreatmentDone] = useState('');
  const [treatmentFrom, setTreatmentFrom] = useState('');
  const [treatmentTo, setTreatmentTo] = useState('');
  const [advice, setAdvice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Certificate generated successfully', {
      style: { background: '#10b981', color: '#fff', fontWeight: '500' },
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Certificate" size="md">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Patient ID" value={patientUid || ''} readOnly className="bg-slate-50" />
          <FormInput label="Patient Name" value={patientName || ''} readOnly className="bg-slate-50" />
          <div className="md:col-span-2 flex justify-center">
            <div className="w-1/2">
              <FormInput label="Visit Date" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
            </div>
          </div>
          <FormTextarea label="Complaints" value={complaints} onChange={(e) => setComplaints(e.target.value)} rows={2} />
          <FormTextarea label="Treatment Done" value={treatmentDone} onChange={(e) => setTreatmentDone(e.target.value)} rows={2} />
          <FormInput label="Treatment From" type="date" value={treatmentFrom} onChange={(e) => setTreatmentFrom(e.target.value)} />
          <FormInput label="Treatment To" type="date" value={treatmentTo} onChange={(e) => setTreatmentTo(e.target.value)} />
          <div className="md:col-span-2">
            <FormTextarea label="Advice" value={advice} onChange={(e) => setAdvice(e.target.value)} rows={2} />
          </div>
        </div>
        <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
          <Button type="submit">Generate Certificate</Button>
        </div>
      </form>
    </Modal>
  );
}
