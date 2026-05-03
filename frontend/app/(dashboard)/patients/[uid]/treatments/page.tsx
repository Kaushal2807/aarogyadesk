'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { treatmentService } from '@/lib/services/treatments';
import { PatientTreatment } from '@/types';
import TreatmentCard from '@/components/patients/TreatmentCard';
import EmptyState from '@/components/ui/EmptyState';

export default function PatientTreatmentsPage() {
  const params = useParams();
  const uid = params.uid as string;
  const [treatments, setTreatments] = useState<PatientTreatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const data = await treatmentService.getByPatient(uid);
        setTreatments(data);
      } catch {
        setTreatments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTreatments();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-3">Loading treatments...</span>
      </div>
    );
  }

  if (treatments.length === 0) {
    return <EmptyState message="No treatment records found for this patient" />;
  }

  return (
    <div className="space-y-4">
      {treatments.map((t) => (
        <TreatmentCard key={t.id} treatment={t} />
      ))}
    </div>
  );
}
