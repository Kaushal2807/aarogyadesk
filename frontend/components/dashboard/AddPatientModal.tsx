'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
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
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setContactError('');
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

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setForm((prev) => ({ ...prev, contact_number: val }));
    if (val.length === 0) {
      setContactError('Contact number is required');
    } else if (val.length < 10) {
      setContactError('Contact Number must be 10 digits');
    } else {
      setContactError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      
      // Handle payment logic
      if (name === 'payment_status') {
        if (value === 'paid') {
          updatedForm.payment_pending = '0.00';
        } else if (value === 'pending') {
          updatedForm.payment_pending = updatedForm.total_amount;
        }
      }
      
      if (name === 'total_amount' && updatedForm.payment_status === 'pending') {
        updatedForm.payment_pending = value;
      }
      
      return updatedForm;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 0) {
      toast.error('Please enter a valid age');
      return;
    }
    if (!form.contact_number || form.contact_number.length !== 10) {
      setContactError('Contact Number must be 10 digits');
      toast.error('Contact number must be exactly 10 digits');
      return;
    }
    if (isNaN(Number(form.total_visit)) || Number(form.total_visit) < 1) {
      toast.error('Total visit must be at least 1');
      return;
    }
    if (isNaN(Number(form.total_amount)) || Number(form.total_amount) < 0) {
      toast.error('Please enter a valid total amount');
      return;
    }
    if (form.payment_status !== 'paid' && (isNaN(Number(form.payment_pending)) || Number(form.payment_pending) < 0)) {
      toast.error('Please enter a valid pending amount');
      return;
    }

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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Patient" 
      size="xl"
      footer={
        <div className="flex justify-center">
          <Button 
            type="submit" 
            form="add-patient-form"
            size="lg" 
            loading={saving} 
            className="bg-primary-gradient shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-0.5"
          >
            Save Patient
          </Button>
        </div>
      }
    >
      <form id="add-patient-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
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
              label="Name" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              placeholder="Enter patient name" 
              maxLength={100}
            />
            <FormInput 
              label="Age" 
              name="age" 
              value={form.age} 
              onChange={handleChange} 
              required 
              type="number" 
              min="0"
              max="150"
              placeholder="Enter age" 
            />
          </div>

          {/* Row 2: Contact Number, Address, Date of Visit */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FormInput 
                label="Contact Number" 
                name="contact_number" 
                value={form.contact_number} 
                onChange={handleContactChange} 
                required 
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit number" 
              />
              {contactError && (
                <p className="mt-1 text-xs font-medium text-red-500">{contactError}</p>
              )}
              {!contactError && form.contact_number.length === 10 && (
                <p className="mt-1 text-xs font-medium text-emerald-500">✓ Valid</p>
              )}
            </div>
            <FormInput 
              label="Address" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              placeholder="Enter address" 
              maxLength={250}
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
                { value: 'paid', label: 'Paid' },
              ]}
            />
            {form.payment_status !== 'paid' && (
              <FormInput 
                label="Payment Pending (₹)" 
                name="payment_pending" 
                value={form.payment_pending} 
                onChange={handleChange} 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                disabled={form.payment_status === 'pending'}
                readOnly={form.payment_status === 'pending'}
                className={form.payment_status === 'pending' ? 'bg-slate-100 text-slate-600 font-semibold cursor-not-allowed opacity-70' : ''}
              />
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
