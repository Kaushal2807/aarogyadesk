'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';
import { workDoneService } from '@/lib/services/work-done';

import { toast } from 'react-hot-toast';

interface WorkDoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function WorkDoneModal({ isOpen, onClose, onSave }: WorkDoneModalProps) {
  const [workName, setWorkName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workName.trim()) return;

    try {
      setSaving(true);
      await workDoneService.createWorkType({ work_name: workName });
      toast.success('Work done type added successfully', {
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
      setWorkName('');
      onSave?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to save work done:', err);
      toast.error(err.response?.data?.detail || 'Failed to save work done');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Work Done" size="md">
      <form onSubmit={handleSubmit}>
        <FormInput 
          label="Work Done" 
          value={workName} 
          onChange={(e) => setWorkName(e.target.value)} 
          required 
          placeholder="Enter work done..." 
        />
        <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
          <Button type="submit" loading={saving}>Save Work Done</Button>
        </div>
      </form>
    </Modal>
  );
}
