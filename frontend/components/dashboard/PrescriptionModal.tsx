'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import SearchableSelect from '@/components/forms/SearchableSelect';
import { BiTrash } from 'react-icons/bi';
import { masterService } from '@/lib/services/master';
import { prescriptionService } from '@/lib/services/prescriptions';
import { printUrlSilently } from '@/lib/print-helper';
import { toast } from 'react-hot-toast';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUid?: string;
  patientName?: string;
  onSave?: (prescription?: any) => void;
}


export default function PrescriptionModal({ isOpen, onClose, patientUid, patientName, onSave }: PrescriptionModalProps) {
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drugs, setDrugs] = useState<{ value: string; label: string }[]>([]);
  const [doses, setDoses] = useState<{ value: string; label: string }[]>([]);
  const [frequencies, setFrequencies] = useState<{ value: string; label: string }[]>([]);
  const [durations, setDurations] = useState<{ value: string; label: string }[]>([]);
  const [quantities, setQuantities] = useState<{ value: string; label: string }[]>([]);
  const [instructions, setInstructions] = useState<{ value: string; label: string }[]>([]);

  const fetchMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const [medicines, dosesRes, frequenciesRes, durationsRes, quantitiesRes, notesRes] = await Promise.all([
        masterService.getMedicines(),
        masterService.getDoses(),
        masterService.getFrequencies(),
        masterService.getDurations(),
        masterService.getQuantities(),
        masterService.getNotes(),
      ]);
      setDrugs(medicines.map(m => ({ value: String(m.id), label: m.name })));
      setDoses(dosesRes.map(d => ({ value: String(d.id), label: d.name })));
      setFrequencies(frequenciesRes.map(f => ({ value: String(f.id), label: f.name })));
      setDurations(durationsRes.map(d => ({ value: String(d.id), label: d.name })));
      setQuantities(quantitiesRes.map(q => ({ value: String(q.id), label: q.name })));
      setInstructions(notesRes.map(n => ({ value: String(n.id), label: n.name })));
    } catch (err) {
      console.error('Failed to fetch master data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPrescriptionDate(new Date().toISOString().split('T')[0]);
      setRows([{ drug_id: '', dose_id: '', frequency_id: '', duration_id: '', quantity_id: '', instruction: '' }]);
      fetchMasterData();
    }
  }, [isOpen, patientUid, fetchMasterData]);

  const addRow = () => {
    setRows([...rows, { drug_id: '', dose_id: '', frequency_id: '', duration_id: '', quantity_id: '', instruction: '' }]);
  };

  const updateRow = (index: number, field: string, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSave = async (print = false) => {
    if (!patientUid || !patientName || rows.length === 0) return;
    try {
      setSaving(true);
      const res = await prescriptionService.create({
        patient_uid: patientUid,
        patient_name: patientName,
        prescription_date: prescriptionDate,
        items: rows.map(row => ({
          drug_id: row.drug_id ? Number(row.drug_id) : undefined,
          dose_id: row.dose_id ? Number(row.dose_id) : undefined,
          frequency_id: row.frequency_id ? Number(row.frequency_id) : undefined,
          duration_id: row.duration_id ? Number(row.duration_id) : undefined,
          quantity_id: row.quantity_id ? Number(row.quantity_id) : undefined,
          instruction: row.instruction || undefined,
        })),
      });
      toast.success('Prescription added successfully', {
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
      onSave?.(res);
      onClose();
      if (print) {
        const id = res?.id;
        if (id && patientUid) {
          const url = `/patients/${patientUid}/prescriptions/${id}/print`;
          printUrlSilently(url);
        }
      }
    } catch (err: any) {
      console.error('Failed to save prescription:', err);
      toast.error(err.response?.data?.detail || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Prescription"
      size="xl"
      footer={
        <div className="flex justify-center gap-3 w-full">
          <Button type="button" onClick={() => handleSave(false)} loading={saving} disabled={saving || rows.length === 0}>
            Save Prescription
          </Button>
          <Button type="button" variant="success" onClick={() => handleSave(true)} loading={saving} disabled={saving || rows.length === 0}>
            Save & Download
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
          <FormInput label="Patient ID" value={patientUid || ''} readOnly className="bg-white" />
          <FormInput label="Patient Name" value={patientName || ''} readOnly className="bg-white" />
          <FormInput label="Date" type="date" value={prescriptionDate} onChange={(e) => setPrescriptionDate(e.target.value)} className="bg-white" />
        </div>

        <div className="border border-slate-200 rounded-xl overflow-visible bg-white">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100/80 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 font-bold text-slate-700">Medicine</th>
                <th className="px-3 py-2.5 font-bold text-slate-700">Dose</th>
                <th className="px-3 py-2.5 font-bold text-slate-700">Frequency</th>
                <th className="px-3 py-2.5 font-bold text-slate-700">Duration</th>
                <th className="px-3 py-2.5 font-bold text-slate-700">QTY</th>
                <th className="px-3 py-2.5 font-bold text-slate-700">Instruction</th>
                <th className="w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-2 py-2 min-w-[150px]">
                    <SearchableSelect
                      label=""
                      value={row.drug_id}
                      onChange={(val) => updateRow(i, 'drug_id', String(val))}
                      options={drugs}
                      placeholder="Select Medicine"
                      searchable
                    />
                  </td>
                  <td className="px-2 py-2 min-w-[110px]">
                    <SearchableSelect
                      label=""
                      value={row.dose_id}
                      onChange={(val) => updateRow(i, 'dose_id', String(val))}
                      options={doses}
                      placeholder="Select Dose"
                      searchable
                    />
                  </td>
                  <td className="px-2 py-2 min-w-[110px]">
                    <SearchableSelect
                      label=""
                      value={row.frequency_id}
                      onChange={(val) => updateRow(i, 'frequency_id', String(val))}
                      options={frequencies}
                      placeholder="Select Freq"
                      searchable
                    />
                  </td>
                  <td className="px-2 py-2 min-w-[110px]">
                    <SearchableSelect
                      label=""
                      value={row.duration_id}
                      onChange={(val) => updateRow(i, 'duration_id', String(val))}
                      options={durations}
                      placeholder="Select Duration"
                      searchable
                    />
                  </td>
                  <td className="px-2 py-2 min-w-[100px]">
                    <SearchableSelect
                      label=""
                      value={row.quantity_id}
                      onChange={(val) => updateRow(i, 'quantity_id', String(val))}
                      options={quantities}
                      placeholder="Select Qty"
                      searchable
                    />
                  </td>
                  <td className="px-2 py-2 min-w-[130px]">
                    <SearchableSelect
                      label=""
                      value={row.instruction}
                      onChange={(val) => updateRow(i, 'instruction', String(val))}
                      options={instructions}
                      placeholder="Select Instruction"
                      searchable
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button type="button" onClick={() => removeRow(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete row">
                      <BiTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No drugs added yet. Click <strong>+ Add Drug</strong> below to start building the prescription.
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-xs text-slate-400 py-1">Loading master data...</div>
        ) : (
          <div className="flex justify-start">
            <button type="button" onClick={addRow} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-all shadow-sm">
              + Add Drug
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
