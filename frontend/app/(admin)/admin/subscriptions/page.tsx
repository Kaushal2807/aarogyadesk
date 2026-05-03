'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BiRefresh } from 'react-icons/bi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import apiClient from '@/lib/api';
import { Subscription } from '@/types';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/subscriptions');
      setSubscriptions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filtered = useMemo(() => {
    let result = subscriptions;
    if (search) {
      result = result.filter(s =>
        s.clinic_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.clinic_id?.toString().includes(search)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(s => {
        if (!s.end_date) return false;
        return statusFilter === 'active'
          ? new Date(s.end_date) > new Date()
          : new Date(s.end_date) <= new Date();
      });
    }
    return result;
  }, [subscriptions, search, statusFilter]);

  const getDaysLeft = (endDate?: string) => {
    if (!endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getStatus = (endDate?: string) => {
    const days = getDaysLeft(endDate);
    if (days === 0) return { label: 'Expired', variant: 'danger' as const };
    if (days <= 30) return { label: 'Expiring', variant: 'warning' as const };
    return { label: 'Active', variant: 'success' as const };
  };

  const handleRenew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSub) return;
    const form = new FormData(e.currentTarget);
    try {
      setSubmitting(true);
      await apiClient.put(`/subscriptions/${selectedSub.subscription_id}/renew`, {
        plan_type: form.get('plan_type'),
        plan_amount: Number(form.get('plan_amount')),
        payment_status: form.get('payment_status'),
        payment_method: form.get('payment_method'),
        transaction_reference: form.get('transaction_reference'),
      });
      setShowRenewModal(false);
      setSelectedSub(null);
      fetchSubscriptions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to renew subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const openRenew = (sub: Subscription) => {
    setSelectedSub(sub);
    setShowRenewModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-slate-400">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (error && subscriptions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchSubscriptions}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {error && subscriptions.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">{error}</div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h5 className="font-bold text-slate-800 text-lg">Subscription Management</h5>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Search clinics..." className="max-w-[200px]" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500 bg-white">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState message="No subscriptions found" />
          ) : (
            <table className="cms-table w-full">
              <thead>
                <tr>
                  <th>Clinic</th>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days Left</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const status = getStatus(s.end_date);
                  const days = getDaysLeft(s.end_date);
                  return (
                    <tr key={s.subscription_id}>
                      <td className="font-medium">{s.clinic_name || `Clinic #${s.clinic_id}`}</td>
                      <td><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">{s.plan_type}</span></td>
                      <td className="text-sm text-slate-500">{s.start_date}</td>
                      <td className="text-sm text-slate-500">{s.end_date}</td>
                      <td className="font-semibold">{days > 0 ? `${days} days` : 'Expired'}</td>
                      <td><Badge variant={status.variant}>{status.label}</Badge></td>
                      <td className="text-center">
                        <Button size="sm" variant="outline-primary" onClick={() => openRenew(s)} icon={<BiRefresh />}>Renew</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showRenewModal} onClose={() => { setShowRenewModal(false); setSelectedSub(null); }} title={`Renew: ${selectedSub?.clinic_name || ''}`} size="md">
        <form onSubmit={handleRenew}>
          <div className="space-y-4">
            <FormSelect label="Plan Type" name="plan_type" options={[
              { value: '1 Month', label: '1 Month' },
              { value: '6 Months', label: '6 Months' },
              { value: '1 Year', label: '1 Year' },
            ]} />
            <FormInput label="Plan Amount" name="plan_amount" type="number" defaultValue="1500" required />
            <FormSelect label="Payment Method" name="payment_method" options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Cheque', label: 'Cheque' },
            ]} />
            <FormInput label="Transaction Reference" name="transaction_reference" placeholder="Optional" />
            <FormSelect label="Payment Status" name="payment_status" options={[
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
            ]} />
          </div>
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
            <Button type="submit" disabled={submitting}>{submitting ? 'Renewing...' : 'Renew Subscription'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
