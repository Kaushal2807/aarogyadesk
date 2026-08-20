'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import { BiSolidUserPlus, BiChevronLeft, BiChevronRight, BiCalendar } from 'react-icons/bi';
import { BsPeopleFill, BsCreditCardFill, BsCalendarEventFill } from 'react-icons/bs';
import KPICard from '@/components/ui/KPICard';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import TableSkeleton from '@/components/ui/TableSkeleton';

import PatientActionsCell from '@/components/shared/PatientActionsCell';
import AddPatientModal from '@/components/dashboard/AddPatientModal';
import EditPatientModal from '@/components/dashboard/EditPatientModal';

import PatientTreatmentModal from '@/components/dashboard/PatientTreatmentModal';
import PrescriptionModal from '@/components/dashboard/PrescriptionModal';

import PatientWorkDoneModal from '@/components/dashboard/PatientWorkDoneModal';
import CertificateModal from '@/components/dashboard/CertificateModal';
import { patientService } from '@/lib/services/patients';
import { printUrlSilently } from '@/lib/print-helper';
import { Patient, PatientCount, PatientCreate, PatientUpdate } from '@/types';
import { toast } from 'react-hot-toast';
import { featureFlags } from '@/lib/featureFlags';

export default function DashboardPage() {
  const ITEMS_PER_PAGE = 10;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [, setPatientCount] = useState<PatientCount>({ total: 0, paid: 0, partial: 0, pending: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const [showPatientWorkModal, setShowPatientWorkModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [actionPatient, setActionPatient] = useState<Patient | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof (el as any).showPicker === 'function') {
      (el as any).showPicker();
    } else {
      el.click();
    }
  };


  // Filter states
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  const handleAddPatient = (data: Partial<Patient>) => {
    // Close modal immediately — don't wait for API
    setShowAddModal(false);

    patientService.create(data as PatientCreate)
      .then((created) => {
        setPatients(prev => [created, ...prev]);
        toast.success('Patient added successfully', {
          duration: 3000,
          style: { background: '#10b981', color: '#fff', fontWeight: '500' },
        });
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.detail || 'Failed to add patient');
      });
  };

  const handleEditPatient = async (data: Partial<Patient>) => {
    if (!selectedPatient) return;
    try {
      const updated = await patientService.update(selectedPatient.patient_uid, data as PatientUpdate);
      // Optimistically update patient in list without refetching
      setPatients(prev => prev.map(p => p.patient_uid === selectedPatient.patient_uid ? updated : p));
      setShowEditModal(false);
      setSelectedPatient(null);
      toast.success('Patient updated successfully', {
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



  const handlePrintCase = (patient: Patient) => {
    printUrlSilently(`/patients/${patient.patient_uid}/case-details/print`);
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
    <div className="flex flex-col h-full px-4 pt-4 pb-2 max-w-[1400px] mx-auto overflow-hidden">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 shrink-0">
        <KPICard
          title="Total Patients"
          subtitle="Patients registered"
          value={getTotalPatientsByMonth()}
          icon={<BsPeopleFill />}
          bgClass="bg-gradient-to-br from-indigo-600 to-indigo-800"
          iconBgClass="bg-white/20"
          textClass="text-white"
          filter={
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-white/30 rounded-lg px-2 py-1 text-sm bg-white/20 text-white cursor-pointer font-medium backdrop-blur-sm w-auto max-w-[110px]"
            >
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx} className="text-indigo-900 bg-white">{m}</option>
              ))}
            </select>
          }
        />
        <KPICard
          title="Payment Status"
          subtitle="Patients"
          value={getPaidPatientCount()}
          icon={<BsCreditCardFill />}
          bgClass={selectedPaymentStatus === 'pending'
            ? 'bg-gradient-to-br from-red-500 to-red-700'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}
          iconBgClass="bg-white/20"
          textClass="text-white"
          filter={
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="border border-white/30 rounded-lg px-2 py-1 text-sm text-white cursor-pointer font-medium w-auto max-w-[115px]"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <option value="paid" className="text-slate-800 bg-white">Paid</option>
              <option value="pending" className="text-slate-800 bg-white">Pending</option>
            </select>
          }
        />
        <KPICard
          title="Today's Patients"
          subtitle="Patients visited"
          value={getTodayPatients()}
          icon={<BsCalendarEventFill />}
          bgClass="bg-gradient-to-br from-purple-600 to-purple-800"
          iconBgClass="bg-white/20"
          textClass="text-white"
          filter={
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={openDatePicker}
                className="flex items-center gap-1.5 px-2 py-1 border border-white/30 rounded-lg text-white text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <BiCalendar className="w-3.5 h-3.5" />
                <span>{selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Date'}</span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="sr-only"
              />
            </div>
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
      <div className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col flex-1 min-h-0">
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


          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0">
          {loading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : patients.length === 0 ? (
            <EmptyState message={search ? 'No patients found for your search' : 'No patients yet. Add your first patient!'} />
          ) : (
            <table className="cms-table w-full">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th className="text-center">Quick Actions</th>
                  <th className="text-center">Manage</th>
                  {featureFlags.enableTemplates && <th className="text-center">Print</th>}
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
                    {featureFlags.enableTemplates && (
                      <td className="text-center">
                        <PatientActionsCell
                          patientUid={patient.patient_uid}
                          patientName={patient.name}
                          onPrintCase={() => handlePrintCase(patient)}
                          onGenerateCertificate={() => { setActionPatient(patient); setShowCertificateModal(true); }}
                          mode="print-only"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {patients.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
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
                      className={`px-2.5 py-1 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
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

      <PatientTreatmentModal isOpen={showTreatmentModal} onClose={() => { setShowTreatmentModal(false); setActionPatient(null); }} patientUid={actionPatient?.patient_uid} patientName={actionPatient?.name} onSave={fetchPatients} />
      <PrescriptionModal isOpen={showPrescriptionModal} onClose={() => { setShowPrescriptionModal(false); setActionPatient(null); }} patientUid={actionPatient?.patient_uid} patientName={actionPatient?.name} onSave={fetchPatients} />

      <PatientWorkDoneModal isOpen={showPatientWorkModal} onClose={() => { setShowPatientWorkModal(false); setActionPatient(null); }} patientUid={actionPatient?.patient_uid} patientName={actionPatient?.name} onSave={fetchPatients} />
      <CertificateModal isOpen={showCertificateModal} onClose={() => { setShowCertificateModal(false); setActionPatient(null); }} patientUid={actionPatient?.patient_uid} patientName={actionPatient?.name} />
    </div>
  );
}
