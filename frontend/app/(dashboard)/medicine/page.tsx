'use client';

import { useState, useEffect, useCallback } from 'react';
import { BiPlusCircle, BiError, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { medicineService } from '@/lib/services/medicine';
import { Medicine } from '@/types';
import { toast } from 'react-hot-toast';

export default function MedicinePage() {
  const ITEMS_PER_PAGE = 20;
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [editingMedicineId, setEditingMedicineId] = useState<number | null>(null);
  
  // Form states
  const [addForm, setAddForm] = useState({ 
    name: '', 
    quantity: '0', 
    threshold_level: '50', 
    notes: '' 
  });
  const [editForm, setEditForm] = useState({ 
    name: '', 
    quantity: '', 
    threshold_level: '', 
    notes: '' 
  });

  // Get selected medicine from medicines array - with type-safe matching
  const selectedMedicine = editingMedicineId && medicines.length > 0
    ? medicines.find(m => Number(m.id) === Number(editingMedicineId))
    : null;
  
  // Debug log when editing
  useEffect(() => {
    if (editingMedicineId && showEditModal) {
      console.log('Edit Mode - ID:', editingMedicineId, 'Found:', !!selectedMedicine);
      console.log('Available medicines:', medicines.map(m => ({ id: m.id, name: m.name })));
    }
  }, [editingMedicineId, showEditModal, selectedMedicine]);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await medicineService.getAll({ search: search || undefined });
      setMedicines(data);
      setCurrentPage(1);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Calculate low stock medicines
  const lowStockMedicines = medicines.filter(m => m.quantity <= m.threshold_level);
  const lowStockCount = lowStockMedicines.length;

  // Search and pagination
  const filteredMedicines = medicines;
  const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMedicines = filteredMedicines.slice(startIndex, endIndex);

  // Handle add medicine
  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await medicineService.create({
        name: addForm.name,
        quantity: Number(addForm.quantity),
        threshold_level: Number(addForm.threshold_level),
        notes: addForm.notes || undefined,
      });
      
      // Optimistic update
      setMedicines(prev => [created, ...prev]);
      setShowAddModal(false);
      setAddForm({ name: '', quantity: '0', threshold_level: '50', notes: '' });
      
      toast.success('✓ Medicine added successfully', {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add medicine');
    }
  };

  // Handle edit modal open with validation
  const handleEditClick = (medicine: Medicine) => {
    // Prevent edit if medicines aren't fully loaded
    if (loading) {
      toast.error('Please wait for medicines to load');
      return;
    }
    
    // Validate medicine exists in current list
    const medicineIdNum = Number(medicine.id);
    const exists = medicines.some(m => Number(m.id) === medicineIdNum);
    
    if (!exists) {
      toast.error('Medicine not found in list. Refreshing...');
      fetchMedicines();
      return;
    }
    
    console.log('✓ Edit - Medicine ID:', medicineIdNum, '| Name:', medicine.name);
    setEditingMedicineId(medicineIdNum);
    setEditForm({
      name: medicine.name,
      quantity: String(medicine.quantity),
      threshold_level: String(medicine.threshold_level),
      notes: medicine.notes || '',
    });
    setShowEditModal(true);
  };

  // Handle edit medicine with better validation
  const handleEditMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMedicineId) {
      toast.error('Medicine ID not found');
      return;
    }
    
    if (!selectedMedicine) {
      toast.error('Medicine not found in the list');
      return;
    }
    
    try {
      const updated = await medicineService.update(editingMedicineId, {
        name: editForm.name,
        quantity: Number(editForm.quantity),
        threshold_level: Number(editForm.threshold_level),
        notes: editForm.notes || undefined,
      });
      
      // Optimistic update
      setMedicines(prev => prev.map(m => Number(m.id) === Number(editingMedicineId) ? updated : m));
      setShowEditModal(false);
      setEditingMedicineId(null);
      
      toast.success('✓ Medicine edited successfully', {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' }
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to edit medicine';
      console.error('Edit medicine error:', err);
      toast.error(errorMsg);
    }
  };

  // Get pagination display
  const getPaginationDisplay = () => {
    if (filteredMedicines.length === 0) return '';
    return `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredMedicines.length)} of ${filteredMedicines.length} medicines`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {/* Search — left */}
        <div className="flex-1 max-w-[400px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search medicines..." />
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={<BiPlusCircle />}>Add Medicine</Button>
        <button 
          onClick={() => setShowLowStockModal(true)} 
          className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-md transition-all"
        >
          <BiError className="w-4 h-4" /> Low Stock
          {lowStockCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
              {lowStockCount}
            </span>
          )}
        </button>
      </div>

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
            <>
              <table className="cms-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Medicine Name</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-center">Threshold</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMedicines.map((m) => {
                    const isLowStock = m.quantity <= m.threshold_level;
                    return (
                      <tr 
                        key={m.id} 
                        className={isLowStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}
                      >
                        <td className="font-semibold text-slate-800 py-3">{m.name}</td>
                        <td className="text-center py-3">
                          <span className={isLowStock ? 'text-red-600 font-bold' : 'font-semibold'}>
                            {m.quantity}
                          </span>
                        </td>
                        <td className="text-center py-3 font-medium text-slate-700">{m.threshold_level}</td>
                        <td className="text-center py-3">
                          {isLowStock ? (
                            <Badge variant="danger">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </td>
                        <td className="text-center py-3">
                          <button 
                            onClick={() => handleEditClick(m)}
                            className="px-4 py-2 text-xs font-semibold bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-all shadow-sm"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                  <span className="text-sm text-slate-600">{getPaginationDisplay()}</span>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <BiChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else {
                          pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-primary-500 text-white'
                                : 'border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <BiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Medicine Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Medicine" size="md">
        <form onSubmit={handleAddMedicine}>
          <div className="space-y-4 py-4">
            <FormInput 
              label="Medicine Name *" 
              name="name"
              value={addForm.name} 
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} 
              required 
              placeholder="Enter medicine name" 
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Quantity *" 
                name="quantity"
                value={addForm.quantity} 
                onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })} 
                type="number" 
                required 
                placeholder="0"
              />
              <FormInput 
                label="Threshold Level *" 
                name="threshold_level"
                value={addForm.threshold_level} 
                onChange={(e) => setAddForm({ ...addForm, threshold_level: e.target.value })} 
                type="number" 
                required 
                placeholder="50"
              />
            </div>
            <FormTextarea 
              label="Notes" 
              name="notes"
              value={addForm.notes} 
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} 
              rows={2} 
              placeholder="Additional notes..." 
            />
          </div>
          <div className="flex justify-center pt-4 border-t border-slate-200">
            <Button type="submit">Save Medicine</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Medicine Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingMedicineId(null); }} title="Edit Medicine" size="md">
        {selectedMedicine ? (
          <form onSubmit={handleEditMedicine}>
            <div className="space-y-4 py-4">
              <FormInput 
                label="Medicine Name *" 
                name="name"
                value={editForm.name} 
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                required 
                placeholder="Enter medicine name" 
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                  label="Quantity *" 
                  name="quantity"
                  value={editForm.quantity} 
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} 
                  type="number" 
                  required 
                  placeholder="0"
                />
                <FormInput 
                  label="Threshold Level *" 
                  name="threshold_level"
                  value={editForm.threshold_level} 
                  onChange={(e) => setEditForm({ ...editForm, threshold_level: e.target.value })} 
                  type="number" 
                  required 
                  placeholder="50"
                />
              </div>
              <FormTextarea 
                label="Notes" 
                name="notes"
                value={editForm.notes} 
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} 
                rows={2} 
                placeholder="Additional notes..." 
              />
            </div>
            <div className="flex justify-center pt-4 border-t border-slate-200">
              <Button type="submit">Update Medicine</Button>
            </div>
          </form>
        ) : editingMedicineId ? (
          <div className="text-center py-12">
            <p className="text-red-600 font-semibold mb-3">Medicine not found</p>
            <p className="text-slate-500 text-sm mb-4">The medicine you're trying to edit doesn't exist.</p>
            <button 
              onClick={() => { setShowEditModal(false); setEditingMedicineId(null); fetchMedicines(); }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Refresh & Close
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500">Loading medicine details...</p>
          </div>
        )}
      </Modal>

      {/* Low Stock Modal */}
      <Modal isOpen={showLowStockModal} onClose={() => setShowLowStockModal(false)} title={`Low Stock Medicines (${lowStockCount})`}>
        {lowStockMedicines.length === 0 ? (
          <EmptyState message="All medicines are in stock!" />
        ) : (
          <div className="space-y-3 py-4">
            {lowStockMedicines.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BiError className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">Stock: <span className="font-bold text-red-600">{m.quantity}</span> / Threshold: {m.threshold_level}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
