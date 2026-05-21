'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import { BiTrash } from 'react-icons/bi';
import { masterService } from '@/lib/services/master';
import { prescriptionService } from '@/lib/services/prescriptions';

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
      fetchMasterData();
    }
  }, [isOpen, fetchMasterData]);

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
      onSave?.(res);
      onClose();
      if (print) {
        const id = res?.id;
        if (id && patientUid) {
          const url = `/patients/${patientUid}/prescriptions/${id}/print`;
          window.open(url, '_blank');
        }
      }
    } catch (err) {
      console.error('Failed to save prescription:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Prescription" size="xl">
      <div className="py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormInput label="Patient ID" value={patientUid || ''} readOnly className="bg-slate-50" />
          <FormInput label="Patient Name" value={patientName || ''} readOnly className="bg-slate-50" />
          <FormInput label="Date" type="date" value={prescriptionDate} onChange={(e) => setPrescriptionDate(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-2 py-2 text-xs font-semibold text-slate-700">Medicine</th>
                <th className="px-2 py-2 text-xs font-semibold text-slate-700">Dose</th>
                <th className="px-2 py-2 text-xs font-semibold text-slate-700">Frequency</th>
                <th className="px-2 py-2 text-xs font-semibold text-slate-700">Duration</th>
                <th className="px-2 py-2 text-xs font-semibold text-slate-700">QTY</th>
                <th className="px-2 py-2 text-xs font-semibold text-slate-700">Instruction</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-1 py-1"><select className="w-full py-1.5 px-2 text-xs border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-500" value={row.drug_id} onChange={(e) => updateRow(i, 'drug_id', e.target.value)}><option value="">Select</option>{drugs.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></td>
                  <td className="px-1 py-1"><select className="w-full py-1.5 px-2 text-xs border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-500" value={row.dose_id} onChange={(e) => updateRow(i, 'dose_id', e.target.value)}><option value="">Dose</option>{doses.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></td>
                  <td className="px-1 py-1"><select className="w-full py-1.5 px-2 text-xs border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-500" value={row.frequency_id} onChange={(e) => updateRow(i, 'frequency_id', e.target.value)}><option value="">Freq</option>{frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select></td>
                  <td className="px-1 py-1"><select className="w-full py-1.5 px-2 text-xs border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-500" value={row.duration_id} onChange={(e) => updateRow(i, 'duration_id', e.target.value)}><option value="">Duration</option>{durations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></td>
                  <td className="px-1 py-1"><select className="w-full py-1.5 px-2 text-xs border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-500" value={row.quantity_id} onChange={(e) => updateRow(i, 'quantity_id', e.target.value)}><option value="">Qty</option>{quantities.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}</select></td>
                  <td className="px-1 py-1"><select className="w-full py-1.5 px-2 text-xs border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-500" value={row.instruction} onChange={(e) => updateRow(i, 'instruction', e.target.value)}><option value="">Instr</option>{instructions.map(inst => <option key={inst.value} value={inst.value}>{inst.label}</option>)}</select></td>
                  <td className="px-1 py-1"><button type="button" onClick={() => removeRow(i)} className="p-1 text-red-500 hover:bg-red-50 rounded"><BiTrash className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? (
          <div className="mt-2 text-center text-sm text-slate-400 py-2">Loading master data...</div>
        ) : (
        <button type="button" onClick={addRow} className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all">
          + Add Drug
        </button>
        )}
      </div>
      <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 mt-4">
        <Button type="button" onClick={() => handleSave(false)} loading={saving} disabled={saving || rows.length === 0}>Save Prescription</Button>
        <Button type="button" variant="success" onClick={() => handleSave(true)} loading={saving} disabled={saving || rows.length === 0}>Save & Print</Button>
      </div>
    </Modal>
  );
}
