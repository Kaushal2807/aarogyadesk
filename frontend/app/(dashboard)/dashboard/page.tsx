'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BiCreditCard, BiSolidUserPlus, BiSolidCloudLightning, BiClipboard, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BsPeopleFill, BsCreditCardFill, BsCalendarEventFill } from 'react-icons/bs';
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
import { Patient, PatientCount, PatientCreate, PatientUpdate } from '@/types';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const ITEMS_PER_PAGE = 20;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [, setPatientCount] = useState<PatientCount>({ total: 0, paid: 0, partial: 0, pending: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
  const router = useRouter();

  // Filter states
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('paid');
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAll({ search: search || undefined });
      setPatients(data);
      setCurrentPage(1); // Reset to first page when data changes
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
      const created = await patientService.create(data as PatientCreate);
      // Optimistically add patient to list without refetching
      setPatients(prev => [created, ...prev]);
      setShowAddModal(false);
      toast.success('✓ Patient added successfully', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '500'
        }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add patient');
    }
  };

  const handleEditPatient = async (data: Partial<Patient>) => {
    if (!selectedPatient) return;
    try {
      const updated = await patientService.update(selectedPatient.patient_uid, data as PatientUpdate);
      // Optimistically update patient in list without refetching
      setPatients(prev => prev.map(p => p.patient_uid === selectedPatient.patient_uid ? updated : p));
      setShowEditModal(false);
      setSelectedPatient(null);
      toast.success('✓ Patient updated successfully', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '500'
        }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update patient');
    }
  };

  const handleTreatmentPlan = () => {
    // Modal handles saving internally now
  };

  const handleWorkDone = () => {
    // Modal handles saving internally now
  };

  const handlePrintCase = (patient: Patient) => {
    window.open(`/patients/${patient.patient_uid}/case-details/print`, '_blank');
  };

  // Calculate statistics based on filters
  const getTotalPatientsByMonth = (): number => {
    return patients.filter(p => {
      if (!p.created_at) return false;
      const patientMonth = new Date(p.created_at).getMonth();
      const patientYear = new Date(p.created_at).getFullYear();
      return patientMonth === selectedMonth && patientYear === currentYear;
    }).length;
  };

  const getPaidPatientCount = (): number => {
    return patients.filter(p => {
      if (!p.payment_status) return false;
      let status = p.payment_status.toLowerCase();
      if (status === 'paid') return selectedPaymentStatus === 'paid';
      if (status === 'partial payment' || status === 'partial') return selectedPaymentStatus === 'partial';
      if (status === 'pending' || status === 'unpaid') return selectedPaymentStatus === 'pending';
      return false;
    }).length;
  };

  const getTodayPatients = (): number => {
    return patients.filter(p => {
      if (!p.date_of_visit) return false;
      return p.date_of_visit === selectedDate;
    }).length;
  };

  // Pagination calculations
  const totalPages = Math.ceil(patients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPatients = patients.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6 mb-4 relative">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard
          title="Total Patients"
          subtitle="Patients registered"
          value={getTotalPatientsByMonth()}
          icon={<BsPeopleFill />}
          bgClass="bg-indigo-50"
          iconBgClass="bg-indigo-600"
          textClass="text-indigo-800"
          filter={
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-indigo-300 rounded-lg px-2 py-1 text-sm bg-white text-indigo-700 cursor-pointer font-medium"
            >
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          }
        />
        <KPICard
          title="Payment Status"
          subtitle="Patients"
          value={getPaidPatientCount()}
          icon={<BsCreditCardFill />}
          bgClass="bg-emerald-50"
          iconBgClass="bg-emerald-600"
          textClass="text-emerald-800"
          filter={
            <select 
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="border border-emerald-300 rounded-lg px-2 py-1 text-sm bg-white text-emerald-700 cursor-pointer font-medium"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          }
        />
        <KPICard
          title="Today's Patients"
          subtitle="Patients visited"
          value={getTodayPatients()}
          icon={<BsCalendarEventFill />}
          bgClass="bg-purple-50"
          iconBgClass="bg-purple-600"
          textClass="text-purple-800"
          filter={
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-purple-300 rounded-lg px-2 py-1 text-sm bg-white text-purple-700 cursor-pointer font-medium"
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
            <BsPeopleFill className="w-5 h-5 text-primary-500" />
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
                        <DropdownItem onClick={() => { router.push('/prescription-master'); }} icon={<BiCreditCard className="text-emerald-500" />}>
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
                {paginatedPatients.map((patient) => (
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
                        mode="full"
                      />
                    </td>
                    <td className="text-center">
                      <StatusBadge status={patient.payment_status} />
                    </td>
                    <td className="text-center">
                      <PatientActionsCell
                        patientUid={patient.patient_uid}
                        patientName={patient.name}
                        onPrintCase={() => handlePrintCase(patient)}
                        onGenerateCertificate={() => { setActionPatient(patient); setShowCertificateModal(true); }}
                        mode="print-only"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {patients.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, patients.length)}</span> of <span className="font-semibold">{patients.length}</span> patients
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <BiChevronLeft className="w-4 h-4" /> Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageClick(pageNum)}
                      className={`px-2.5 py-1 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary-gradient text-white shadow-btn-primary'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next <BiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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
