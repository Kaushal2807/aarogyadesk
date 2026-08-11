'use client';

import { useEffect, useState } from 'react';
import { masterTreatmentService, MasterDiagnosis, MasterTreatment } from '@/lib/services/master-treatment';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import toast from 'react-hot-toast';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { BiPlusCircle, BiPencil, BiTrash, BiClipboard } from 'react-icons/bi';

export default function TreatmentPlanMasterPage() {
  const [diagnoses, setDiagnoses] = useState<MasterDiagnosis[]>([]);
  const [treatments, setTreatments] = useState<MasterTreatment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'diagnosis' | 'treatment'>('diagnosis');
  const [editingDiagnosis, setEditingDiagnosis] = useState<MasterDiagnosis | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<MasterTreatment | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [d, t] = await Promise.all([
        masterTreatmentService.getDiagnoses(),
        masterTreatmentService.getTreatments(),
      ]);
      setDiagnoses(d);
      setTreatments(t);
    } catch {
      toast.error('Failed to load treatment plan data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const openAdd = (section: 'diagnosis' | 'treatment') => {
    setActiveSection(section);
    setEditingDiagnosis(null);
    setEditingTreatment(null);
    setName('');
    setDescription('');
    setOpen(true);
  };

  const openEditDiag = (item: MasterDiagnosis) => {
    setActiveSection('diagnosis');
    setEditingDiagnosis(item);
    setEditingTreatment(null);
    setName(item.diagnosis_name);
    setDescription(item.description || '');
    setOpen(true);
  };

  const openEditTreat = (item: MasterTreatment) => {
    setActiveSection('treatment');
    setEditingTreatment(item);
    setEditingDiagnosis(null);
    setName(item.treatment_name);
    setDescription(item.description || '');
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (activeSection === 'diagnosis') {
        if (editingDiagnosis) {
          const updated = await masterTreatmentService.updateDiagnosis(editingDiagnosis.id, { diagnosis_name: name, description });
          setDiagnoses(prev => prev.map(d => d.id === editingDiagnosis.id ? updated : d));
        } else {
          const created = await masterTreatmentService.createDiagnosis({ diagnosis_name: name, description });
          setDiagnoses(prev => [created, ...prev]);
        }
      } else {
        if (editingTreatment) {
          const updated = await masterTreatmentService.updateTreatment(editingTreatment.id, { treatment_name: name, description });
          setTreatments(prev => prev.map(t => t.id === editingTreatment.id ? updated : t));
        } else {
          const created = await masterTreatmentService.createTreatment({ treatment_name: name, description });
          setTreatments(prev => [created, ...prev]);
        }
      }
      toast.success(editingDiagnosis || editingTreatment ? `${name} updated successfully` : `${name} added successfully`, {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
      setOpen(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDiag = async (id: number) => {
    if (!confirm('Delete this diagnosis entry?')) return;
    const item = diagnoses.find(d => d.id === id);
    try {
      await masterTreatmentService.deleteDiagnosis(id);
      setDiagnoses(prev => prev.filter(d => d.id !== id));
      toast.success(`${item?.diagnosis_name || 'Diagnosis'} deleted successfully`, {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
    } catch { toast.error('Delete failed'); }
  };

  const handleDeleteTreat = async (id: number) => {
    if (!confirm('Delete this treatment entry?')) return;
    const item = treatments.find(t => t.id === id);
    try {
      await masterTreatmentService.deleteTreatment(id);
      setTreatments(prev => prev.filter(t => t.id !== id));
      toast.success(`${item?.treatment_name || 'Treatment Plan'} deleted successfully`, {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
    } catch { toast.error('Delete failed'); }
  };

  const SectionTable = ({
    title,
    items,
    nameKey,
    onAdd,
    onEdit,
    onDelete,
  }: {
    title: string;
    items: any[];
    nameKey: string;
    onAdd: () => void;
    onEdit: (item: any) => void;
    onDelete: (id: number) => void;
  }) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const filteredItems = items.filter(it => 
      (it[nameKey]?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (it.description?.toLowerCase() || '').includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredItems.length / pageSize);
    const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

    return (
      <div className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white gap-3">
            <h3 className="font-semibold text-slate-800 text-sm shrink-0">{title}</h3>
            {items.length > 0 && (
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="max-w-[200px] w-full px-3 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary-400 bg-white text-slate-700"
              />
            )}
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-gradient text-white rounded-lg shadow-btn-primary hover:shadow-btn-primary-hover transition-all shrink-0"
            >
              <BiPlusCircle className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton rows={4} cols={3} />
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                {items.length === 0 ? 'No entries yet. Click Add to get started.' : 'No matching entries found.'}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-slate-600">Name</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-600">Description</th>
                    <th className="w-28 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">{item[nameKey]}</td>
                      <td className="px-6 py-3 text-slate-500">{item.description || <span className="italic text-slate-300">—</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit"
                          >
                            <BiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-600">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-2 max-w-[1400px] mx-auto overflow-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center shadow-btn-primary">
          <BiClipboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Treatment Plan Master</h1>
          <p className="text-sm text-slate-500">Manage diagnosis and treatment plan templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionTable
          title="Diagnoses"
          items={diagnoses}
          nameKey="diagnosis_name"
          onAdd={() => openAdd('diagnosis')}
          onEdit={openEditDiag}
          onDelete={handleDeleteDiag}
        />
        <SectionTable
          title="Treatment Plans"
          items={treatments}
          nameKey="treatment_name"
          onAdd={() => openAdd('treatment')}
          onEdit={openEditTreat}
          onDelete={handleDeleteTreat}
        />
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`${editingDiagnosis || editingTreatment ? 'Edit' : 'Add'} ${activeSection === 'diagnosis' ? 'Diagnosis' : 'Treatment Plan'}`}
        size="sm"
      >
        <div className="space-y-4">
          <FormInput
            label={activeSection === 'diagnosis' ? 'Diagnosis Name' : 'Treatment Name'}
            placeholder={activeSection === 'diagnosis' ? 'e.g. Dental Caries' : 'e.g. Root Canal Treatment'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormInput
            label="Description (optional)"
            placeholder="Additional details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline-secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editingDiagnosis || editingTreatment ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
