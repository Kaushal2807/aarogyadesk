'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { patientService } from '@/lib/services/patients';
import { prescriptionService } from '@/lib/services/prescriptions';
import { treatmentService } from '@/lib/services/treatments';
import { workDoneService } from '@/lib/services/work-done';
import { Patient } from '@/types';
import PersonalInfoCard from '@/components/patients/PersonalInfoCard';
import PaymentInfoCard from '@/components/patients/PaymentInfoCard';
import MedicalInfoCard from '@/components/patients/MedicalInfoCard';

import Badge from '@/components/ui/Badge';

export default function PatientHistoryPage() {
  const params = useParams();
  const uid = params.uid as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [treatmentCount, setTreatmentCount] = useState(0);
  const [workDoneCount, setWorkDoneCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const [patientData, prescriptions, treatments, workDone] = await Promise.all([
          patientService.getByUid(uid),
          prescriptionService.getByPatient(uid),
          treatmentService.getByPatient(uid),
          workDoneService.getByPatient(uid),
        ]);
        setPatient(patientData);
        setPrescriptionCount(prescriptions.length);
        setTreatmentCount(treatments.length);
        setWorkDoneCount(workDone.length);
      } catch {
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-3">Loading patient history...</span>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-card p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Prescriptions</p>
            <Badge variant="count">{prescriptionCount}</Badge>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Treatments</p>
            <Badge variant="count">{treatmentCount}</Badge>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Work Done</p>
            <Badge variant="count">{workDoneCount}</Badge>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PersonalInfoCard patient={patient} />
          <PaymentInfoCard patient={patient} />
        </div>

        <MedicalInfoCard patient={patient} />
    </div>
  );
}
