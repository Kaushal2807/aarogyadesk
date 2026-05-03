'use client';

import { useState, useEffect, useCallback } from 'react';
import { BiCreditCard, BiSolidUserPlus, BiSolidCloudLightning, BiClipboard } from 'react-icons/bi';
import KPICard from '@/components/ui/KPICard';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Dropdown from '@/components/ui/Dropdown';
import DropdownItem from '@/components/ui/DropdownItem';
import PatientActionsCell from '@/components/shared/PatientActionsCell';
import AddPatientModal from '@/components/dashboard/AddPatientModal';
import EditPatientModal from '@/components/dashboard/EditPatientModal';
import TreatmentPlanModal from '@/components/dashboard/TreatmentPlanModal';
import PatientTreatmentModal from '@/components/dashboard/PatientTreatmentModal';
import PrescriptionModal from '@/components/dashboard/PrescriptionModal';
import WorkDoneModal from '@/components/dashboard/WorkDoneModal';
import PatientWorkDoneModal from '@/components/dashboard/PatientWorkDoneModal';
import CertificateModal from '@/components/dashboard/CertificateModal';
import { patientService } from '@/lib/services/patients';
import { treatmentService } from '@/lib/services/treatments';
import { workDoneService } from '@/lib/services/work-done';
import { Patient, PatientCount, PatientCreate, PatientUpdate } from '@/types';

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientCount, setPatientCount] = useState<PatientCount>({ total: 0, paid: 0, partial: 0, pending: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTreatmentPlanModal, setShowTreatmentPlanModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showWorkDoneModal, setShowWorkDoneModal] = useState(false);
  const [showPatientWorkModal, setShowPatientWorkModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [actionPatient, setActionPatient] = useState<Patient | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAll({ search: search || undefined });
      setPatients(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchCount = useCallback(async () => {
    try {
      const data = await patientService.getCount();
      setPatientCount(data);
    } catch {
      // count fetch failure is non-critical
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleAddPatient = async (data: Partial<Patient>) => {
    try {
      await patientService.create(data as PatientCreate);
      setShowAddModal(false);
      fetchPatients();
      fetchCount();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add patient');
    }
  };

  const handleEditPatient = async (data: Partial<Patient>) => {
    if (!selectedPatient) return;
    try {
      await patientService.update(selectedPatient.patient_uid, data as PatientUpdate);
      setShowEditModal(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update patient');
    }
  };

  const handleTreatmentPlan = async (data: { diagnosis: string; treatment: string }) => {
    try {
      await treatmentService.createPlan(data);
      setShowTreatmentPlanModal(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add treatment plan');
    }
  };

  const handleWorkDone = async (data: { work_name: string }) => {
    try {
      await workDoneService.createWorkType(data);
      setShowWorkDoneModal(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add work done');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6 mb-4 relative">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard
          title="Total Patients"
          subtitle="Patients registered"
          value={patientCount.total}
          icon={<span>👥</span>}
          bgClass="bg-indigo-50"
          iconBgClass="bg-indigo-600"
          textClass="text-indigo-800"
          filter={
            <select className="border border-indigo-300 rounded-lg px-2 py-1 text-sm bg-white text-indigo-700">
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          }
        />
        <KPICard
          title="Payment Status"
          subtitle="Patients"
          value={patientCount.paid}
          icon={<span>💳</span>}
          bgClass="bg-emerald-50"
          iconBgClass="bg-emerald-600"
          textClass="text-emerald-800"
          filter={
            <select className="border border-emerald-300 rounded-lg px-2 py-1 text-sm bg-white text-emerald-700">
              <option value="paid">Paid ({patientCount.paid})</option>
              <option value="partial">Partial ({patientCount.partial})</option>
              <option value="pending">Pending ({patientCount.pending})</option>
            </select>
          }
        />
        <KPICard
          title="Today's Patients"
          subtitle="Patients visited"
          value={patients.filter((p) => p.date_of_visit === today).length}
          icon={<span>📅</span>}
          bgClass="bg-purple-50"
          iconBgClass="bg-purple-600"
          textClass="text-purple-800"
          filter={
            <input
              type="date"
              defaultValue={today}
              className="border border-purple-300 rounded-lg px-2 py-1 text-sm bg-white text-purple-700"
            />
          }
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {/* Patient Records Panel */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Panel Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-primary-500 text-lg">👥</span>
            <span className="font-bold text-sm text-slate-800">Patient Records</span>
            <Badge variant="count">{patients.length} Records</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by Patient ID or Name..."
              className="flex-1 min-w-[250px] max-w-[400px]"
            />

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md transition-all"
            >
              <BiSolidUserPlus className="w-4 h-4" /> Add New Patient
            </button>

            <Dropdown
              trigger={
                <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-gradient text-white rounded-lg shadow-btn-primary hover:shadow-btn-primary-hover transition-all cursor-pointer">
                  <BiSolidCloudLightning className="w-4 h-4" /> Quick Actions
                </span>
              }
            >
              <DropdownItem onClick={() => setShowTreatmentPlanModal(true)} icon={<BiClipboard className="text-primary-500" />}>
                Treatment Plan
              </DropdownItem>
              <DropdownItem onClick={() => setShowWorkDoneModal(true)} icon={<BiCreditCard className="text-emerald-500" />}>
                Work Done
              </DropdownItem>
              <DropdownItem onClick={() => { setActionPatient(null); setShowPrescriptionModal(true); }} icon={<BiCreditCard className="text-emerald-500" />}>
                Prescription
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3">Loading patients...</span>
            </div>
          ) : patients.length === 0 ? (
            <EmptyState message={search ? 'No patients found for your search' : 'No patients yet. Add your first patient!'} />
          ) : (
            <table className="cms-table w-full">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th className="text-center">Quick Actions</th>
                  <th className="text-center">Manage</th>
                  <th className="text-center">Print</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="font-semibold text-primary-500">{patient.patient_uid}</td>
                    <td className="font-medium">{patient.name}</td>
                    <td className="text-center">
                      <PatientActionsCell
                        patientUid={patient.patient_uid}
                        patientName={patient.name}
                        onEdit={() => handleEdit(patient)}
                        onAddTreatment={() => { setActionPatient(patient); setShowTreatmentModal(true); }}
                        onAddPrescription={() => { setActionPatient(patient); setShowPrescriptionModal(true); }}
                        onAddWorkDone={() => { setActionPatient(patient); setShowPatientWorkModal(true); }}
                        onGenerateCertificate={() => { setActionPatient(patient); setShowCertificateModal(true); }}
                      />
                    </td>
                    <td className="text-center">
                      <StatusBadge status={patient.payment_status} />
                    </td>
                    <td className="text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500">
                        {patient.total_visit} visits
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddPatientModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAddPatient} />
      <EditPatientModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedPatient(null); }} patient={selectedPatient} onSave={handleEditPatient} />
      <TreatmentPlanModal isOpen={showTreatmentPlanModal} onClose={() => setShowTreatmentPlanModal(false)} onSave={handleTreatmentPlan} />
      <PatientTreatmentModal isOpen={showTreatmentModal} onClose={() => { setShowTreatmentModal(false); setActionPatient(null); }} patientUid={actionPatient?.patient_uid} patientName={actionPatient?.name} onSave={fetchPatients} />
      <PrescriptionModal isOpen={showPrescriptionModal} onClose={() => { setShowPrescriptionModal(false); setActionPatient(null); }} patientUid={actionPatient?.patient_uid} patientName={actionPatient?.name} onSave={fetchPatients} />
      <WorkDoneModal isOpen={showWorkDoneModal} onClose={() => setShowWorkDoneModal(false)} onSave={handleWorkDone} />
      <PatientWorkDoneModal isOpen={showPatientWorkModal} onClose={() => { setShowPatientWorkModal(false); setActionPatient(null); }} patientUid={actionPatient?.patient_uid} patientName={actionPatient?.name} onSave={fetchPatients} />
      <CertificateModal isOpen={showCertificateModal} onClose={() => { setShowCertificateModal(false); setActionPatient(null); }} patientUid={actionPatient?.patient_uid} patientName={actionPatient?.name} />
    </div>
  );
}
