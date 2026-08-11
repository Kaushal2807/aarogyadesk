'use client';

import { useEffect, useState } from 'react';
import { masterService } from '@/lib/services/master';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import toast from 'react-hot-toast';
import TableSkeleton from '@/components/ui/TableSkeleton';

import { MasterItem } from '@/types';

type SectionKey = 'medicines' | 'doses' | 'frequencies' | 'durations' | 'quantities' | 'notes';

export default function PrescriptionMasterPage() {
  // Start with empty lists by default (user requested empty tables)
  const [medicines, setMedicines] = useState<MasterItem[]>([]);
  const [doses, setDoses] = useState<MasterItem[]>([]);
  const [frequencies, setFrequencies] = useState<MasterItem[]>([]);
  const [durations, setDurations] = useState<MasterItem[]>([]);
  const [quantities, setQuantities] = useState<MasterItem[]>([]);
  const [notes, setNotes] = useState<MasterItem[]>([]);

  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('medicines');
  const [editing, setEditing] = useState<MasterItem | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);

  const loadAll = async () => {
    try {
      setLoadingAll(true);
      const [m, d, f, du, q, n] = await Promise.all([
        masterService.getMedicines(),
        masterService.getDoses(),
        masterService.getFrequencies(),
        masterService.getDurations(),
        masterService.getQuantities(),
        masterService.getNotes(),
      ]);
      setMedicines(m);
      setDoses(d);
      setFrequencies(f);
      setDurations(du);
      setQuantities(q);
      setNotes(n);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load master lists');
    } finally {
      setLoadingAll(false);
    }
  };

  const openAdd = (section: SectionKey) => {
    setActiveSection(section);
    setEditing(null);
    setName('');
    setOpen(true);
  };

  const openEdit = (section: SectionKey, item: MasterItem) => {
    setActiveSection(section);
    setEditing(item);
    setName(item.name);
    setOpen(true);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSave = async (): Promise<void> => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      let res: MasterItem | void;
      if (activeSection === 'medicines') {
        if (editing) res = await masterService.updateMedicine(editing.id, name);
        else res = await masterService.createMedicine(name);
        setMedicines(prev => editing ? prev.map(p => (p.id === editing.id ? res as MasterItem : p)) : [res as MasterItem, ...prev]);
      }
      if (activeSection === 'doses') {
        if (editing) res = await masterService.updateDose(editing.id, name);
        else res = await masterService.createDose(name);
        setDoses(prev => editing ? prev.map(p => (p.id === editing.id ? res as MasterItem : p)) : [res as MasterItem, ...prev]);
      }
      if (activeSection === 'frequencies') {
        if (editing) res = await masterService.updateFrequency(editing.id, name);
        else res = await masterService.createFrequency(name);
        setFrequencies(prev => editing ? prev.map(p => (p.id === editing.id ? res as MasterItem : p)) : [res as MasterItem, ...prev]);
      }
      if (activeSection === 'durations') {
        if (editing) res = await masterService.updateDuration(editing.id, name);
        else res = await masterService.createDuration(name);
        setDurations(prev => editing ? prev.map(p => (p.id === editing.id ? res as MasterItem : p)) : [res as MasterItem, ...prev]);
      }
      if (activeSection === 'quantities') {
        if (editing) res = await masterService.updateQuantity(editing.id, name);
        else res = await masterService.createQuantity(name);
        setQuantities(prev => editing ? prev.map(p => (p.id === editing.id ? res as MasterItem : p)) : [res as MasterItem, ...prev]);
      }
      if (activeSection === 'notes') {
        if (editing) res = await masterService.updateNote(editing.id, name);
        else res = await masterService.createNote(name);
        setNotes(prev => editing ? prev.map(p => (p.id === editing.id ? res as MasterItem : p)) : [res as MasterItem, ...prev]);
      }

      toast.success(editing ? `${name} updated successfully` : `${name} added successfully`, {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (section: SectionKey, id: number) => {
    // Use SweetAlert2 for confirmation (load from CDN if not present)
    const loadSwal = async () => {
      if ((window as any).Swal) return (window as any).Swal;
      return new Promise<any>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        s.async = true;
        s.onload = () => resolve((window as any).Swal);
        s.onerror = reject;
        document.head.appendChild(s);
      });
    };

    try {
      const Swal = await loadSwal();
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action will permanently delete the item.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc2626',
      });
      // Find item name before confirming delete
      const allItems: Record<SectionKey, MasterItem[]> = { medicines, doses, frequencies, durations, quantities, notes };
      const deletedItem = allItems[section]?.find(p => p.id === id);

      if (!result.isConfirmed) return;

      // Always call backend to delete persisted master items
      if (section === 'medicines') await masterService.deleteMedicine(id);
      if (section === 'doses') await masterService.deleteDose(id);
      if (section === 'frequencies') await masterService.deleteFrequency(id);
      if (section === 'durations') await masterService.deleteDuration(id);
      if (section === 'quantities') await masterService.deleteQuantity(id);
      if (section === 'notes') await masterService.deleteNote(id);

      // remove from state
      if (section === 'medicines') setMedicines(prev => prev.filter(p => p.id !== id));
      if (section === 'doses') setDoses(prev => prev.filter(p => p.id !== id));
      if (section === 'frequencies') setFrequencies(prev => prev.filter(p => p.id !== id));
      if (section === 'durations') setDurations(prev => prev.filter(p => p.id !== id));
      if (section === 'quantities') setQuantities(prev => prev.filter(p => p.id !== id));
      if (section === 'notes') setNotes(prev => prev.filter(p => p.id !== id));

      toast.success(`${deletedItem?.name || 'Item'} deleted successfully`, {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  const Section = ({ title, items, keyName }: { title: string; items: MasterItem[]; keyName: SectionKey }) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const filteredItems = items.filter(it => it.name.toLowerCase().includes(search.toLowerCase()));
    const totalPages = Math.ceil(filteredItems.length / pageSize);
    const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="text-sm font-semibold text-primary-600 shrink-0">{title}</h3>
            <Button size="sm" variant="outline-primary" onClick={() => openAdd(keyName)}>+ Add</Button>
          </div>
          
          {items.length > 0 && (
            <div className="mb-3">
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md outline-none focus:border-primary-400 text-slate-700 bg-slate-50"
              />
            </div>
          )}

          <div className="overflow-x-auto">
            {loadingAll ? (
              <TableSkeleton rows={4} cols={2} />
            ) : (
              <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-2 py-2">Name</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(it => (
                  <tr key={it.id} className="border-b">
                    <td className="px-2 py-2">{it.name}</td>
                    <td className="px-2 py-2 text-right">
                      <button title="Edit" onClick={() => openEdit(keyName, it)} className="inline-flex items-center px-2 py-1 rounded text-amber-700 hover:bg-amber-50 mr-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      <button title="Delete" onClick={() => handleDelete(keyName, it.id)} className="inline-flex items-center px-2 py-1 rounded text-red-600 hover:bg-red-50"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr><td colSpan={2} className="px-2 py-4 text-sm text-slate-400 text-center">{items.length === 0 ? 'No items' : 'No matching items'}</td></tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="px-2 py-1 border rounded hover:bg-slate-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="px-2 py-1 border rounded hover:bg-slate-50 disabled:opacity-40"
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
    <div className="h-full overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-4 mt-6 mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Prescription Master</h2>
        <div />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section title="Medicines" items={medicines} keyName="medicines" />
        <Section title="Doses" items={doses} keyName="doses" />
        <Section title="Frequencies" items={frequencies} keyName="frequencies" />
        <Section title="Durations" items={durations} keyName="durations" />
        <Section title="Quantities" items={quantities} keyName="quantities" />
        <Section title="Instructions" items={notes} keyName="notes" />
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit' : 'Add'} size="sm">
        <div>
          <FormInput label="Name" placeholder={getPlaceholderForSection(activeSection)} value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={loading}>{editing ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
    </div>
  );
}


function getPlaceholderForSection(section: SectionKey) {
  switch (section) {
    case 'medicines':
      return 'e.g. Amoxicillin 500mg';
    case 'doses':
      return 'e.g. 500mg';
    case 'frequencies':
      return 'e.g. Twice a day';
    case 'durations':
      return 'e.g. 5 days';
    case 'quantities':
      return 'e.g. 10 tablets';
    case 'notes':
      return 'e.g. After food';
    default:
      return '';
  }
}
