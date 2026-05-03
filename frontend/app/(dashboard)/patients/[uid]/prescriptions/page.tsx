'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { prescriptionService } from '@/lib/services/prescriptions';
import { Prescription } from '@/types';
import PrescriptionCard from '@/components/patients/PrescriptionCard';
import EmptyState from '@/components/ui/EmptyState';

export default function PatientPrescriptionsPage() {
  const params = useParams();
  const uid = params.uid as string;
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await prescriptionService.getByPatient(uid);
        setPrescriptions(data);
      } catch {
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-3">Loading prescriptions...</span>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return <EmptyState message="No prescriptions found for this patient" />;
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((rx) => (
        <PrescriptionCard key={rx.id} prescription={rx} />
      ))}
    </div>
  );
}
