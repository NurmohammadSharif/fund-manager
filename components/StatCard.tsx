
import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  color: 'indigo' | 'emerald' | 'rose' | 'amber';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon }) => {
  const iconColors = {
    indigo: 'bg-indigo-500/10 text-indigo-600',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    rose: 'bg-rose-500/10 text-rose-600',
    amber: 'bg-amber-500/10 text-amber-600'
  };

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

  return (
    <div className="glass-card p-6 rounded-3xl shadow-xl shadow-slate-200/50 transition-all hover:translate-y-[-2px] hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{formattedValue}</h3>
        </div>
        <div className={`p-3.5 rounded-2xl ${iconColors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
