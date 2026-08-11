'use client';

import { useEffect, useMemo, useState } from 'react';
import { BiTrash, BiSolidPencil } from 'react-icons/bi';
import { PatientWorkDone } from '@/types';
import { workDoneService } from '@/lib/services/work-done';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import SearchableSelect from '@/components/forms/SearchableSelect';
import { toast } from 'react-hot-toast';

interface WorkDoneTableProps {
  records: PatientWorkDone[];
}

export default function WorkDoneTable({ records }: WorkDoneTableProps) {
  const [tableRecords, setTableRecords] = useState<PatientWorkDone[]>(records);
  const [workOptions, setWorkOptions] = useState<{ value: string; label: string }[]>([]);
  const [editing, setEditing] = useState<PatientWorkDone | null>(null);
  const [deleting, setDeleting] = useState<PatientWorkDone | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ work_done_id: '', work_date: '', description: '' });

  useEffect(() => {
    setTableRecords(records);
  }, [records]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await workDoneService.getWorkTypes();
        setWorkOptions(data.map((w) => ({ value: String(w.id), label: w.work_name })));
      } catch {
        setWorkOptions([]);
      }
    };
    load();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 10;

  const filteredRecords = useMemo(() => {
    let list = [...tableRecords].sort((a, b) => (b.work_date || '').localeCompare(a.work_date || ''));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        (r.work_name?.toLowerCase().includes(q)) || 
        (r.description?.toLowerCase().includes(q)) ||
        (r.work_date?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tableRecords, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = useMemo(
    () => filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredRecords, currentPage]
  );

  const openEdit = (r: PatientWorkDone) => {
    setEditing(r);
    setForm({
      work_done_id: r.work_done_id ? String(r.work_done_id) : '',
      work_date: r.work_date || '',
      description: r.description || '',
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      const updated = await workDoneService.update(editing.id, {
        work_done_id: form.work_done_id ? Number(form.work_done_id) : undefined,
        work_date: form.work_date || undefined,
        description: form.description || undefined,
      });
      setTableRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditing(null);
      toast.success('Work done updated successfully', { 
        position: 'bottom-right',
        style: {
          background: '#10b981',
          color: '#ffffff'
        },
        icon: ''
      });
    } catch (err) {
      toast.error('Failed to update work done', { 
        position: 'bottom-right',
        style: {
          background: '#ef4444',
          color: '#ffffff'
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      setSaving(true);
      await workDoneService.delete(deleting.id);
      setTableRecords((prev) => prev.filter((r) => r.id !== deleting.id));
      setDeleting(null);
      toast.success('Work done deleted successfully', { 
        position: 'bottom-right',
        style: {
          background: '#10b981',
          color: '#ffffff'
        },
        icon: ''
      });
    } catch {
      toast.error('Failed to delete work done', { 
        position: 'bottom-right',
        style: {
          background: '#ef4444',
          color: '#ffffff'
        }
      });
    } finally {
      setSaving(false);
    }
  };

  if (tableRecords.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <div className="text-4xl mb-3 animate-float">📋</div>
        <p className="text-slate-500 text-sm">No work done records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search work done records..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="max-w-xs w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-primary-400 text-slate-700 bg-slate-50"
        />
        <span className="text-xs text-slate-400 font-medium">{filteredRecords.length} records</span>
      </div>

      <div className="overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">No matching records found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <th className="px-8 py-4 text-left text-sm font-bold text-slate-700 w-48">Date</th>
                <th className="px-12 py-4 text-left text-sm font-bold text-slate-700 w-56">Work Name</th>
                <th className="px-12 py-4 text-left text-sm font-bold text-slate-700 flex-1">Description</th>
                <th className="px-8 py-4 text-center text-sm font-bold text-slate-700 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((r, idx) => (
                <tr key={r.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <td className="px-8 py-4 text-slate-700 font-medium whitespace-nowrap">{r.work_date || '-'}</td>
                  <td className="px-12 py-4 font-semibold text-slate-800">{r.work_name || '-'}</td>
                  <td className="px-12 py-4 text-slate-600 text-sm" title={r.description || undefined}>
                    {r.description ? (r.description.length > 60 ? `${r.description.substring(0, 60)}...` : r.description) : '-'}
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="px-3 py-2 text-slate-500 hover:text-primary-500 hover:bg-primary-100 bg-primary-50 rounded-lg transition-all font-medium text-sm inline-flex items-center gap-1.5"
                        title="Edit work done record"
                        onClick={() => openEdit(r)}
                      >
                        <BiSolidPencil className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        className="px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-100 bg-red-50 rounded-lg transition-all font-medium text-sm inline-flex items-center gap-1.5"
                        title="Delete work done record"
                        onClick={() => setDeleting(r)}
                      >
                        <BiTrash className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
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
        <div className="flex items-center justify-between px-8 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-600">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} of {filteredRecords.length} records
          </span>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="✏️ Edit Work Done Record" size="md">
        <form onSubmit={saveEdit}>
          <div className="space-y-5 py-2">
            <SearchableSelect
              label="Work Name"
              value={form.work_done_id}
              onChange={(val) => setForm((f) => ({ ...f, work_done_id: String(val) }))}
              options={workOptions}
              placeholder="Select work type"
              searchable
              required
            />
            <FormInput
              label="Work Date"
              type="date"
              value={form.work_date}
              onChange={(e) => setForm((f) => ({ ...f, work_date: e.target.value }))}
            />
            <FormTextarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Add additional notes or observations..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
            <Button type="button" onClick={() => setEditing(null)} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</Button>
            <Button type="submit" loading={saving} className="bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="🗑️ Delete Work Done Record" size="sm">
        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 font-medium">⚠️ This action cannot be undone</p>
          </div>
          <p className="text-sm text-slate-700 mb-2">
            Are you sure you want to delete this work done record?
          </p>
          <p className="text-xs text-slate-500">
            <strong>Work Done:</strong> {deleting?.work_name} ({deleting?.work_date})
          </p>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
            <Button type="button" onClick={() => setDeleting(null)} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
              Cancel
            </Button>
            <Button type="button" onClick={confirmDelete} loading={saving} className="bg-red-600 text-white hover:bg-red-700 hover:shadow-lg">
              {saving ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
