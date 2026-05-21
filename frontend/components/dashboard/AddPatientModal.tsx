'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import FormSelect from '@/components/forms/FormSelect';
import { patientService } from '@/lib/services/patients';
import { Patient } from '@/types';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Partial<Patient>) => void;
  saving?: boolean;
}

export default function AddPatientModal({ isOpen, onClose, onSave, saving }: AddPatientModalProps) {
  const [form, setForm] = useState({
    patient_uid: '',
    name: '',
    age: '',
    contact_number: '',
    address: '',
    date_of_visit: new Date().toISOString().split('T')[0],
    notes: '',
    xray_remark: '',
    chief_complain: '',
    medical_history: '',
    oral_diet_habit: '',
    family_history: '',
    total_visit: '1',
    total_amount: '0',
    payment_status: 'pending',
    payment_pending: '0.00',
  });

  useEffect(() => {
    if (isOpen) {
      // Generate patient UID and reset form
      const generateAndReset = async () => {
        try {
          const uid = await patientService.generateUid();
          setForm({
            patient_uid: uid || `PAT-${Date.now()}`,
            name: '',
            age: '',
            contact_number: '',
            address: '',
            date_of_visit: new Date().toISOString().split('T')[0],
            notes: '',
            xray_remark: '',
            chief_complain: '',
            medical_history: '',
            oral_diet_habit: '',
            family_history: '',
            total_visit: '1',
            total_amount: '0',
            payment_status: 'pending',
            payment_pending: '0.00',
          });
        } catch (err) {
          // Fallback UID if generation fails
          setForm({
            patient_uid: `PAT-${Date.now()}`,
            name: '',
            age: '',
            contact_number: '',
            address: '',
            date_of_visit: new Date().toISOString().split('T')[0],
            notes: '',
            xray_remark: '',
            chief_complain: '',
            medical_history: '',
            oral_diet_habit: '',
            family_history: '',
            total_visit: '1',
            total_amount: '0',
            payment_status: 'pending',
            payment_pending: '0.00',
          });
        }
      };
      generateAndReset();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      age: Number(form.age),
      contact_number: form.contact_number,
      address: form.address,
      date_of_visit: form.date_of_visit,
      notes: form.notes,
      xray_remark: form.xray_remark,
      chief_complain: form.chief_complain,
      medical_history: form.medical_history,
      oral_diet_habit: form.oral_diet_habit,
      family_history: form.family_history,
      total_visit: Number(form.total_visit),
      total_amount: Number(form.total_amount),
      payment_status: form.payment_status as 'paid' | 'partial' | 'pending',
      payment_pending: Number(form.payment_pending),
    } as Partial<Patient>;

    onSave(payload);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Patient" size="xl">
      <form onSubmit={handleSubmit}>
        <div className="py-4 space-y-4">
          {/* Row 1: Patient ID, Full Name, Age */}
          <div className="grid grid-cols-3 gap-4">
            <FormInput 
              label="Patient ID" 
              name="patient_uid" 
              value={form.patient_uid} 
              onChange={handleChange} 
              readOnly 
              disabled
              className="bg-slate-100 text-slate-600 font-semibold"
            />
            <FormInput 
              label="Name *" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              placeholder="Enter patient name" 
            />
            <FormInput 
              label="Age *" 
              name="age" 
              value={form.age} 
              onChange={handleChange} 
              required 
              type="number" 
              placeholder="Enter age" 
            />
          </div>

          {/* Row 2: Contact Number, Address, Date of Visit */}
          <div className="grid grid-cols-3 gap-4">
            <FormInput 
              label="Contact Number *" 
              name="contact_number" 
              value={form.contact_number} 
              onChange={handleChange} 
              required 
              placeholder="Enter contact number" 
            />
            <FormInput 
              label="Address" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              placeholder="Enter address" 
            />
            <FormInput 
              label="Date of Visit" 
              name="date_of_visit" 
              value={form.date_of_visit} 
              onChange={handleChange} 
              type="date" 
            />
          </div>

          {/* Row 3: Notes, Imaging Remarks, Chief Complain */}
          <div className="grid grid-cols-3 gap-4">
            <FormTextarea 
              label="Notes" 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              rows={2} 
              placeholder="Additional notes..." 
            />
            <FormTextarea 
              label="Imaging Remarks" 
              name="xray_remark" 
              value={form.xray_remark} 
              onChange={handleChange} 
              rows={2} 
              placeholder="Describe findings..." 
            />
            <FormTextarea 
              label="Chief Complain" 
              name="chief_complain" 
              value={form.chief_complain} 
              onChange={handleChange} 
              rows={2} 
              placeholder="Chief complaint..." 
            />
          </div>

          {/* Row 4: Medical History, Oral Diet Habit, Family History */}
          <div className="grid grid-cols-3 gap-4">
            <FormTextarea 
              label="Medical History" 
              name="medical_history" 
              value={form.medical_history} 
              onChange={handleChange} 
              rows={2} 
              placeholder="Medical history..." 
            />
            <FormTextarea 
              label="Oral Diet Habit" 
              name="oral_diet_habit" 
              value={form.oral_diet_habit} 
              onChange={handleChange} 
              rows={2} 
              placeholder="Oral diet habit..." 
            />
            <FormTextarea 
              label="Family History" 
              name="family_history" 
              value={form.family_history} 
              onChange={handleChange} 
              rows={2} 
              placeholder="Family history..." 
            />
          </div>

          {/* Row 5: Total Visit, Total Amount, Payment Status, Payment Pending */}
          <div className="grid grid-cols-4 gap-4">
            <FormInput 
              label="Total Visit" 
              name="total_visit" 
              value={form.total_visit} 
              onChange={handleChange} 
              type="number" 
              placeholder="1"
            />
            <FormInput 
              label="Total Amount (₹)" 
              name="total_amount" 
              value={form.total_amount} 
              onChange={handleChange} 
              type="number" 
              step="0.01" 
              placeholder="0"
            />
            <FormSelect
              label="Payment Status"
              name="payment_status"
              value={form.payment_status}
              onChange={handleChange}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'partial', label: 'Partial' },
                { value: 'paid', label: 'Paid' },
              ]}
            />
            <FormInput 
              label="Payment Pending (₹)" 
              name="payment_pending" 
              value={form.payment_pending} 
              onChange={handleChange} 
              type="number" 
              step="0.01" 
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center pt-6 mt-6 border-t border-slate-200">
          <Button 
            type="submit" 
            size="lg" 
            loading={saving} 
            className="bg-primary-gradient shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-0.5"
          >
            Save Patient
          </Button>
        </div>
      </form>
    </Modal>
  );
}
