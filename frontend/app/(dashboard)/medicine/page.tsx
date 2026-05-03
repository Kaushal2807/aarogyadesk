'use client';

import { useState, useEffect, useCallback } from 'react';
import { BiPlusCircle, BiError } from 'react-icons/bi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { medicineService } from '@/lib/services/medicine';
import { Medicine } from '@/types';

export default function MedicinePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ quantity: '', notes: '' });
  const [addForm, setAddForm] = useState({ name: '', quantity: '100', threshold_level: '50', notes: '' });

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicineService.getAll({ search: search || undefined });
      setMedicines(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const lowStockMedicines = medicines.filter(m => m.quantity <= m.threshold_level);
  const lowStockCount = lowStockMedicines.length;

  const getStatus = (qty: number, threshold: number) => qty <= threshold ? 'low' : 'in-stock';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await medicineService.create({
        name: addForm.name,
        quantity: Number(addForm.quantity),
        threshold_level: Number(addForm.threshold_level),
        notes: addForm.notes || undefined,
      });
      setShowAddModal(false);
      setAddForm({ name: '', quantity: '100', threshold_level: '50', notes: '' });
      fetchMedicines();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add medicine');
    }
  };

  const startEdit = (m: Medicine) => {
    setEditId(m.id);
    setEditForm({ quantity: String(m.quantity), notes: m.notes || '' });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await medicineService.update(editId, {
        quantity: Number(editForm.quantity),
        notes: editForm.notes || undefined,
      });
      setEditId(null);
      fetchMedicines();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update medicine');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex-1 max-w-[400px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search medicines..." />
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={<BiPlusCircle />}>Add Medicine</Button>
        <button onClick={() => setShowLowStockModal(true)} className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-md transition-all">
          <BiError className="w-4 h-4" /> Low Stock Alert
          {lowStockCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">{lowStockCount}</span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {/* Medicine Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3">Loading medicines...</span>
            </div>
          ) : medicines.length === 0 ? (
            <EmptyState message="No medicines found" />
          ) : (
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">{m.name}</td>
                    <td>
                      {editId === m.id ? (
                        <input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} className="w-20 py-1 px-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-500" />
                      ) : (
                        <span>{m.quantity}</span>
                      )}
                    </td>
                    <td>{m.threshold_level}</td>
                    <td className="text-slate-500 text-xs max-w-[200px] truncate">{m.notes}</td>
                    <td>
                      {getStatus(m.quantity, m.threshold_level) === 'low' ? (
                        <Badge variant="danger">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </td>
                    <td className="text-center">
                      {editId === m.id ? (
                        <div className="flex gap-1 justify-center">
                          <button onClick={handleEdit} className="px-2 py-1 text-xs font-medium bg-emerald-500 text-white rounded-md">Save</button>
                          <button onClick={() => setEditId(null)} className="px-2 py-1 text-xs font-medium bg-slate-200 text-slate-600 rounded-md">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(m)} className="px-2 py-1 text-xs font-medium bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-all">Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Medicine" size="md">
        <form onSubmit={handleAdd}>
          <div className="space-y-4">
            <FormInput label="Medicine Name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required placeholder="Enter medicine name" />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Quantity" value={addForm.quantity} onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })} type="number" required />
              <FormInput label="Threshold Level" value={addForm.threshold_level} onChange={(e) => setAddForm({ ...addForm, threshold_level: e.target.value })} type="number" required />
            </div>
            <FormTextarea label="Notes" value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} rows={2} placeholder="Additional notes..." />
          </div>
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
            <Button type="submit">Save Medicine</Button>
          </div>
        </form>
      </Modal>

      {/* Low Stock Modal */}
      <Modal isOpen={showLowStockModal} onClose={() => setShowLowStockModal(false)} title="Low Stock Medicines">
        {lowStockMedicines.length === 0 ? (
          <EmptyState message="All medicines are in stock!" />
        ) : (
          <div className="space-y-3">
            {lowStockMedicines.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <BiError className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">Stock: {m.quantity} / Threshold: {m.threshold_level}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
