'use client';

import { useState, useEffect, useCallback } from 'react';
import KPICard from '@/components/ui/KPICard';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportService } from '@/lib/services/reports';
import { patientService } from '@/lib/services/patients';
import { Patient, KPIResponse, PatientTrendResponse, ExpenseComparisonResponse } from '@/types';

export default function ReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [kpi, setKpi] = useState<KPIResponse>({ total_patients: 0, paid: 0, partial: 0, pending: 0, today_patients: 0 });
  const [patientTrend, setPatientTrend] = useState<PatientTrendResponse[]>([]);
  const [expenseComparison, setExpenseComparison] = useState<ExpenseComparisonResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiData, trendData, expenseData, patientsData] = await Promise.all([
        reportService.getKPI(),
        reportService.getPatientTrend(),
        reportService.getExpenseComparison(),
        patientService.getAll({ search: search || undefined, payment_status: paymentFilter !== 'all' ? paymentFilter : undefined }),
      ]);
      setKpi(kpiData);
      setPatientTrend(trendData);
      setExpenseComparison(expenseData);
      setPatients(patientsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [search, paymentFilter]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard
          title="Total Patients"
          subtitle="Patients registered"
          value={kpi.total_patients}
          icon={<span>👥</span>}
          bgClass="bg-indigo-50"
          iconBgClass="bg-indigo-600"
          textClass="text-indigo-800"
          filter={
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border border-indigo-300 rounded-lg px-2 py-1 text-sm bg-white text-indigo-700">
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
          }
        />
        <KPICard
          title="Payment Status"
          subtitle="Patients"
          value={kpi.paid}
          icon={<span>💳</span>}
          bgClass="bg-emerald-50"
          iconBgClass="bg-emerald-600"
          textClass="text-emerald-800"
          filter={
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="border border-emerald-300 rounded-lg px-2 py-1 text-sm bg-white text-emerald-700">
              <option value="all">All</option>
              <option value="paid">Paid ({kpi.paid})</option>
              <option value="partial">Partial ({kpi.partial})</option>
              <option value="pending">Pending ({kpi.pending})</option>
            </select>
          }
        />
        <KPICard
          title="Today's Patients"
          subtitle="Patients visited"
          value={kpi.today_patients}
          icon={<span>📅</span>}
          bgClass="bg-purple-50"
          iconBgClass="bg-purple-600"
          textClass="text-purple-800"
          filter={
            <input type="date" defaultValue={today} className="border border-purple-300 rounded-lg px-2 py-1 text-sm bg-white text-purple-700" />
          }
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h5 className="font-bold text-slate-800 mb-4">Patient Trend</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={patientTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="patients" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h5 className="font-bold text-slate-800 mb-4">Expense Comparison</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={expenseComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="expenses" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Patient Payment Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b-2 border-slate-100">
          <h5 className="font-bold text-slate-800">Patient Payment Details</h5>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by Patient ID or Name..." className="max-w-[300px]" />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3">Loading reports...</span>
            </div>
          ) : patients.length === 0 ? (
            <EmptyState message="No patients found" />
          ) : (
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold text-primary-500">{p.patient_uid}</td>
                    <td>{p.name}</td>
                    <td>{p.contact_number}</td>
                    <td>₹{p.total_amount.toLocaleString()}</td>
                    <td><StatusBadge status={p.payment_status} /></td>
                    <td>₹{p.payment_pending.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
