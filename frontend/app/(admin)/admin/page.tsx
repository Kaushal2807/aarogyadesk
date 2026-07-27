'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BiPlusCircle, BiBlock, BiCheckCircle, BiTrash } from 'react-icons/bi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import apiClient from '@/lib/api';
import { Clinic } from '@/types';

export default function AdminPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/clinics');
      setClinics(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load clinics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const filtered = useMemo(() => {
    if (!search) return clinics;
    return clinics.filter(c =>
      c.clinic_name.toLowerCase().includes(search.toLowerCase()) ||
      c.clinic_code.toLowerCase().includes(search.toLowerCase())
    );
  }, [clinics, search]);

  const getPlanDates = (plan: string) => {
    const start = new Date().toISOString().split('T')[0];
    let end: Date;
    if (plan === '6 Months') {
      end = new Date();
      end.setMonth(end.getMonth() + 6);
    } else if (plan === '1 Year') {
      end = new Date();
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end = new Date();
      end.setMonth(end.getMonth() + 1);
    }
    return { start, end: end.toISOString().split('T')[0] };
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    // Validate required fields
    const clinic_name = form.get('clinic_name')?.toString().trim();
    const clinic_code = form.get('clinic_code')?.toString().trim();
    const phone = form.get('phone')?.toString().trim();
    const email = form.get('email')?.toString().trim();
    const address = form.get('address')?.toString().trim();
    const plan_type = form.get('plan_type')?.toString().trim();
    const plan_amount = form.get('plan_amount')?.toString().trim();
    const payment_status = form.get('payment_status')?.toString().trim() || 'Paid';
    const payment_method = form.get('payment_method')?.toString().trim();
    const transaction_reference = form.get('transaction_reference')?.toString().trim();

    if (!clinic_name || !clinic_code || !phone || !email || !address || !plan_type || !plan_amount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const { data: clinic } = await apiClient.post('/clinics', {
        clinic_name,
        clinic_code,
        phone,
        email,
        address,
        status: 'Active',
      });

      const { start, end } = getPlanDates(plan_type);

      await apiClient.post('/subscriptions', {
        clinic_id: clinic.clinic_id,
        plan_type: plan_type as "1 Month" | "6 Months" | "1 Year",
        plan_amount: Number(plan_amount),
        payment_status: payment_status as "Paid" | "Pending" | "Partial",
        payment_method: payment_method && payment_method !== '' ? (payment_method as "Cash" | "UPI" | "Cheque") : null,
        transaction_reference: transaction_reference || null,
        start_date: start,
        end_date: end,
      });

      setShowModal(false);
      fetchClinics();
    } catch (err: any) {
      console.error('Error adding clinic:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to add clinic');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (clinicId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiClient.put(`/clinics/${clinicId}`, { status: newStatus });
      fetchClinics();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update clinic status');
    }
  };

  const deleteClinic = async (clinicId: number) => {
    if (!window.confirm('Are you sure you want to delete this clinic?')) return;
    try {
      await apiClient.delete(`/clinics/${clinicId}`);
      fetchClinics();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete clinic');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-slate-400">Loading clinics...</p>
        </div>
      </div>
    );
  }

  if (error && clinics.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchClinics}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {error && clinics.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">{error}</div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h5 className="font-bold text-slate-800 text-lg">Clinic Management</h5>
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search clinics..." className="max-w-[250px]" />
          <Button onClick={() => setShowModal(true)} icon={<BiPlusCircle />}>Add Clinic</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState message="No clinics found" />
          ) : (
            <table className="cms-table w-full">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Clinic Details</th>
                  <th>Contact</th>
                  <th>Prefix</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.clinic_id}>
                    <td>
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-sm">
                        {c.clinic_name.charAt(0)}
                      </div>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800">{c.clinic_name}</p>
                      <p className="text-xs text-slate-400">Created: {c.created_at?.split('T')[0]}</p>
                    </td>
                    <td>
                      <p className="text-sm">{c.email}</p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </td>
                    <td><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{c.clinic_code}</span></td>
                    <td>
                      <Badge variant={c.status === 'Active' ? 'success' : 'danger'}>{c.status === 'Active' ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                          title={c.status === 'Active' ? 'Deactivate' : 'Activate'}
                          onClick={() => toggleStatus(c.clinic_id, c.status)}
                        >
                          {c.status === 'Active' ? <BiBlock className="w-4 h-4" /> : <BiCheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                          onClick={() => deleteClinic(c.clinic_id)}
                        >
                          <BiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Clinic" size="lg">
        <form onSubmit={handleAdd}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Clinic Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Clinic Name" name="clinic_name" required placeholder="Enter clinic name" maxLength={100} />
              <FormInput label="Clinic Code" name="clinic_code" required placeholder="e.g. SWA" maxLength={20} />
              <FormInput label="Phone" name="phone" required type="tel" pattern="[0-9]{10,15}" title="Please enter a valid phone number (10-15 digits)" placeholder="Clinic phone" />
              <FormInput label="Email" name="email" type="email" required placeholder="clinic@email.com" maxLength={150} />
            </div>
            <FormInput label="Address" name="address" required placeholder="Full address" maxLength={250} />

            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 mt-2">Subscription Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Plan Type"
                name="plan_type"
                required
                options={[
                  { value: '1 Month', label: '1 Month' },
                  { value: '6 Months', label: '6 Months' },
                  { value: '1 Year', label: '1 Year' },
                ]}
                defaultValue="1 Month"
              />
              <FormInput label="Plan Amount" name="plan_amount" type="number" required defaultValue="1500" />
              <FormSelect
                label="Payment Method"
                name="payment_method"
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'UPI', label: 'UPI' },
                  { value: 'Cheque', label: 'Cheque' },
                ]}
                placeholder="Select payment method"
                defaultValue="Cash"
              />
              <FormSelect
                label="Payment Status"
                name="payment_status"
                required
                options={[
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Pending', label: 'Pending' },
                ]}
                defaultValue="Paid"
              />
            </div>
            <FormInput label="Transaction Reference" name="transaction_reference" placeholder="Optional" />
          </div>
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
            <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Clinic'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

