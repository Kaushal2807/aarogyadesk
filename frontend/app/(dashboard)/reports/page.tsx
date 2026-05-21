'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import FormSelect from '@/components/forms/FormSelect';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { patientService } from '@/lib/services/patients';
import { Patient } from '@/types';

const PIE_COLORS = ['#ef4444', '#10b981'];
const ITEMS_PER_PAGE = 20;
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Current date
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  // Filter states
  const [chartFilterMonth, setChartFilterMonth] = useState(currentMonth);
  const [chartFilterYear, setChartFilterYear] = useState(currentYear);
  const [tableFilterMonth, setTableFilterMonth] = useState(currentMonth);
  const [tableFilterYear, setTableFilterYear] = useState(currentYear);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('none');

  // Generate year options for past 3 years
  const yearOptions = Array.from({ length: 3 }, (_, i) => {
    const year = currentYear - i;
    return { value: String(year), label: String(year) };
  });

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: monthNames[i]
  }));

  const paymentStatusOptions = [
    { value: 'none', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' }
  ];

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const patientsData = await patientService.getAll();
      setPatients(patientsData);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Calculate patient trend (count by month)
  const patientTrendData = useMemo(() => {
    const monthMap: Record<number, number> = {};
    patients.forEach(p => {
      if (p.date_of_visit) {
        const date = new Date(p.date_of_visit);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        if (year === chartFilterYear) {
          monthMap[month] = (monthMap[month] || 0) + 1;
        }
      }
    });
    return Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      count: monthMap[i + 1] || 0,
    }));
  }, [patients, chartFilterYear]);

  // Calculate payment status distribution
  const paymentStatusData = useMemo(() => {
    const statusCounts = { pending: 0, paid: 0 };
    patients.forEach(p => {
      if (p.date_of_visit) {
        const date = new Date(p.date_of_visit);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        if (month === chartFilterMonth && year === chartFilterYear) {
          if (p.payment_status === 'pending') statusCounts.pending += 1;
          else if (p.payment_status === 'paid') statusCounts.paid += 1;
        }
      }
    });
    return [
      { name: 'Pending', value: statusCounts.pending },
      { name: 'Paid', value: statusCounts.paid }
    ];
  }, [patients, chartFilterMonth, chartFilterYear]);

  // Filtered table data
  const filteredPatients = useMemo(() => {
    let filtered = [...patients];
    
    // Apply date filter
    filtered = filtered.filter(p => {
      if (!p.date_of_visit) return false;
      const date = new Date(p.date_of_visit);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return month === tableFilterMonth && year === tableFilterYear;
    });

    // Apply payment status filter
    if (paymentStatusFilter !== 'none') {
      filtered = filtered.filter(p => p.payment_status === paymentStatusFilter);
    }

    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date_of_visit || '').getTime() - new Date(a.date_of_visit || '').getTime());
  }, [patients, tableFilterMonth, tableFilterYear, paymentStatusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // Count badge
  const filteredCount = filteredPatients.filter(p => 
    paymentStatusFilter !== 'none' ? p.payment_status === paymentStatusFilter : true
  ).length;

  const getPaginationDisplay = () => {
    if (filteredPatients.length === 0) return '';
    return `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredPatients.length)} of ${filteredPatients.length} patients`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {/* Charts - Row 1: Patient Trend and Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Patient Trend Chart */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-bold text-slate-800">Patient Trend</h5>
            <FormSelect 
              value={String(chartFilterYear)} 
              onChange={(e) => setChartFilterYear(Number(e.target.value))} 
              options={yearOptions}
              className="w-32"
            />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={patientTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Chart */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-bold text-slate-800">Payment Status</h5>
            <div className="flex gap-2">
              <FormSelect 
                value={String(chartFilterMonth)} 
                onChange={(e) => setChartFilterMonth(Number(e.target.value))} 
                options={monthOptions}
                className="w-32"
              />
              <FormSelect 
                value={String(chartFilterYear)} 
                onChange={(e) => setChartFilterYear(Number(e.target.value))} 
                options={yearOptions}
                className="w-32"
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={paymentStatusData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={70}>
                {paymentStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend layout="vertical" align="right" verticalAlign="middle" />
              <Tooltip formatter={(value) => `${value} patients`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b-2 border-slate-100">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-slate-800 text-lg">Patients Report</h5>
              {paymentStatusFilter !== 'none' && (
                <Badge variant="primary" className="text-sm">
                  {paymentStatusFilter.charAt(0).toUpperCase() + paymentStatusFilter.slice(1)}: {filteredCount}
                </Badge>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-end justify-between gap-3">
              <FormSelect 
                value={String(tableFilterMonth)} 
                onChange={(e) => { setTableFilterMonth(Number(e.target.value)); setCurrentPage(1); }} 
                options={monthOptions}
                className="w-32"
              />
              <FormSelect 
                value={String(tableFilterYear)} 
                onChange={(e) => { setTableFilterYear(Number(e.target.value)); setCurrentPage(1); }} 
                options={yearOptions}
                className="w-32"
              />
              <FormSelect 
                value={paymentStatusFilter} 
                onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(1); }} 
                options={paymentStatusOptions}
                className="w-40"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3">Loading reports...</span>
            </div>
          ) : filteredPatients.length === 0 ? (
            <EmptyState message="No patients found for the selected filters" />
          ) : (
            <>
              <table className="cms-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Patient ID</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Phone Number</th>
                    <th className="text-left">Date of Visit</th>
                    <th className="text-center">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-primary-500">{p.patient_uid}</td>
                      <td className="py-3">{p.name}</td>
                      <td className="py-3">{p.contact_number || '-'}</td>
                      <td className="py-3">{p.date_of_visit || '-'}</td>
                      <td className="py-3 text-center">
                        <StatusBadge status={p.payment_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                  <span className="text-sm text-slate-600">{getPaginationDisplay()}</span>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <BiChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-primary-500 text-white'
                                : 'border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <BiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
