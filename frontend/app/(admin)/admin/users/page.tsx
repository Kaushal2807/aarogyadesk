'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BiPlusCircle, BiSolidPencil, BiLock, BiTrash } from 'react-icons/bi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import apiClient from '@/lib/api';
import { User, Clinic } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, clinicsRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/clinics'),
      ]);
      setUsers(usersRes.data);
      setClinics(clinicsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (!search) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const getClinicName = (clinicId?: number) => {
    if (!clinicId) return '--';
    return clinics.find(c => c.clinic_id === clinicId)?.clinic_name || 'Unknown';
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      setSubmitting(true);
      await apiClient.post('/users', {
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        user_type: (form.get('user_type') as string) || 'clinic',
        clinic_id: Number(form.get('clinic_id')) || null,
      });
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiClient.put(`/users/${userId}/status`, { status: newStatus });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user status');
    }
  };

  const resetPassword = async (userId: number) => {
    const newPassword = window.prompt('Enter new password for this user:');
    if (!newPassword) return;
    try {
      await apiClient.put(`/users/${userId}/reset-password`, { new_password: newPassword });
      alert('Password reset successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiClient.delete(`/users/${userId}`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-slate-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {error && users.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">{error}</div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h5 className="font-bold text-slate-800 text-lg">User Management</h5>
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search users..." className="max-w-[250px]" />
          <Button onClick={() => setShowModal(true)} icon={<BiPlusCircle />}>Add User</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState message="No users found" />
          ) : (
            <table className="cms-table w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Clinic</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-slate-500">{u.email}</td>
                    <td>
                      <Badge variant={u.user_type === 'admin' ? 'info' : 'success'}>
                        {u.user_type === 'admin' ? 'Admin' : 'Clinic'}
                      </Badge>
                    </td>
                    <td className="text-sm">{getClinicName(u.clinic_id)}</td>
                    <td>
                      <Badge variant={u.status === 'Active' ? 'success' : 'danger'}>
                        {u.status === 'Active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-sm text-slate-400">{u.created_at?.split('T')[0]}</td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all" title="Edit" onClick={() => toggleUserStatus(u.id, u.status)}>
                          <BiSolidPencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                          title="Reset Password"
                          onClick={() => resetPassword(u.id)}
                        >
                          <BiLock className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                          onClick={() => deleteUser(u.id)}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User" size="md">
        <form onSubmit={handleAdd}>
          <div className="space-y-4">
            <FormInput label="Name" name="name" required placeholder="User name" />
            <FormInput label="Email" name="email" type="email" required placeholder="user@email.com" />
            <FormInput label="Password" name="password" type="password" required placeholder="Set password" />
            <FormSelect label="User Type" name="user_type" options={[{ value: 'admin', label: 'Admin' }, { value: 'clinic', label: 'Clinic' }]} />
            <FormSelect
              label="Clinic"
              name="clinic_id"
              options={clinics.map(c => ({ value: String(c.clinic_id), label: c.clinic_name }))}
              placeholder="Select clinic (for clinic users)"
            />
          </div>
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
            <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add User'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
