import React, { useState, useMemo } from 'react';
import { FinancialStats, Entry, YearRecord } from '../types';
import StatCard from '../components/StatCard';
import { storageService } from '../services/storageService';
import { TrendingUp, TrendingDown, Wallet, Calendar, ChevronRight, Lock, ShieldCheck, Image as ImageIcon, X, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HomeViewProps {
  stats: FinancialStats;
  entries: Entry[];
  years: YearRecord[];
  selectedYearId: string;
  setSelectedYearId: (id: string) => void;
  isAdmin: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ stats, entries, years, selectedYearId, setSelectedYearId, isAdmin }) => {
  const [showExpenses, setShowExpenses] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [collectionPassword, setCollectionPassword] = useState('');
  const [isCollectionUnlocked, setIsCollectionUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const effectiveUnlocked = useMemo(() => isAdmin || isCollectionUnlocked, [isAdmin, isCollectionUnlocked]);

  const expenses = useMemo(() => entries.filter(e => e.type === 'expense').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [entries]);
  const collections = useMemo(() => entries.filter(e => e.type === 'collection').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [entries]);

  const handleUnlockCollections = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setPasswordError(false);

    const result = await storageService.verifyCollectionKey(collectionPassword);

    if (result.success) {
      setIsCollectionUnlocked(true);
      setCollectionPassword('');
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 3000);
    }
    setIsVerifying(false);
  };

  const chartData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const month = i;
    const monthEntries = entries.filter(e => new Date(e.date).getMonth() === month);
    return {
      name: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(2024, i)),
      collected: monthEntries.filter(e => e.type === 'collection').reduce((sum, e) => sum + e.amount, 0),
      spent: monthEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0),
    };
  }), [entries]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Summary</h1>
          <p className="text-slate-500 font-medium">Transparency and trust in every transaction</p>
        </div>
        <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/40 shadow-sm">
          <Calendar className="w-4 h-4 ml-3 text-indigo-500" />
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold py-2 px-3 focus:ring-0 cursor-pointer"
          >
            {years.map(y => (
              <option key={y.id} value={y.id}>Fiscal Year {y.id} {y.isClosed ? '🔒' : ''}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Collection" value={stats.totalCollection} color="emerald" icon={<TrendingUp className="w-6 h-6" />} />
        <StatCard label="Total Expenses" value={stats.totalExpense} color="rose" icon={<TrendingDown className="w-6 h-6" />} />
        <StatCard label="Current Balance" value={stats.currentBalance} color="indigo" icon={<Wallet className="w-6 h-6" />} />
      </div>

      <div className="glass-card p-6 rounded-[2rem] shadow-xl">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center">
          <div className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></div>
          Monthly Performance
        </h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)' }}
              />
              <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorColl)" name="Collection" />
              <Area type="monotone" dataKey="spent" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-[2rem] shadow-xl space-y-6 relative overflow-hidden">
          {isAdmin && (
            <div className="absolute top-4 right-4 animate-bounce">
              <span className="flex items-center text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full shadow-lg shadow-indigo-200">
                <ShieldCheck className="w-3 h-3 mr-1" /> ADMIN BYPASS ACTIVE
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Collection Ledger</h3>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed">Secured ledger of contributions. Authorized access required to view donor names and amounts.</p>

          {!effectiveUnlocked ? (
            <form onSubmit={handleUnlockCollections} className="space-y-4 pt-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  disabled={isVerifying}
                  placeholder="Enter authorized passkey..."
                  className={`w-full pl-12 pr-4 py-3.5 bg-white/50 border rounded-2xl outline-none transition-all font-bold text-sm ${passwordError ? 'border-rose-400 ring-4 ring-rose-100' : 'border-slate-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white'}`}
                  value={collectionPassword}
                  onChange={(e) => setCollectionPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isVerifying ? <Activity className="w-5 h-5 animate-spin mr-2" /> : null}
                <span>{isVerifying ? 'Verifying...' : 'Access Secure Records'}</span>
                {!isVerifying && <ChevronRight className="w-5 h-5" />}
              </button>
              {passwordError && <p className="text-center text-xs text-rose-500 font-bold uppercase tracking-widest animate-bounce">Passkey Verification Failed</p>}
            </form>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => setShowCollections(!showCollections)}
                className="w-full py-4 bg-emerald-50/50 text-emerald-700 rounded-2xl font-black border-2 border-emerald-100 flex items-center justify-center hover:bg-emerald-100/50 transition-all active:scale-95"
              >
                {showCollections ? 'Hide Ledger' : 'View Authorized Ledger'}
                <ChevronRight className={`w-5 h-5 ml-2 transition-transform ${showCollections ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}

          {effectiveUnlocked && showCollections && (
            <div className="mt-6 border-t border-slate-100 pt-6 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] sticky top-0 rounded-lg">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Contributor</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {collections.length > 0 ? collections.map(c => (
                    <tr key={c.id} className="group transition-colors text-sm">
                      <td className="px-4 py-4 text-slate-500 font-medium">
                        {new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700 group-hover:text-indigo-600">{c.title}</td>
                      <td className="px-4 py-4 text-right font-black text-emerald-600">
                        +${c.amount.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 font-bold italic">No collection records.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass-card p-8 rounded-[2rem] shadow-xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-rose-500/10 p-3 rounded-2xl text-rose-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Expense Details</h3>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed">Public record of fund utilization. Full transparency on every dollar spent for the community.</p>
          <div className="pt-2">
            <button
              onClick={() => setShowExpenses(!showExpenses)}
              className="w-full py-4 bg-rose-50/50 text-rose-700 rounded-2xl font-black border-2 border-rose-100 flex items-center justify-center hover:bg-rose-100/50 transition-all active:scale-95"
            >
              {showExpenses ? 'Close Records' : 'View Records'}
              <ChevronRight className={`w-5 h-5 ml-2 transition-transform ${showExpenses ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showExpenses && (
            <div className="mt-6 border-t border-slate-100 pt-6 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Item & Proof</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expenses.length > 0 ? expenses.map(e => (
                    <tr key={e.id} className="group transition-colors text-sm">
                      <td className="px-4 py-4 text-slate-500 font-medium">
                        {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          {e.receiptImage ? (
                            <div
                              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all shadow-sm"
                              onClick={() => setViewingImage(e.receiptImage!)}
                            >
                              <img src={e.receiptImage} className="w-full h-full object-cover" alt="Proof" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 group-hover:text-rose-600 line-clamp-1">{e.title}</span>
                            {e.receiptImage && (
                              <button
                                onClick={() => setViewingImage(e.receiptImage!)}
                                className="text-[10px] text-rose-600 font-black uppercase tracking-wider hover:underline text-left"
                              >
                                View Proof
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-black text-rose-600">
                        -${e.amount.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 font-bold italic">No expense records.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing images */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingImage(null)} className="absolute -top-12 right-0 p-2 bg-white/10 text-white rounded-full hover:bg-white/20">
              <X className="w-6 h-6" />
            </button>
            <img src={viewingImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/20" alt="Full size" />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
