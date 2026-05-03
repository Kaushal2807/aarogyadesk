'use client';

import { useState, useEffect, useCallback } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import SearchInput from '@/components/ui/SearchInput';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import EmptyState from '@/components/ui/EmptyState';
import { appointmentService } from '@/lib/services/appointments';
import { Appointment, AppointmentCreate, AppointmentUpdate } from '@/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    patient_name: '', age: '', contact_number: '', appointment_date: new Date().toISOString().split('T')[0], appointment_time: new Date().toTimeString().slice(0, 5), booking_type: 'walk-in', address: '',
  });

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filteredAppointments = search
    ? appointments.filter(a => a.patient_name.toLowerCase().includes(search.toLowerCase()) || (a.contact_number || '').includes(search))
    : appointments;

  const today = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter((a) => a.status === 'pending' && a.appointment_date === today).length;

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  const toggleStatus = async (id: number, checked: boolean) => {
    try {
      const newStatus = checked ? 'completed' : 'pending';
      await appointmentService.updateStatus(id, newStatus);
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const openReschedule = (apt: Appointment) => {
    setRescheduleData(apt);
    setFormData({
      patient_name: apt.patient_name,
      age: String(apt.age || ''),
      contact_number: apt.contact_number || '',
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      booking_type: apt.booking_type,
      address: apt.address || '',
    });
    setShowRescheduleModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createData: AppointmentCreate = {
        patient_name: formData.patient_name,
        age: formData.age ? Number(formData.age) : undefined,
        contact_number: formData.contact_number || undefined,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        booking_type: formData.booking_type as 'walk-in' | 'call',
        address: formData.address || undefined,
      };
      await appointmentService.create(createData);
      setShowAddModal(false);
      setFormData({ patient_name: '', age: '', contact_number: '', appointment_date: new Date().toISOString().split('T')[0], appointment_time: new Date().toTimeString().slice(0, 5), booking_type: 'walk-in', address: '' });
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add appointment');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData) return;
    try {
      const updateData: AppointmentUpdate = {
        patient_name: formData.patient_name,
        age: formData.age ? Number(formData.age) : undefined,
        contact_number: formData.contact_number || undefined,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        booking_type: formData.booking_type as 'walk-in' | 'call',
        address: formData.address || undefined,
      };
      await appointmentService.update(rescheduleData.id, updateData);
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reschedule');
    }
  };

  const resetForm = () => ({
    patient_name: '', age: '', contact_number: '', appointment_date: new Date().toISOString().split('T')[0], appointment_time: new Date().toTimeString().slice(0, 5), booking_type: 'walk-in', address: '',
  });

  const AppointmentForm = ({ onSubmit, submitLabel, initialData }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string; initialData?: typeof formData }) => {
    const [data, setData] = useState(initialData || resetForm());
    return (
      <form onSubmit={(e) => { onSubmit(e); }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput label="Patient Name" value={data.patient_name} onChange={(e) => setData({ ...data, patient_name: e.target.value })} required />
          <FormInput label="Age" value={data.age} onChange={(e) => setData({ ...data, age: e.target.value })} type="number" />
          <FormInput label="Contact Number" value={data.contact_number} onChange={(e) => setData({ ...data, contact_number: e.target.value })} required />
          <FormInput label="Date" value={data.appointment_date} onChange={(e) => setData({ ...data, appointment_date: e.target.value })} type="date" required />
          <FormInput label="Time" value={data.appointment_time} onChange={(e) => setData({ ...data, appointment_time: e.target.value })} type="time" required />
          <FormSelect label="Booking Type" value={data.booking_type} onChange={(e) => setData({ ...data, booking_type: e.target.value })} options={[{ value: 'walk-in', label: 'Walk-in' }, { value: 'call', label: 'On Call' }]} required />
          <div className="md:col-span-3">
            <FormInput label="Address" value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex-1 max-w-[40%]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or number..." />
        </div>
        <div className="bg-white shadow-sm px-4 py-2 rounded-full font-semibold text-sm">
          Today&apos;s Appointments: <span className="text-primary-600 font-bold">{todayCount}</span>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={<BiPlusCircle />}>
          Add Appointment
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-4">
          <h4 className="font-bold text-primary-600 mb-4">Appointments</h4>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3">Loading appointments...</span>
            </div>
          ) : appointments.length === 0 ? (
            <EmptyState message="No appointments found" />
          ) : (
            <table className="cms-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt, index) => (
                  <tr key={apt.id} className={apt.status === 'completed' ? 'opacity-50 line-through' : ''}>
                    <td>{index + 1}</td>
                    <td>{apt.patient_name}</td>
                    <td>{apt.contact_number}</td>
                    <td>{apt.appointment_date}</td>
                    <td>{formatTime(apt.appointment_time)}</td>
                    <td><span className="capitalize">{apt.booking_type}</span></td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          checked={apt.status === 'completed'}
                          onChange={(e) => toggleStatus(apt.id, e.target.checked)}
                          className="w-[18px] h-[18px] accent-primary-500 cursor-pointer"
                          disabled={apt.status === 'completed'}
                        />
                        <button
                          disabled={apt.status === 'completed'}
                          onClick={() => openReschedule(apt)}
                          className="px-2 py-1 text-xs font-medium bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Reschedule
                        </button>
                        <button
                          disabled={apt.status === 'completed'}
                          onClick={() => toggleStatus(apt.id, true)}
                          className="px-2 py-1 text-xs font-medium bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          + Patient
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Appointment">
        <AppointmentForm onSubmit={handleAdd} submitLabel="Save Appointment" />
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={showRescheduleModal} onClose={() => setShowRescheduleModal(false)} title="Reschedule Appointment">
        <AppointmentForm onSubmit={handleReschedule} submitLabel="Update" initialData={rescheduleData ? {
          patient_name: rescheduleData.patient_name, age: String(rescheduleData.age || ''), contact_number: rescheduleData.contact_number || '',
          appointment_date: rescheduleData.appointment_date, appointment_time: rescheduleData.appointment_time, booking_type: rescheduleData.booking_type, address: rescheduleData.address || '',
        } : undefined} />
      </Modal>
    </div>
  );
}
