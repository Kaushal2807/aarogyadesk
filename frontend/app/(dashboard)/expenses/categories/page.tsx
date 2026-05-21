'use client';

import { useState, useEffect, useCallback } from 'react';
import { BiEdit, BiTrash } from 'react-icons/bi';
import SearchInput from '@/components/ui/SearchInput';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import EmptyState from '@/components/ui/EmptyState';
import { expenseService } from '@/lib/services/expenses';
import { ExpenseCategory } from '@/types';
import { toast } from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await expenseService.getCategories();
      setCategories(data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load categories');
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
    if (editingId === null || !editName.trim()) return;
    try {
      setSaving(true);
      await expenseService.updateCategory(editingId, { category_name: editName });
      setCategories(prev => 
        prev.map(c => c.id === editingId ? { ...c, category_name: editName } : c)
      );
      setEditingId(null);
      setEditName('');
      toast.success('✓ Category updated successfully', { 
        style: { background: '#10b981', color: '#fff', fontWeight: '500' } 
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setDeleting(true);
      await expenseService.deleteCategory(deleteId);
      setCategories(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
      toast.success('✓ Category deleted successfully', { 
        style: { background: '#10b981', color: '#fff', fontWeight: '500' } 
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete category');
    } finally {
      setDeleting(false);
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
          <div className="p-8 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-slate-500">Loading categories...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No categories found" />
        ) : (
          <table className="cms-table w-full">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Category Name</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="py-3 text-slate-600 font-medium">{cat.id}</td>
                  <td className="py-3 text-slate-800 font-medium">{cat.category_name}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit Category"
                      >
                        <BiEdit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setDeleteId(cat.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Category"
                      >
                        <BiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editingId !== null} onClose={() => setEditingId(null)} title="Edit Category" size="sm">
        <form onSubmit={handleUpdate}>
          <div className="py-4 space-y-4">
            <FormInput 
              label="Category Name *" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              required 
              placeholder="Enter category name"
            />
          </div>
          <div className="flex justify-center pt-4 border-t border-slate-100 gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirm Delete" size="sm">
        <div className="py-4">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <BiTrash className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Category?</h3>
            <p className="text-slate-500 text-sm">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
