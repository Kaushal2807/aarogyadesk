'use client';

import { useEffect, useState } from 'react';
import { workDoneService } from '@/lib/services/work-done';
import { WorkDone } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import toast from 'react-hot-toast';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { BiPlusCircle, BiPencil, BiTrash, BiBriefcase } from 'react-icons/bi';

export default function WorkDoneMasterPage() {
  const [workTypes, setWorkTypes] = useState<WorkDone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkDone | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loadAll = async () => {
    try {
      setLoading(true);
      const data = await workDoneService.getWorkTypes();
      setWorkTypes(data);
    } catch {
      toast.error('Failed to load work done data');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkTypes = workTypes.filter(w => w.work_name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredWorkTypes.length / ITEMS_PER_PAGE);
  const paginatedWorkTypes = filteredWorkTypes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { loadAll(); }, []);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setOpen(true);
  };

  const openEdit = (item: WorkDone) => {
    setEditing(item);
    setName(item.work_name);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await workDoneService.updateWorkType(editing.id, { work_name: name });
        setWorkTypes(prev => prev.map(w => w.id === editing.id ? updated : w));
        toast.success(`${name} updated successfully`, {
          duration: 3000,
          style: { background: '#10b981', color: '#fff', fontWeight: '500' },
        });
      } else {
        const created = await workDoneService.createWorkType({ work_name: name });
        setWorkTypes(prev => [created, ...prev]);
        toast.success(`${name} added successfully`, {
          duration: 3000,
          style: { background: '#10b981', color: '#fff', fontWeight: '500' },
        });
      }
      setOpen(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this work type?')) return;
    const item = workTypes.find(w => w.id === id);
    try {
      await workDoneService.deleteWorkType(id);
      setWorkTypes(prev => prev.filter(w => w.id !== id));
      toast.success(`${item?.work_name || 'Work Type'} deleted successfully`, {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-2 max-w-[900px] mx-auto overflow-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
          <BiBriefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Work Done Master</h1>
          <p className="text-sm text-slate-500">Manage work type templates for patient records</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white gap-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="font-semibold text-slate-800 text-sm shrink-0">Work Types</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold shrink-0">
              {filteredWorkTypes.length}
            </span>
            {workTypes.length > 0 && (
              <input
                type="text"
                placeholder="Search work type..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="max-w-xs w-full px-3 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-slate-700"
              />
            )}
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md transition-all shrink-0"
          >
            <BiPlusCircle className="w-4 h-4" /> Add Work Type
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          {loading ? (
            <TableSkeleton rows={5} cols={3} />
          ) : filteredWorkTypes.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              <BiBriefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              {workTypes.length === 0 ? (
                <>No work types yet. Click <strong>Add Work Type</strong> to get started.</>
              ) : (
                <>No matching work types found.</>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left w-14 px-4 py-3 font-semibold text-slate-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Work Type Name</th>
                  <th className="text-right w-24 px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedWorkTypes.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="w-14 px-4 py-3 text-slate-400 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.work_name}</td>
                    <td className="w-24 px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit"
                        >
                          <BiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-600">
            <span>Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredWorkTypes.length)} of {filteredWorkTypes.length} work types</span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Work Type' : 'Add Work Type'}
        size="sm"
      >
        <div className="space-y-4">
          <FormInput
            label="Work Type Name"
            placeholder="e.g. Scaling, Extraction, RCT"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline-secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
