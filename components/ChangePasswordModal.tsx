import React, { useState } from 'react';
import { X, Key, ShieldCheck, Activity, Save, Eye, EyeOff, LayoutDashboard, Database } from 'lucide-react';
import { storageService } from '../services/storageService';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'admin' | 'collection'>('admin');
    const [formData, setFormData] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: 'loading' });

        if (formData.new.length < 4) {
            setStatus({ type: 'error', message: 'New passkey must be at least 4 characters.' });
            return;
        }

        if (formData.new !== formData.confirm) {
            setStatus({ type: 'error', message: 'Confirm passkey does not match.' });
            return;
        }

        let result;
        if (activeTab === 'admin') {
            result = await storageService.updateAdminPassword(formData.current, formData.new);
        } else {
            // For collection key, "current" refers to Admin Password for verification
            result = await storageService.updateCollectionKey(formData.current, formData.new);
        }

        if (result.success) {
            setStatus({ type: 'success', message: `${activeTab === 'admin' ? 'Admin Password' : 'Collection Passkey'} updated successfully!` });
            setFormData({ current: '', new: '', confirm: '' });
            setTimeout(onClose, 2000);
        } else {
            setStatus({ type: 'error', message: result.error || 'Admin verification failed.' });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-md glass-card rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden transform animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white text-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/20">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Security Terminal</h2>

                    <div className="mt-6 flex p-1 bg-black/20 rounded-xl border border-white/10">
                        <button
                            onClick={() => { setActiveTab('admin'); setStatus({ type: 'idle' }); }}
                            className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'admin' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Login Pass
                        </button>
                        <button
                            onClick={() => { setActiveTab('collection'); setStatus({ type: 'idle' }); }}
                            className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'collection' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            <Database className="w-3.5 h-3.5 mr-1.5" /> Ledger Key
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {status.type === 'success' && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black rounded-xl animate-in slide-in-from-top-2">
                            ✓ {status.message}
                        </div>
                    )}

                    {status.type === 'error' && (
                        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black rounded-xl animate-in shake">
                            ⚠ {status.message}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Identity Proof</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                required
                                className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm transition-all"
                                value={formData.current}
                                onChange={e => setFormData({ ...formData, current: e.target.value })}
                                placeholder="Enter Admin Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                New {activeTab === 'admin' ? 'Login Pass' : 'Ledger Passkey'}
                            </label>
                            <input
                                type={showPass ? 'text' : 'password'}
                                required
                                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm transition-all"
                                value={formData.new}
                                onChange={e => setFormData({ ...formData, new: e.target.value })}
                                placeholder="Min. 4 chars"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Update</label>
                            <input
                                type={showPass ? 'text' : 'password'}
                                required
                                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm transition-all"
                                value={formData.confirm}
                                onChange={e => setFormData({ ...formData, confirm: e.target.value })}
                                placeholder="Repeat new value"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={status.type === 'loading' || status.type === 'success'}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center text-sm active:scale-95 disabled:opacity-50"
                        >
                            {status.type === 'loading' ? (
                                <Activity className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {status.type === 'loading' ? 'Processing...' : `Update ${activeTab === 'admin' ? 'Admin Security' : 'Ledger Security'}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;