'use client';

import { useState } from 'react';
import { BiHelpCircle } from 'react-icons/bi';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import Alert from '@/components/ui/Alert';
import { supportService } from '@/lib/services/support';

export default function SupportPage() {
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [form, setForm] = useState({ person_name: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supportService.create(form);
      setAlert({ type: 'success', message: 'Your query has been submitted successfully. We will get back to you shortly.' });
      setForm({ person_name: '', subject: '', message: '' });
    } catch (err: any) {
      setAlert({ type: 'danger', message: err.response?.data?.detail || 'Failed to submit query. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 mt-10 mb-4">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b-2 border-slate-100 bg-gradient-to-r from-indigo-50 to-white rounded-t-2xl text-center">
          <div className="w-14 h-14 bg-primary-gradient rounded-xl flex items-center justify-center mx-auto mb-3 shadow-btn-primary">
            <BiHelpCircle className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Need Help? We Got You...</h3>
          <p className="text-sm text-slate-500 mt-1">Submit your query and we&apos;ll respond within 24 hours</p>
        </div>

        <div className="p-6">
          {alert && (
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Clinic Name" name="clinic_name" value="AarogyaDesk Dental Clinic" readOnly />
              <FormInput label="Email" name="email" value="clinic@aarogyadesk.com" readOnly />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Your Name" name="person_name" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} required placeholder="Enter your name" />
              <FormInput label="Phone" name="phone" value="9876543210" readOnly />
            </div>
            <FormInput label="Subject" name="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required placeholder="What is your query about?" />
            <FormTextarea label="Message" name="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} required placeholder="Describe your issue in detail..." />

            <div className="flex justify-center pt-2">
              <Button type="submit" loading={submitting}>Submit Query</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
