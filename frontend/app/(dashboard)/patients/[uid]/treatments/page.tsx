'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { treatmentService } from '@/lib/services/treatments';
import { PatientTreatment } from '@/types';
import TreatmentHistoryCard from '@/components/patients/TreatmentHistoryCard';
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

  return treatments.length === 0 ? (
    <EmptyState message="No treatment records found for this patient" />
  ) : (
    <div className="space-y-6">
      {treatments.map((t) => (
        <TreatmentHistoryCard
          key={t.id}
          treatment={t}
          uid={uid}
          onDeleted={() => {
            // refetch after delete
            setLoading(true);
            (async () => {
              try {
                const data = await treatmentService.getByPatient(uid);
                setTreatments(data);
              } catch {
                setTreatments([]);
              } finally {
                setLoading(false);
              }
            })();
          }}
        />
      ))}
    </div>
  );
}
