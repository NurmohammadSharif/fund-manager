import React, { useState, useRef } from 'react';
import { FinancialStats, Entry, YearRecord, EntryType } from '../types';
import StatCard from '../components/StatCard';
import EntryForm from '../components/EntryForm';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { 
  Plus, Search, Edit2, Trash2, Calendar, 
  TrendingUp, TrendingDown, Wallet, Lock,
  ChevronRight, AlertCircle, FileText,
  Layers, Database, UploadCloud, ShieldCheck, Key, Save, Settings, Trash,
  Eraser, Image as ImageIcon, X, Sparkles, BrainCircuit, Activity, Globe
} from 'lucide-react';

interface AdminDashboardProps {
  stats: FinancialStats;
  entries: Entry[];
  years: YearRecord[];
  selectedYearId: string;
  setSelectedYearId: (id: string) => void;
  addEntry: (entry: Omit<Entry, 'id'>) => void;
  updateEntry: (entry: Entry) => void;
  deleteEntry: (id: string) => void;
  closeYear: (yearId: string) => void;
  createNextYear: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  stats, entries, years, selectedYearId, setSelectedYearId,
  addEntry, updateEntry, deleteEntry, closeYear, createNextYear,
  onExport, onImport
}) => {
  const [activeTab, setActiveTab] = useState<EntryType | 'settings'>('collection');
  const [showForm, setShowForm] = useState<{ type: EntryType; entry?: Entry } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [passwordState, setPasswordState] = useState({
    current: '', new: '', confirm: '', show: false, error: '', success: false, isSubmitting: false
  });

  const activeYear = years.find(y => y.id === selectedYearId);
  const isClosed = activeYear?.isClosed || false;
  const isLatestYear = years.length > 0 && selectedYearId === years[0].id;

  const filteredEntries = entries
    .filter(e => e.type === (activeTab === 'settings' ? 'collection' : activeTab))
    .filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const report = await aiService.analyzeFinancials(stats, entries, selectedYearId);
    setAiReport(report || "Analysis failed.");
    setIsAnalyzing(false);
  };

  const handleSaveEntry = (data: Omit<Entry, 'id' | 'yearId'> & { id?: string }) => {
    if (data.id) {
      updateEntry({ ...data, id: data.id, yearId: selectedYearId } as Entry);
    } else {
      addEntry({ ...data, yearId: selectedYearId } as Entry);
    }
    setShowForm(null);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordState(prev => ({ ...prev, error: '', success: false, isSubmitting: true }));
    
    if (passwordState.new.length < 4) {
      setPasswordState(prev => ({ ...prev, error: 'Min. 4 characters required.', isSubmitting: false }));
      return;
    }
    if (passwordState.new !== passwordState.confirm) {
      setPasswordState(prev => ({ ...prev, error: 'Passwords do not match.', isSubmitting: false }));
      return;
    }

    const result = await storageService.updateAdminPassword(passwordState.current, passwordState.new);
    
    if (result.success) {
      setPasswordState({ current: '', new: '', confirm: '', show: false, error: '', success: true, isSubmitting: false });
      setTimeout(() => setPasswordState(prev => ({ ...prev, success: false })), 3000);
    } else {
      setPasswordState(prev => ({ ...prev, error: result.error || 'Failed to update.', isSubmitting: false }));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Admin Terminal</h1>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border ${isClosed ? 'bg-slate-100/50 text-slate-500 border-slate-200' : 'bg-emerald-100/50 text-emerald-700 border-emerald-200'}`}>
                {isClosed ? 'ARCHIVED' : 'LIVE'}
              </span>
              <div className="flex items-center text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Globe className="w-3 h-3 mr-1" /> MONGODB ACTIVE
              </div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm mt-1">Management Controls • Fiscal Year {selectedYearId}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-black hover:opacity-90 transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Activity className="w-4 h-4 mr-2 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? 'Analyzing Data...' : 'AI Financial Expert'}
          </button>

          <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/40 shadow-sm flex-1 sm:flex-initial">
            <Calendar className="w-3.5 h-3.5 ml-3 text-indigo-500" />
            <select value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)} className="bg-transparent border-none outline-none text-xs sm:text-sm font-bold py-1.5 sm:py-2 px-3 focus:ring-0 w-full cursor-pointer">
              {years.map(y => (
                <option key={y.id} value={y.id}>{y.id} {y.isClosed ? '🔒' : ''}</option>
              ))}
            </select>
          </div>

          {!isClosed && (
            <button onClick={() => setShowConfirmClose(true)} className="flex items-center px-4 py-2.5 bg-amber-500 text-white rounded-2xl text-xs sm:text-sm font-black hover:bg-amber-600 transition-all shadow-lg active:scale-95">
              <Lock className="w-4 h-4 mr-2" /> Lock Year
            </button>
          )}
        </div>
      </header>

      {aiReport && (
        <div className="glass-card p-8 rounded-[2rem] border-2 border-indigo-100 shadow-2xl animate-in slide-in-from-top-4 duration-500 relative">
          <button onClick={() => setAiReport(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Financial Insights</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Gemini 3 Pro Analysis</p>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">
            {aiReport}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">This analysis is AI-generated based on current ledger entries</p>
            <button onClick={handleAIAnalysis} className="text-xs font-black text-indigo-600 hover:underline flex items-center">
              Refresh Analysis <Sparkles className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard label="Forwarded" value={stats.openingBalance} color="indigo" icon={<ChevronRight className="w-6 h-6 rotate-180" />} />
        <StatCard label="Income" value={stats.totalCollection} color="emerald" icon={<TrendingUp className="w-6 h-6" />} />
        <StatCard label="Expenses" value={stats.totalExpense} color="rose" icon={<TrendingDown className="w-6 h-6" />} />
        <StatCard label="Balance" value={stats.currentBalance} color="amber" icon={<Wallet className="w-6 h-6" />} />
      </div>

      <div className="glass-card rounded-[2rem] shadow-2xl overflow-hidden border border-white/40">
        <div className="p-4 sm:p-6 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-[1rem] w-full md:w-fit border border-white/30">
            <button onClick={() => setActiveTab('collection')} className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${activeTab === 'collection' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              Income List
            </button>
            <button onClick={() => setActiveTab('expense')} className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${activeTab === 'expense' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              Expense List
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${activeTab === 'settings' ? 'bg-white text-slate-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {activeTab !== 'settings' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Find by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 w-full md:w-48 lg:w-64" />
              </div>
              {!isClosed && (
                <button onClick={() => setShowForm({ type: activeTab as EntryType })} className={`flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-black text-white transition-all shadow-xl active:scale-95 ${activeTab === 'collection' ? 'bg-indigo-600' : 'bg-rose-600'}`}>
                  <Plus className="w-5 h-5 mr-2" /> Add {activeTab === 'collection' ? 'Income' : 'Expense'}
                </button>
              )}
            </div>
          )}
        </div>

        {activeTab === 'settings' ? (
          <div className="p-8 sm:p-12 space-y-12 animate-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-2xl mx-auto bg-white/40 p-8 rounded-[2.5rem] border border-white/60">
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-amber-100 p-4 rounded-3xl text-amber-600">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Admin Credentials</h3>
                  <p className="text-slate-500 text-xs font-medium">Edit your system access password</p>
                </div>
              </div>

              {passwordState.success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
                  ✓ Passkey updated successfully in the cloud!
                </div>
              )}

              {passwordState.error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl">
                  ⚠ {passwordState.error}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={passwordState.show ? 'text' : 'password'} required className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-amber-100 font-bold text-sm" value={passwordState.current} onChange={e => setPasswordState(prev => ({ ...prev, current: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input type={passwordState.show ? 'text' : 'password'} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-amber-100 font-bold text-sm" value={passwordState.new} onChange={e => setPasswordState(prev => ({ ...prev, new: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New</label>
                    <input type={passwordState.show ? 'text' : 'password'} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-amber-100 font-bold text-sm" value={passwordState.confirm} onChange={e => setPasswordState(prev => ({ ...prev, confirm: e.target.value }))} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button type="button" onClick={() => setPasswordState(prev => ({ ...prev, show: !prev.show }))} className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors">
                    {passwordState.show ? 'Hide Characters' : 'Show Characters'}
                  </button>
                  <button type="submit" disabled={passwordState.isSubmitting} className="px-8 py-3 bg-amber-600 text-white rounded-xl font-black shadow-lg hover:bg-amber-700 transition-all flex items-center text-sm active:scale-95 disabled:opacity-50">
                    {passwordState.isSubmitting ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Update Passkey
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sticky top-0">
                <tr>
                  <th className="px-6 sm:px-8 py-5">Date</th>
                  <th className="px-6 sm:px-8 py-5">
                    {activeTab === 'expense' ? 'Item & Proof' : 'Contributor Source'}
                  </th>
                  <th className="px-6 sm:px-8 py-5">Amount</th>
                  <th className="px-6 sm:px-8 py-5 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/20">
                {filteredEntries.length > 0 ? filteredEntries.map(e => (
                  <tr key={e.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 sm:px-8 py-5 text-xs sm:text-sm font-bold text-slate-500">{new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 sm:px-8 py-5">
                      <div className="flex items-center space-x-4">
                        {e.receiptImage && (
                          <div 
                            className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0 cursor-pointer hover:border-indigo-400 transition-all shadow-sm"
                            onClick={() => setViewingImage(e.receiptImage!)}
                          >
                            <img src={e.receiptImage} className="w-full h-full object-cover" alt="Receipt" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm sm:text-base">{e.title}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cloud Synchronized</span>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 sm:px-8 py-5 font-black text-sm sm:text-base ${activeTab === 'collection' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {activeTab === 'collection' ? '+' : '-'}${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 sm:px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-1 sm:space-x-3">
                        <button disabled={isClosed} onClick={() => setShowForm({ type: e.type, entry: e })} className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 text-xs font-bold">
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </button>
                        <button disabled={isClosed} onClick={() => confirm(`Permanently delete this ${e.type}?`) && deleteEntry(e.id)} className="flex items-center px-3 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all disabled:opacity-30 text-xs font-bold">
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 italic">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingImage(null)} className="absolute -top-12 right-0 p-2 bg-white/10 text-white rounded-full hover:bg-white/20">
              <X className="w-6 h-6" />
            </button>
            <img src={viewingImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/20" alt="Full size receipt" />
          </div>
        </div>
      )}

      {showConfirmClose && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl space-y-6">
            <div className="bg-amber-100 w-16 h-16 rounded-3xl flex items-center justify-center text-amber-600 mx-auto rotate-12"><AlertCircle className="w-8 h-8" /></div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Lock Year {selectedYearId}?</h3>
              <p className="text-slate-600 text-sm font-medium">This action is irreversible. Records will be read-only.</p>
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <button onClick={() => { closeYear(selectedYearId); setShowConfirmClose(false); }} className="w-full py-4 bg-amber-600 text-white rounded-2xl hover:bg-amber-700 font-black">Confirm Lock</button>
              <button onClick={() => setShowConfirmClose(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 font-bold transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <EntryForm type={showForm.type} yearId={selectedYearId} entry={showForm.entry} onSave={handleSaveEntry} onClose={() => setShowForm(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;