'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { workDoneService } from '@/lib/services/work-done';
import { PatientWorkDone } from '@/types';
import WorkDoneTable from '@/components/patients/WorkDoneTable';

export default function PatientWorkDonePage() {
  const params = useParams();
  const uid = params.uid as string;
  const [records, setRecords] = useState<PatientWorkDone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkDone = async () => {
      try {
        const data = await workDoneService.getByPatient(uid);
        setRecords(data);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkDone();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-3">Loading work done...</span>
      </div>
    );
  }

  return <WorkDoneTable records={records} />;
}
