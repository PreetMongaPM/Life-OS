import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Plus, Download, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Trash2, X } from 'lucide-react';
import Card from '../components/ui/Card';
import { getTransactions, createTransaction, deleteTransaction } from '../api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Housing', 'Entertainment', 'Health', 'Education', 'Salary', 'Freelance', 'Other'];

const INR = (amount) => `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

function buildChartData(transactions) {
  // Group by month
  const map = {};
  transactions.forEach(tx => {
    const d = new Date(tx.date);
    const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    if (!map[key]) map[key] = { name: key, income: 0, expense: 0 };
    if (tx.type === 'income') map[key].income += tx.amount;
    else map[key].expense += tx.amount;
  });
  return Object.values(map).slice(-7); // last 7 months
}

export default function Finances() {
  const [transactions, setTransactions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTx, setNewTx] = useState({ name: '', amount: '', type: 'expense', category: 'Food' });

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.name || !newTx.amount || isNaN(Number(newTx.amount))) return;
    try {
      await createTransaction({ ...newTx, amount: Number(newTx.amount) });
      setIsAdding(false);
      setNewTx({ name: '', amount: '', type: 'expense', category: 'Food' });
      fetchTransactions();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try { await deleteTransaction(id); fetchTransactions(); }
    catch (err) { console.error(err); }
  };

  // Working CSV Report Download
  const handleDownloadReport = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
    const headers = ['Date', 'Name', 'Category', 'Type', 'Amount (INR)'];
    const rows = transactions.map(tx => [
      new Date(tx.date).toLocaleDateString('en-IN'),
      `"${tx.name}"`,
      tx.category || 'Other',
      tx.type,
      tx.amount.toFixed(2),
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeos_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((a, c) => a + c.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((a, c) => a + c.amount, 0);
  const balance = totalIncome - totalExpense;
  const chartData = buildChartData(transactions);

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-emerald-500 text-sm transition-colors";
  const selectCls = "bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-foreground text-sm outline-none focus:border-emerald-500 transition-colors min-w-[120px] cursor-pointer";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Finances</h1>
          <p className="text-text-muted">Track your income, expenses, and savings.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadReport}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Add form */}
      {isAdding && (
        <Card className="bg-glass-bg border-emerald-500/50">
          <form onSubmit={handleAddTransaction} noValidate>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Name</label>
                <input
                  type="text" placeholder="e.g. Zomato order" value={newTx.name}
                  onChange={e => setNewTx({ ...newTx, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="w-36">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
                <input
                  type="number" placeholder="500" min="0" value={newTx.amount}
                  onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Type</label>
                <select value={newTx.type} onChange={e => setNewTx({ ...newTx, type: e.target.value })} className={selectCls}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Category</label>
                <select value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })} className={selectCls}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-400 transition-colors text-sm">
                  Save
                </button>
                <button type="button" onClick={() => { setIsAdding(false); setNewTx({ name: '', amount: '', type: 'expense', category: 'Food' }); }} className="p-2.5 text-text-muted hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/20">
          <div className="p-3 bg-indigo-500/20 rounded-xl w-fit mb-4">
            <DollarSign className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-text-muted text-sm mb-1">Total Balance</p>
          <h2 className={`text-3xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-rose-400'}`}>{INR(balance)}</h2>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20">
          <div className="p-3 bg-emerald-500/20 rounded-xl w-fit mb-4">
            <ArrowUpRight className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-text-muted text-sm mb-1">Total Income</p>
          <h2 className="text-3xl font-bold text-emerald-400">{INR(totalIncome)}</h2>
        </Card>
        <Card className="bg-gradient-to-br from-rose-900/40 to-orange-900/40 border-rose-500/20">
          <div className="p-3 bg-rose-500/20 rounded-xl w-fit mb-4">
            <ArrowDownRight className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-text-muted text-sm mb-1">Total Expenses</p>
          <h2 className="text-3xl font-bold text-rose-400">{INR(totalExpense)}</h2>
        </Card>
      </div>

      {/* Chart + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col bg-glass-bg" style={{ height: '360px' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex-shrink-0">
            Income vs Expenses
          </h2>
          {chartData.length > 0 ? (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(v) => INR(v)}
                  />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981' }} name="Income" />
                  <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: '#f43f5e' }} name="Expense" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
              No data yet — add some transactions!
            </div>
          )}
        </Card>

        <Card className="bg-glass-bg overflow-hidden flex flex-col" style={{ height: '360px' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex-shrink-0">Recent Transactions</h2>
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1">
            {transactions.map(tx => (
              <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-glass-hover-bg border border-transparent hover:border-glass-border transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{tx.name}</p>
                    <p className="text-xs text-text-muted">{tx.category || 'Other'} · {new Date(tx.date).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{INR(tx.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(tx._id)}
                    className="text-text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center text-text-muted text-sm py-10">No transactions yet.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
