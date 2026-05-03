'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BiShow, BiSolidCheckCircle } from 'react-icons/bi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { supportService } from '@/lib/services/support';
import { Support } from '@/types';

export default function AdminSupportPage() {
  const [queries, setQueries] = useState<Support[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewQuery, setViewQuery] = useState<Support | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supportService.getAll();
      setQueries(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load support queries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const filtered = useMemo(() => {
    let result = queries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.subject.toLowerCase().includes(q) ||
        (s.clinic_name || '').toLowerCase().includes(q) ||
        s.person_name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(s => {
        const isResolved = s.status !== 0;
        return statusFilter === 'resolved' ? isResolved : !isResolved;
      });
    }
    return result;
  }, [queries, search, statusFilter]);

  const resolveQuery = async (id: number) => {
    try {
      await supportService.resolve(id);
      fetchQueries();
      setViewQuery(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resolve query');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-slate-400">Loading support queries...</p>
        </div>
      </div>
    );
  }

  if (error && queries.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchQueries}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {error && queries.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">{error}</div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h5 className="font-bold text-slate-800 text-lg">Support Queries</h5>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Search queries..." className="max-w-[200px]" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500 bg-white">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState message="No support queries found" />
          ) : (
            <table className="cms-table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Clinic</th>
                  <th>Person</th>
                  <th>Subject</th>
                  <th>Created</th>
                  <th>Resolved</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => {
                  const isResolved = q.status !== 0;
                  return (
                    <tr key={q.id}>
                      <td className="text-slate-400 font-mono text-sm">{q.id}</td>
                      <td>
                        <p className="font-medium text-sm">{q.clinic_name || '--'}</p>
                        <p className="text-xs text-slate-400">{q.email || '--'}</p>
                      </td>
                      <td className="text-sm">{q.person_name}</td>
                      <td className="font-medium">{q.subject}</td>
                      <td className="text-sm text-slate-500">{q.created_at?.split('T')[0]}</td>
                      <td className="text-sm text-slate-500">{q.resolved_at?.split('T')[0] || '--'}</td>
                      <td>
                        <Badge variant={isResolved ? 'success' : 'warning'}>
                          {isResolved ? 'Resolved' : 'Pending'}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setViewQuery(q)} className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all" title="View">
                            <BiShow className="w-4 h-4" />
                          </button>
                          {!isResolved && (
                            <button onClick={() => resolveQuery(q.id)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Resolve">
                              <BiSolidCheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={!!viewQuery} onClose={() => setViewQuery(null)} title="Query Details" size="md">
        {viewQuery && (() => {
          const isResolved = viewQuery.status !== 0;
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Clinic</p>
                  <p className="font-medium text-slate-700 mt-0.5">{viewQuery.clinic_name || '--'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Person</p>
                  <p className="font-medium text-slate-700 mt-0.5">{viewQuery.person_name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-medium text-slate-700 mt-0.5">{viewQuery.email || '--'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="font-medium text-slate-700 mt-0.5">{viewQuery.phone || '--'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Subject</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{viewQuery.subject}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Message</p>
                <p className="text-sm text-slate-700 mt-1 bg-slate-50 rounded-xl p-3">{viewQuery.message}</p>
              </div>
              {!isResolved && (
                <div className="flex justify-center pt-2 border-t border-slate-100">
                  <Button onClick={() => resolveQuery(viewQuery.id)} icon={<BiSolidCheckCircle />}>Mark as Resolved</Button>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
