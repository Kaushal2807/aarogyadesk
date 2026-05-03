'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import FormSelect from '@/components/forms/FormSelect';
import { Patient } from '@/types';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (patient: Partial<Patient>) => void;
  saving?: boolean;
}

export default function EditPatientModal({ isOpen, onClose, patient, onSave, saving }: EditPatientModalProps) {
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patient) {
      setForm({
        patient_uid: patient.patient_uid,
        name: patient.name,
        age: String(patient.age ?? ''),
        contact_number: patient.contact_number ?? '',
        address: patient.address ?? '',
        date_of_visit: patient.date_of_visit ?? '',
        notes: patient.notes ?? '',
        xray_remark: patient.xray_remark ?? '',
        chief_complain: patient.chief_complain ?? '',
        medical_history: patient.medical_history ?? '',
        oral_diet_habit: patient.oral_diet_habit ?? '',
        family_history: patient.family_history ?? '',
        total_visit: String(patient.total_visit),
        total_amount: String(patient.total_amount),
        payment_status: patient.payment_status,
        payment_pending: String(patient.payment_pending),
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    onSave({
      ...form,
      age: Number(form.age),
      total_visit: Number(form.total_visit),
      total_amount: Number(form.total_amount),
      payment_pending: Number(form.payment_pending),
      payment_status: form.payment_status as 'paid' | 'partial' | 'pending',
    } as Partial<Patient>);
    onClose();
  };

  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Patient" size="xl">
      <form onSubmit={handleSubmit}>
        <div className="py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Patient ID" name="patient_uid" value={form.patient_uid || ''} onChange={handleChange} readOnly className="bg-slate-50" />
            <FormInput label="Full Name" name="name" value={form.name || ''} onChange={handleChange} required />
            <FormInput label="Age" name="age" value={form.age || ''} onChange={handleChange} type="number" />
            <FormInput label="Contact Number" name="contact_number" value={form.contact_number || ''} onChange={handleChange} />
            <FormInput label="Address" name="address" value={form.address || ''} onChange={handleChange} />
            <FormInput label="Date of Visit" name="date_of_visit" value={form.date_of_visit || ''} onChange={handleChange} type="date" />
            <FormTextarea label="Notes" name="notes" value={form.notes || ''} onChange={handleChange} rows={2} />
            <FormTextarea label="Imaging Remarks" name="xray_remark" value={form.xray_remark || ''} onChange={handleChange} rows={2} />
            <FormTextarea label="Chief Complain" name="chief_complain" value={form.chief_complain || ''} onChange={handleChange} rows={2} />
            <FormTextarea label="Medical History" name="medical_history" value={form.medical_history || ''} onChange={handleChange} rows={2} />
            <FormTextarea label="Oral Diet Habit" name="oral_diet_habit" value={form.oral_diet_habit || ''} onChange={handleChange} rows={2} />
            <FormTextarea label="Family History" name="family_history" value={form.family_history || ''} onChange={handleChange} rows={2} />
            <FormInput label="Total Visit" name="total_visit" value={form.total_visit || ''} onChange={handleChange} type="number" />
            <FormInput label="Total Amount (₹)" name="total_amount" value={form.total_amount || ''} onChange={handleChange} type="number" step="0.01" />
            <FormSelect label="Payment Status" name="payment_status" value={form.payment_status || 'pending'} onChange={handleChange} options={[{ value: 'pending', label: 'Pending' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' }]} />
            <FormInput label="Payment Pending (₹)" name="payment_pending" value={form.payment_pending || ''} onChange={handleChange} type="number" step="0.01" />
          </div>
        </div>
        <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
          <Button type="submit" size="lg" loading={saving}>Update Patient</Button>
        </div>
      </form>
    </Modal>
  );
}
