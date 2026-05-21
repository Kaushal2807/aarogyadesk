'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import SearchInput from '@/components/ui/SearchInput';
import FormSelect from '@/components/forms/FormSelect';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import EmptyState from '@/components/ui/EmptyState';
import { expenseService } from '@/lib/services/expenses';
import { Expense, ExpenseCategory } from '@/types';

const PAYMENT_MODE_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Cheque', label: 'Cheque' },
];

export default function ExpenseHistoryPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', payment_mode: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getAll(),
        expenseService.getCategories(),
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && e.category_id !== parseInt(categoryFilter)) return false;
      if (monthFilter && e.expense_month !== parseInt(monthFilter)) return false;
      return true;
    });
  }, [expenses, search, categoryFilter, monthFilter]);

  const categoryOptions = useMemo(() => [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: String(c.id), label: c.category_name })),
  ], [categories]);

  const monthOptions = useMemo(() => [
    { value: '', label: 'All Months' },
    ...['1','2','3','4','5','6','7','8','9','10','11','12'].map(m => ({
      value: m,
      label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m) - 1],
    })),
  ], []);

  const startEdit = (e: Expense) => {
    setEditingId(e.id);
    setEditForm({ amount: String(e.amount), payment_mode: e.payment_mode, description: e.description || '' });
  };

  const handleUpdate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (editingId === null) return;
    try {
      setSaving(true);
      await expenseService.update(editingId, {
        amount: Number(editForm.amount),
        payment_mode: editForm.payment_mode as 'Cash' | 'UPI',
        description: editForm.description,
      });
      await fetchData();
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 mt-6 mb-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by title..." />
          <FormSelect label="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={categoryOptions} />
          <FormSelect label="Month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} options={monthOptions} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b-2 border-slate-100">
          <h5 className="font-bold text-slate-800">Expense History ({filtered.length} records)</h5>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading expenses...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <EmptyState message="No expenses found" />
          ) : (
            <table className="cms-table">
              <thead><tr><th>Category</th><th>Title</th><th>Month/Year</th><th>Amount</th><th>Mode</th><th>Date</th><th className="text-center">Action</th></tr></thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>{e.category_name || '-'}</td>
                    <td>{e.title}</td>
                    <td>{e.expense_month}/{e.expense_year}</td>
                    <td className="font-semibold">{'₹'}{e.amount.toLocaleString()}</td>
                    <td>{e.payment_mode}</td>
                    <td>{e.expense_date}</td>
                    <td className="text-center">
                      <button onClick={() => startEdit(e)} className="px-2 py-1 text-xs font-medium bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-all">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={editingId !== null} onClose={() => setEditingId(null)} title="Edit Expense" size="md">
        <form onSubmit={handleUpdate}>
          <div className="space-y-4">
            <FormInput label="Amount (₹)" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} type="number" step="0.01" />
            <FormSelect label="Payment Mode" value={editForm.payment_mode} onChange={(e) => setEditForm({ ...editForm, payment_mode: e.target.value })} options={PAYMENT_MODE_OPTIONS} />
            <FormTextarea label="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} />
          </div>
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
            <Button type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
