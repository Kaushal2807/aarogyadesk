'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import TableSkeleton from '@/components/ui/TableSkeleton';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import FormSelect from '@/components/forms/FormSelect';
import SearchableSelect from '@/components/forms/SearchableSelect';
import EmptyState from '@/components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { expenseService } from '@/lib/services/expenses';
import { Expense, ExpenseCategory } from '@/types';
import { toast } from 'react-hot-toast';

const PIE_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6'];
const ITEMS_PER_PAGE = 20;

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Current date
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  // Filter states
  const [trendYear, setTrendYear] = useState(currentYear);
  const [paymentFilterMonth, setPaymentFilterMonth] = useState(currentMonth);
  const [paymentFilterYear, setPaymentFilterYear] = useState(currentYear);
  const [categoryFilterMonth, setCategoryFilterMonth] = useState(currentMonth);
  const [categoryFilterYear, setCategoryFilterYear] = useState(currentYear);
  const [tableFilterMonth, setTableFilterMonth] = useState(currentMonth);
  const [tableFilterYear, setTableFilterYear] = useState(currentYear);
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);

  const [newCategory, setNewCategory] = useState('');

  const defaultFormState = {
    category_id: '',
    title: '',
    description: '',
    amount: '',
    payment_mode: 'Cash',
    expense_date: new Date().toISOString().split('T')[0],
  };

  const [addForm, setAddForm] = useState(defaultFormState);
  const [editForm, setEditForm] = useState(defaultFormState);

  const paymentModes = [
    { value: 'Cash', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Cheque', label: 'Cheque' }
  ];

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [expData, catData] = await Promise.all([
        expenseService.getAll(),
        expenseService.getCategories()
      ]);
      setExpenses(expData);
      setCategories(catData);
      setCurrentPage(1);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived selected expense
  const selectedExpense = editingExpenseId
    ? expenses.find(e => e.id === editingExpenseId)
    : null;

  // Filtered data for trend chart (by year)
  const monthlyExpenses = useMemo(() => {
    const monthMap: Record<number, number> = {};
    expenses
      .filter(e => e.expense_year === trendYear && e.expense_month != null)
      .forEach(e => {
        monthMap[e.expense_month!] = (monthMap[e.expense_month!] || 0) + e.amount;
      });
    return Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      expenses: monthMap[i + 1] || 0,
    }));
  }, [expenses, trendYear]);

  // Filtered data for payment mode (by month/year)
  const paymentModeData = useMemo(() => {
    const modes: Record<string, number> = {};
    expenses
      .filter(e => e.expense_month === paymentFilterMonth && e.expense_year === paymentFilterYear)
      .forEach(e => { modes[e.payment_mode] = (modes[e.payment_mode] || 0) + e.amount; });
    return Object.entries(modes).map(([name, value]) => ({ name, value }));
  }, [expenses, paymentFilterMonth, paymentFilterYear]);

  // Filtered data for category wise (by month/year)
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses
      .filter(e => e.expense_month === categoryFilterMonth && e.expense_year === categoryFilterYear)
      .forEach(e => { const cat = e.category_name || 'Other'; cats[cat] = (cats[cat] || 0) + e.amount; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [expenses, categoryFilterMonth, categoryFilterYear]);

  // Pagination with search and table filters
  const sortedExpenses = useMemo(() => {
    let filtered = [...expenses]
      .filter(e => e.expense_month === tableFilterMonth && e.expense_year === tableFilterYear)
      .sort((a, b) => new Date(b.expense_date ?? '').getTime() - new Date(a.expense_date ?? '').getTime() || b.id - a.id);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        (e.title?.toLowerCase().includes(query)) ||
        (e.category_name?.toLowerCase().includes(query)) ||
        (e.description?.toLowerCase().includes(query)) ||
        (e.payment_mode?.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [expenses, tableFilterMonth, tableFilterYear, searchQuery]);
  
  const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedExpenses = sortedExpenses.slice(startIndex, endIndex);

  const handleCreateCategoryInline = async (newCatName: string) => {
    try {
      const cat = await expenseService.createCategory({ category_name: newCatName });
      setCategories(prev => [...prev, cat]);
      toast.success('✓ Category created successfully', { style: { background: '#10b981', color: '#fff', fontWeight: '500' } });
      return { value: String(cat.id), label: cat.category_name };
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create category");
      return undefined;
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await expenseService.createCategory({ category_name: newCategory });
      toast.success('✓ Category added successfully', { style: { background: '#10b981', color: '#fff', fontWeight: '500' } });
      setShowAddCategory(false);
      setNewCategory('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add category');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedDate = new Date(addForm.expense_date);
      const data = {
        category_id: addForm.category_id ? Number(addForm.category_id) : undefined,
        expense_month: parsedDate.getMonth() + 1,
        expense_year: parsedDate.getFullYear(),
        title: addForm.title,
        description: addForm.description || undefined,
        amount: Number(addForm.amount),
        payment_mode: addForm.payment_mode as 'Cash' | 'UPI' | 'Cheque',
        expense_date: addForm.expense_date || undefined,
      };
      const created = await expenseService.create(data);
      
      // Provide category name optimistic map
      if (data.category_id) {
        const cat = categories.find(c => c.id === data.category_id);
        if (cat) created.category_name = cat.category_name;
      }
      
      setExpenses(prev => [created, ...prev]);
      setShowAddExpense(false);
      setAddForm(defaultFormState);
      
      toast.success('✓ Expense added successfully', {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add expense');
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditForm({
      category_id: expense.category_id ? String(expense.category_id) : '',
      title: expense.title,
      description: expense.description || '',
      amount: String(expense.amount),
      payment_mode: expense.payment_mode,
      expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
    });
    setShowEditExpense(true);
  };

  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpenseId || !selectedExpense) return;
    
    try {
      const parsedDate = new Date(editForm.expense_date);
      const updated = await expenseService.update(editingExpenseId, {
        category_id: editForm.category_id ? Number(editForm.category_id) : undefined,
        expense_month: parsedDate.getMonth() + 1,
        expense_year: parsedDate.getFullYear(),
        title: editForm.title,
        description: editForm.description || undefined,
        amount: Number(editForm.amount),
        payment_mode: editForm.payment_mode as 'Cash' | 'UPI' | 'Cheque',
        expense_date: editForm.expense_date || undefined,
      });
      
      if (updated.category_id) {
        const cat = categories.find(c => c.id === updated.category_id);
        if (cat) updated.category_name = cat.category_name;
      }

      setExpenses(prev => prev.map(exp => exp.id === editingExpenseId ? updated : exp));
      setShowEditExpense(false);
      setEditingExpenseId(null);
      
      toast.success('✓ Expense updated successfully', {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to edit expense');
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      await expenseService.delete(expenseToDelete);
      setExpenses(prev => prev.filter(e => e.id !== expenseToDelete));
      setShowDeleteConfirm(false);
      setExpenseToDelete(null);
      toast.success('✓ Expense deleted successfully', {
        duration: 3000,
        style: { background: '#10b981', color: '#fff', fontWeight: '500' }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete expense');
    }
  };

  const getPaginationDisplay = () => {
    if (sortedExpenses.length === 0) return '';
    return `Showing ${startIndex + 1} to ${Math.min(endIndex, sortedExpenses.length)} of ${sortedExpenses.length} expenses`;
  };

  return (
    <div className="h-full overflow-y-auto">
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4">


      {/* Charts - Row 1: Expense Trend and Payment Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Expense Trend Chart */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-bold text-slate-800">Expense Trend</h5>
            <FormSelect 
              value={String(trendYear)} 
              onChange={(e) => setTrendYear(Number(e.target.value))} 
              options={yearOptions}
              className="w-32"
            />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={50} />
              <Tooltip />
              <Bar dataKey="expenses" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Mode Chart */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-bold text-slate-800">Payment Mode</h5>
            <div className="flex gap-2">
              <FormSelect 
                value={String(paymentFilterMonth)} 
                onChange={(e) => setPaymentFilterMonth(Number(e.target.value))} 
                options={monthOptions}
                className="w-32"
              />
              <FormSelect 
                value={String(paymentFilterYear)} 
                onChange={(e) => setPaymentFilterYear(Number(e.target.value))} 
                options={yearOptions}
                className="w-32"
              />
            </div>
          </div>
          {paymentModeData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm font-medium">
              No expenses for selected month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie 
                  data={paymentModeData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="40%" 
                  cy="50%" 
                  outerRadius={75}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
                    if (!value || !percent || percent < 0.03 || cx === undefined || cy === undefined || midAngle === undefined || innerRadius === undefined || outerRadius === undefined) return null;
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold drop-shadow-sm">
                        {`₹${Number(value).toLocaleString()}`}
                      </text>
                    );
                  }}
                >
                  {paymentModeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts - Row 2: Category-wise Chart */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-bold text-slate-800">Category-wise</h5>
            <div className="flex gap-2">
              <FormSelect 
                value={String(categoryFilterMonth)} 
                onChange={(e) => setCategoryFilterMonth(Number(e.target.value))} 
                options={monthOptions}
                className="w-32"
              />
              <FormSelect 
                value={String(categoryFilterYear)} 
                onChange={(e) => setCategoryFilterYear(Number(e.target.value))} 
                options={yearOptions}
                className="w-32"
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} width={50} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b-2 border-slate-100">
          <div className="flex flex-col gap-4">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h5 className="font-bold text-slate-800 text-lg">Manage Expenses</h5>
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowAddExpense(true)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}>Add Expense</Button>
                <Button onClick={() => setShowAddCategory(true)} variant="outline-primary" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}>Add Category</Button>
              </div>
            </div>
            
            {/* Filters and Search Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left: Search Field */}
              <input 
                type="text" 
                placeholder="Search by title, category..." 
                value={searchQuery} 
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="flex-1 max-w-xs outline-none text-sm border-b border-slate-200 py-1 text-slate-700 placeholder-slate-400 bg-transparent focus:border-primary-400 transition-colors"
              />
              
              {/* Right: Month + Year Filters */}
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : sortedExpenses.length === 0 ? (
            <EmptyState message="No expenses found for the selected filters" />
          ) : (
            <>
              <table className="cms-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Category</th>
                    <th className="text-left">Title</th>
                    <th className="text-center">Payment Mode</th>
                    <th className="text-right">Amount</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-3 font-medium text-slate-700 whitespace-nowrap">{e.expense_date || '-'}</td>
                      <td className="py-3">
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                          {e.category_name || '-'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-slate-800">{e.title || '-'}</td>
                      <td className="py-3 text-center">
                        <Badge variant={e.payment_mode === 'Cash' ? 'success' : 'info'}>{e.payment_mode}</Badge>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-800">
                        ₹{e.amount.toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(e)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Expense"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button 
                            onClick={() => { setExpenseToDelete(e.id); setShowDeleteConfirm(true); }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Expense"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </div>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} title="Add Expense" size="md">
        <form onSubmit={handleAddExpense}>
          <div className="space-y-4 py-4">
            <SearchableSelect
              label="Expense Category *"
              value={addForm.category_id}
              onChange={(val) => setAddForm({ ...addForm, category_id: String(val) })}
              options={categories.map(c => ({ value: String(c.id), label: c.category_name }))}
              placeholder="Search or Select Category..."
              required
              searchable={true}
              maxDisplay={5}
              onCreateNew={handleCreateCategoryInline}
            />
            
            <FormInput 
              label="Expense Title" 
              value={addForm.title} 
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} 
              placeholder="e.g. Electricity Bill, Clinic Supplies" 
            />
            
            <FormTextarea 
              label="Description (Optional)" 
              value={addForm.description} 
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} 
              rows={3} 
              placeholder="Any additional details..." 
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Amount (₹) *" 
                type="number" 
                step="0.01" 
                value={addForm.amount} 
                onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })} 
                placeholder="0.00" 
                required 
              />
              <FormInput 
                label="Date *" 
                type="date" 
                value={addForm.expense_date} 
                onChange={(e) => setAddForm({ ...addForm, expense_date: e.target.value })} 
                required 
              />
            </div>
            
            <FormSelect 
              label="Payment Mode *" 
              value={addForm.payment_mode} 
              onChange={(e) => setAddForm({ ...addForm, payment_mode: e.target.value as 'Cash' | 'UPI' | 'Cheque' })} 
              options={paymentModes}
              required 
            />
          </div>
          <div className="flex justify-center pt-5 border-t border-slate-200">
            <Button type="submit" size="lg" className="w-full sm:w-auto px-8">Save Expense</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal isOpen={showEditExpense} onClose={() => { setShowEditExpense(false); setEditingExpenseId(null); }} title="Edit Expense" size="md">
        {selectedExpense ? (
          <form onSubmit={handleEditExpense}>
            <div className="space-y-4 py-4">
              <SearchableSelect
                label="Expense Category *"
                value={editForm.category_id}
                onChange={(val) => setEditForm({ ...editForm, category_id: String(val) })}
                options={categories.map(c => ({ value: String(c.id), label: c.category_name }))}
                placeholder="Search or Select Category..."
                required
                searchable={true}
                maxDisplay={5}
                onCreateNew={handleCreateCategoryInline}
              />
              
              <FormInput 
                label="Expense Title" 
                value={editForm.title} 
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} 
                placeholder="e.g. Electricity Bill, Clinic Supplies" 
              />
              
              <FormTextarea 
                label="Description (Optional)" 
                value={editForm.description} 
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                rows={3} 
                placeholder="Any additional details..." 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                  label="Amount (₹) *" 
                  type="number" 
                  step="0.01" 
                  value={editForm.amount} 
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} 
                  placeholder="0.00" 
                  required 
                />
                <FormInput 
                  label="Date *" 
                  type="date" 
                  value={editForm.expense_date} 
                  onChange={(e) => setEditForm({ ...editForm, expense_date: e.target.value })} 
                  required 
                />
              </div>
              
              <FormSelect 
                label="Payment Mode *" 
                value={editForm.payment_mode} 
                onChange={(e) => setEditForm({ ...editForm, payment_mode: e.target.value as 'Cash' | 'UPI' | 'Cheque' })} 
                options={paymentModes}
                required 
              />
            </div>
            <div className="flex justify-center pt-5 border-t border-slate-200">
              <Button type="submit" size="lg" className="w-full sm:w-auto px-8">Update Expense</Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500">Loading expense details...</p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setExpenseToDelete(null); }} title="Confirm Delete" size="sm">
        <div className="py-4">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Expense?</h3>
            <p className="text-slate-500 text-sm">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline-secondary" onClick={() => { setShowDeleteConfirm(false); setExpenseToDelete(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteExpense}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Category Modal (Standalone) */}
      <Modal isOpen={showAddCategory} onClose={() => setShowAddCategory(false)} title="Add Category" size="sm">
        <form onSubmit={handleAddCategory}>
          <div className="py-2 space-y-4">
            <FormInput 
              label="Category Name *" 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)} 
              required 
              placeholder="e.g. Infrastructure, Equipment" 
            />
          </div>
          <div className="flex justify-center pt-4 border-t border-slate-100 mt-4">
            <Button type="submit" className="w-full">Save Category</Button>
          </div>
        </form>
      </Modal>
    </div>
    </div>
  );
}
