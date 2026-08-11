'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BiPlusCircle } from 'react-icons/bi';
import { toast } from 'react-hot-toast';
import SearchInput from '@/components/ui/SearchInput';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import EmptyState from '@/components/ui/EmptyState';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { appointmentService } from '@/lib/services/appointments';
import { patientService } from '@/lib/services/patients';
import { Appointment, AppointmentCreate, AppointmentUpdate } from '@/types';
import { PatientCreate } from '@/types';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<Appointment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToConfirm, setAppointmentToConfirm] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    patient_name: '', age: '', contact_number: '', appointment_date: new Date().toISOString().split('T')[0], appointment_time: new Date().toTimeString().slice(0, 5), booking_type: 'walk-in', address: '',
  });

  const fetchAppointments = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const data = await appointmentService.getByDate({ date });
      setAppointments(data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [fetchAppointments, selectedDate]);

  const today = new Date().toISOString().split('T')[0];

  // All appointments returned are already filtered by selectedDate from backend
  const selectedDateAppointments = appointments;

  const filteredAppointments = search
    ? selectedDateAppointments.filter(a => a.patient_name.toLowerCase().includes(search.toLowerCase()) || (a.contact_number || '').includes(search))
    : selectedDateAppointments;

  const activeCount = selectedDateAppointments.filter((a) => a.status === 'pending').length;

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  const toggleStatus = async (id: number, checked: boolean) => {
    const newStatus = checked ? 'completed' : 'pending';
    appointmentService.updateStatus(id, newStatus)
      .then(() => {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
        toast.success(newStatus === 'completed' ? 'Marked as completed' : 'Marked as pending', {
          style: { background: '#10b981', color: '#fff', fontWeight: '500' },
        });
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.detail || 'Failed to update status');
      });
  };

  const handleAddPatient = (apt: Appointment) => {
    setAppointmentToConfirm(apt);
    setShowConfirmModal(true);
  };

  const handleConfirmAddPatient = async () => {
    if (!appointmentToConfirm) return;
    const apt = appointmentToConfirm;

    // Close modal immediately
    setShowConfirmModal(false);
    setAppointmentToConfirm(null);

    try {
      await appointmentService.updateStatus(apt.id, 'completed');
      setAppointments((prev) =>
        prev.map((a) => (a.id === apt.id ? { ...a, status: 'completed' } : a))
      );

      const patientData: PatientCreate = {
        name: apt.patient_name,
        age: apt.age || undefined,
        contact_number: apt.contact_number || undefined,
        address: apt.address || undefined,
        date_of_visit: apt.appointment_date,
        payment_status: 'pending',
      };
      const newPatient = await patientService.create(patientData);
      toast.success(`${apt.patient_name} added as patient`, {
        style: { background: '#10b981', color: '#fff', fontWeight: '500' },
      });
      router.push(`/dashboard?patientId=${newPatient.id}&highlight=true`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add patient');
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

  const handleAdd = async (e: React.FormEvent<any>) => {
    e.preventDefault();
    const data = (e as any).formData || formData;
    const createData: AppointmentCreate = {
      patient_name: data.patient_name,
      age: data.age ? Number(data.age) : undefined,
      contact_number: data.contact_number || undefined,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      booking_type: data.booking_type as 'walk-in' | 'call',
      address: data.address || undefined,
    };

    // Close modal immediately — don't wait for API
    setShowAddModal(false);
    setFormData({ patient_name: '', age: '', contact_number: '', appointment_date: new Date().toISOString().split('T')[0], appointment_time: new Date().toTimeString().slice(0, 5), booking_type: 'walk-in', address: '' });

    // API call runs in background
    appointmentService.create(createData)
      .then((newAppointment) => {
        if (newAppointment.appointment_date === selectedDate) {
          setAppointments((prev) =>
            [...prev, newAppointment].sort((a, b) =>
              a.appointment_time.localeCompare(b.appointment_time)
            )
          );
        }
      })
      .then(() => {
        toast.success('Appointment added successfully', {
          style: { background: '#10b981', color: '#fff', fontWeight: '500' },
        });
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.detail || 'Failed to add appointment');
      });
  };

  const handleReschedule = async (e: React.FormEvent<any>) => {
    e.preventDefault();
    if (!rescheduleData) return;

    const data = (e as any).formData || formData;
    const updateData: AppointmentUpdate = {
      patient_name: data.patient_name,
      age: data.age ? Number(data.age) : undefined,
      contact_number: data.contact_number || undefined,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      booking_type: data.booking_type as 'walk-in' | 'call',
      address: data.address || undefined,
    };

    const appointmentId = rescheduleData.id;

    // Close modal immediately — don't wait for API
    setShowRescheduleModal(false);
    setRescheduleData(null);

    // API call runs in background
    appointmentService.update(appointmentId, updateData)
      .then((updated) => {
        if (updated.appointment_date === selectedDate) {
          // Update row in-place and re-sort by time
          setAppointments((prev) =>
            prev
              .map((a) => (a.id === updated.id ? updated : a))
              .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
          );
        } else {
          // Date changed to a different day — remove from current view
          setAppointments((prev) => prev.filter((a) => a.id !== updated.id));
        }
        toast.success('Appointment rescheduled successfully', {
          style: { background: '#10b981', color: '#fff', fontWeight: '500' },
        });
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.detail || 'Failed to reschedule');
      });
  };


  const resetForm = () => ({
    patient_name: '', age: '', contact_number: '', appointment_date: new Date().toISOString().split('T')[0], appointment_time: new Date().toTimeString().slice(0, 5), booking_type: 'walk-in', address: '',
  });

  const AppointmentForm = ({ onSubmit, submitLabel, initialData }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string; initialData?: typeof formData }) => {
    const [data, setData] = useState(initialData || resetForm());
    const [contactError, setContactError] = useState('');

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, ''); // digits only
      setData({ ...data, contact_number: val });
      if (val.length === 0) {
        setContactError('Contact number is required');
      } else if (val.length < 10) {
        setContactError('Contact Number must be 10 digits');
      } else {
        setContactError('');
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (data.contact_number.length !== 10) {
        setContactError('Contact number must be exactly 10 digits');
        return;
      }
      setFormData(data);
      const syntheticEvent = {
        ...e,
        preventDefault: () => e.preventDefault(),
        formData: data,
      } as any;
      onSubmit(syntheticEvent);
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
          <div>
            <FormInput label="Patient Name" value={data.patient_name} onChange={(e) => setData({ ...data, patient_name: e.target.value })} required placeholder="Enter patient name" maxLength={100} />
          </div>
          <div>
            <FormInput label="Age" value={data.age} onChange={(e) => setData({ ...data, age: e.target.value })} type="number" min="0" max="150" placeholder="Enter age" required />
          </div>
          <div>
            <div>
              <FormInput
                label="Contact Number"
                value={data.contact_number}
                onChange={handleContactChange}
                required
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit number"
              />
              {contactError && (
                <p className="mt-1 text-xs font-medium text-red-500">{contactError}</p>
              )}
              {!contactError && data.contact_number.length === 10 && (
                <p className="mt-1 text-xs font-medium text-emerald-500">✓ Valid</p>
              )}
            </div>
          </div>
          <div>
            <FormInput label="Date" value={data.appointment_date} onChange={(e) => setData({ ...data, appointment_date: e.target.value })} type="date" required min={today} />
          </div>
          <div>
            <FormInput label="Time" value={data.appointment_time} onChange={(e) => setData({ ...data, appointment_time: e.target.value })} type="time" required />
          </div>
          <div>
            <FormSelect label="Booking Type" value={data.booking_type} onChange={(e) => setData({ ...data, booking_type: e.target.value })} options={[{ value: 'walk-in', label: 'Walk-in' }, { value: 'call', label: 'On Call' }]} required />
          </div>
          <div className="md:col-span-2">
            <FormInput label="Address" value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} placeholder="Enter address" maxLength={250} />
          </div>
        </div>
        <div className="flex justify-center gap-3 pt-6 border-t border-slate-200 mt-6">
          <Button type="submit" className="px-6 py-2">{submitLabel}</Button>
        </div>

      </form>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="w-full sm:max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or number..." />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white shadow-sm px-4 py-2 rounded-full font-semibold text-sm">
            Appointments count: <span className="text-primary-600 font-bold">{activeCount}</span>
          </div>
          <Button onClick={() => setShowAddModal(true)} icon={<BiPlusCircle />}>
            Add Appointment
          </Button>
        </div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <h4 className="font-bold text-primary-600">Appointments</h4>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: '150px' }}
            className="border-2 border-slate-200 rounded-[10px] px-3 py-2 text-sm bg-white text-slate-700 cursor-pointer font-medium outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all duration-300"
          />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : appointments.length === 0 ? (
            <EmptyState message={`No appointments found for ${selectedDate}`} />
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
                          onClick={() => handleAddPatient(apt)}
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

      {/* Confirm Add Patient Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => {
        setShowConfirmModal(false);
        setAppointmentToConfirm(null);
      }} title="Confirm Add Patient">
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to add <span className="font-semibold">{appointmentToConfirm?.patient_name}</span> to the patient table?
          </p>
          <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
            <li>This appointment will be marked as completed</li>
            <li>A new patient record will be created</li>
          </ul>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setAppointmentToConfirm(null);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAddPatient}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-all"
            >
              Yes, Add Patient
            </button>
          </div>
        </div>
      </Modal>

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
    </div>
  );
}
