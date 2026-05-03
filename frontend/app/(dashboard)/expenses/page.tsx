'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import FormSelect from '@/components/forms/FormSelect';
import EmptyState from '@/components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { expenseService } from '@/lib/services/expenses';
import { Expense, ExpenseCategory, ExpenseCreate } from '@/types';

const PIE_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    category_id: '', expense_month: String(new Date().getMonth() + 1), expense_year: String(new Date().getFullYear()),
    title: '', description: '', amount: '', payment_mode: 'Cash', expense_date: new Date().toISOString().split('T')[0],
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [expData, catData] = await Promise.all([expenseService.getAll(), expenseService.getCategories()]);
      setExpenses(expData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthlyExpenses = useMemo(() => {
    const monthMap: Record<number, number> = {};
    expenses.forEach(e => {
      if (e.expense_month != null) {
        monthMap[e.expense_month] = (monthMap[e.expense_month] || 0) + e.amount;
      }
    });
    return Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      expenses: monthMap[i + 1] || 0,
    }));
  }, [expenses]);

  const paymentModeData = useMemo(() => {
    const modes: Record<string, number> = {};
    expenses.forEach(e => { modes[e.payment_mode] = (modes[e.payment_mode] || 0) + e.amount; });
    return Object.entries(modes).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => { const cat = e.category_name || 'Other'; cats[cat] = (cats[cat] || 0) + e.amount; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: ExpenseCreate = {
        category_id: expenseForm.category_id ? Number(expenseForm.category_id) : undefined,
        expense_month: Number(expenseForm.expense_month),
        expense_year: Number(expenseForm.expense_year),
        title: expenseForm.title,
        description: expenseForm.description || undefined,
        amount: Number(expenseForm.amount),
        payment_mode: expenseForm.payment_mode as 'Cash' | 'UPI',
        expense_date: expenseForm.expense_date || undefined,
      };
      await expenseService.create(data);
      setShowAddExpense(false);
      setExpenseForm({ category_id: '', expense_month: String(new Date().getMonth() + 1), expense_year: String(new Date().getFullYear()), title: '', description: '', amount: '', payment_mode: 'Cash', expense_date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add expense');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await expenseService.createCategory({ category_name: newCategory });
      setShowAddCategory(false);
      setNewCategory('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add category');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button onClick={() => setShowAddExpense(true)} icon={<BiPlusCircle />}>Add Expense</Button>
        <Button onClick={() => setShowAddCategory(true)} variant="outline-primary" icon={<BiPlusCircle />}>Add Category</Button>
        <a href="/expenses/categories" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all">
          Manage Categories
        </a>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h5 className="font-bold text-slate-800 mb-4">Expense Trend</h5>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="expenses" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h5 className="font-bold text-slate-800 mb-4">Payment Mode</h5>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={paymentModeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}>
                {paymentModeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h5 className="font-bold text-slate-800 mb-4">Category-wise</h5>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b-2 border-slate-100">
          <h5 className="font-bold text-slate-800">Recent Expenses</h5>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3">Loading expenses...</span>
            </div>
          ) : expenses.length === 0 ? (
            <EmptyState message="No expenses recorded" />
          ) : (
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice().reverse().map((e) => (
                  <tr key={e.id}>
                    <td>{e.category_name || '-'}</td>
                    <td>{e.title}</td>
                    <td>{e.expense_month || '-'}/{e.expense_year || '-'}</td>
                    <td className="font-semibold">₹{e.amount.toLocaleString()}</td>
                    <td><Badge variant={e.payment_mode === 'Cash' ? 'success' : 'info'}>{e.payment_mode}</Badge></td>
                    <td>{e.expense_date || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} title="Add Expense" size="lg">
        <form onSubmit={handleAddExpense}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Category"
              value={expenseForm.category_id}
              onChange={(e) => setExpenseForm({ ...expenseForm, category_id: e.target.value })}
              options={categories.map(c => ({ value: String(c.id), label: c.category_name }))}
              placeholder="Select category"
              required
            />
            <FormSelect
              label="Month"
              value={expenseForm.expense_month}
              onChange={(e) => setExpenseForm({ ...expenseForm, expense_month: e.target.value })}
              options={['1','2','3','4','5','6','7','8','9','10','11','12'].map(m => ({ value: m, label: ['January','February','March','April','May','June','July','August','September','October','November','December'][parseInt(m) - 1] }))}
              required
            />
            <FormInput label="Year" type="number" value={expenseForm.expense_year} onChange={(e) => setExpenseForm({ ...expenseForm, expense_year: e.target.value })} required />
            <FormInput label="Title" value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} placeholder="Expense title" required />
            <FormTextarea label="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} rows={2} placeholder="Description..." />
            <FormInput label="Amount (₹)" type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="0.00" required />
            <FormSelect label="Payment Mode" value={expenseForm.payment_mode} onChange={(e) => setExpenseForm({ ...expenseForm, payment_mode: e.target.value })} options={[{ value: 'Cash', label: 'Cash' }, { value: 'UPI', label: 'UPI' }]} required />
            <FormInput label="Date" type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} required />
          </div>
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
            <Button type="submit">Save Expense</Button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={showAddCategory} onClose={() => setShowAddCategory(false)} title="Add Category" size="sm">
        <form onSubmit={handleAddCategory}>
          <FormInput label="Category Name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required placeholder="Enter category name" />
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
            <Button type="submit">Save Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
