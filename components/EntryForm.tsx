
import React, { useState, useEffect, useRef } from 'react';
import { Entry, EntryType } from '../types';
import { X, Plus, Save, Image as ImageIcon, Trash2 } from 'lucide-react';

interface EntryFormProps {
  type: EntryType;
  yearId: string;
  entry?: Entry;
  onSave: (entry: Omit<Entry, 'id' | 'yearId'> & { id?: string }) => void;
  onClose: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ type, yearId, entry, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receiptImage: '' as string | undefined
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        amount: entry.amount.toString(),
        date: entry.date,
        receiptImage: entry.receiptImage
      });
    }
  }, [entry]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData({ ...formData, receiptImage: base64 });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only Title, Amount, and Date are mandatory
    if (!formData.title || !formData.amount || !formData.date) return;
    
    onSave({
      id: entry?.id,
      type,
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: formData.date,
      receiptImage: formData.receiptImage // This remains optional
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-black text-slate-900">
            {entry ? 'Edit' : 'Add New'} {type === 'collection' ? 'Collection' : 'Expense'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              {type === 'collection' ? 'Contributor Name' : 'Product Name / Item'}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all text-sm font-bold"
              placeholder={type === 'collection' ? "Full Name" : "e.g., Office Supplies"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Amount ($)
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all text-sm font-bold"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all text-sm font-bold"
              />
            </div>
          </div>

          {type === 'expense' && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Receipt / Proof</label>
                <span className="text-[10px] font-bold text-slate-400 italic">Optional</span>
              </div>
              
              {formData.receiptImage ? (
                <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-100 aspect-video bg-slate-50 shadow-inner">
                  <img src={formData.receiptImage} className="w-full h-full object-cover" alt="Receipt preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white rounded-lg text-indigo-600 hover:scale-110 transition-transform"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, receiptImage: undefined })}
                      className="p-2 bg-white rounded-lg text-rose-600 hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/30 transition-all group"
                >
                  <ImageIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Attach Image (Not Required)</span>
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          )}

          <div className="pt-6 flex flex-col xs:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 order-2 xs:order-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-black text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 order-1 xs:order-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center"
            >
              {entry ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {entry ? 'Update Entry' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryForm;
