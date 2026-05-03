'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchInput from '@/components/ui/SearchInput';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import EmptyState from '@/components/ui/EmptyState';
import { expenseService } from '@/lib/services/expenses';
import { ExpenseCategory } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = search
    ? categories.filter(c => c.category_name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  const handleEdit = (cat: ExpenseCategory) => {
    setEditingId(cat.id);
    setEditName(cat.category_name);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      setSaving(true);
      await expenseService.updateCategory(editingId, { category_name: editName });
      await fetchCategories();
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-6 mb-4">
      <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
        <h5 className="font-bold text-slate-800 mb-4">Manage Expense Categories</h5>
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." />
      </div>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading categories...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No categories found" />
        ) : (
          <table className="cms-table">
            <thead><tr><th>#</th><th>Category Name</th><th className="text-center">Action</th></tr></thead>
            <tbody>
              {filtered.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.category_name}</td>
                  <td className="text-center">
                    <button onClick={() => handleEdit(cat)} className="px-2 py-1 text-xs font-medium bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-all">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={editingId !== null} onClose={() => setEditingId(null)} title="Edit Category" size="sm">
        <form onSubmit={handleUpdate}>
          <FormInput label="Category Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
            <Button type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
