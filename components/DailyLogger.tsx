import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { ViewState } from '../types';
import { ArrowLeft, Save, Clock, BookOpen, CheckSquare, AlertTriangle } from 'lucide-react';

interface InputGroupProps {
  label: string;
  children: React.ReactNode;
  icon?: any;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, children, icon: Icon }) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2 text-zinc-400">
        {Icon && <Icon size={16} />}
        <label className="text-xs font-bold uppercase tracking-wider">{label}</label>
    </div>
    {children}
  </div>
);

export const DailyLogger: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const { addLog } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    wakeTime: '07:00',
    studyHours: 0,
    wastedHours: 0,
    breakHours: 0,
    tasksAssigned: 5,
    tasksCompleted: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addLog({
        date: new Date().toISOString().split('T')[0],
        ...formData
      });
      setView(ViewState.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Failed to save log');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button 
            onClick={() => setView(ViewState.DASHBOARD)} 
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:border-zinc-700 transition-all text-zinc-400 hover:text-white"
        >
            <ArrowLeft size={20} />
        </button>
        <div>
            <h2 className="text-3xl font-bold text-white">Log Activity</h2>
            <p className="text-zinc-400 text-sm mt-1">Record your performance for today.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl shadow-black/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Left Column: Time & Hours */}
            <div className="space-y-8">
                <InputGroup label="Wake Up Time" icon={Clock}>
                    <input
                        type="time"
                        required
                        value={formData.wakeTime}
                        onChange={e => setFormData({ ...formData, wakeTime: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono text-lg"
                    />
                </InputGroup>

                <InputGroup label={`Study Hours (${formData.studyHours}h)`} icon={BookOpen}>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                        <input
                            type="range"
                            min="0"
                            max="16"
                            step="0.5"
                            value={formData.studyHours}
                            onChange={e => setFormData({ ...formData, studyHours: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer mb-2"
                        />
                         <div className="flex justify-between text-xs text-zinc-500 font-mono">
                            <span>0h</span>
                            <span>8h</span>
                            <span>16h</span>
                        </div>
                    </div>
                </InputGroup>

                <InputGroup label={`Break Hours (${formData.breakHours}h)`} icon={Clock}>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                        <input
                            type="range"
                            min="0"
                            max="8"
                            step="0.5"
                            value={formData.breakHours}
                            onChange={e => setFormData({ ...formData, breakHours: parseFloat(e.target.value) })}
                            className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer mb-2"
                        />
                         <div className="flex justify-between text-xs text-zinc-500 font-mono">
                            <span>0h</span>
                            <span>4h</span>
                            <span>8h</span>
                        </div>
                    </div>
                </InputGroup>

                <InputGroup label={`Wasted Time (${formData.wastedHours}h)`} icon={AlertTriangle}>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={formData.wastedHours}
                            onChange={e => setFormData({ ...formData, wastedHours: parseFloat(e.target.value) })}
                            className="w-full accent-rose-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer mb-2"
                        />
                        <div className="flex justify-between items-center mt-1">
                             <div className="flex justify-between text-xs text-zinc-500 font-mono w-full mr-4">
                                <span>0h</span>
                                <span>5h</span>
                                <span>10h</span>
                            </div>
                            <span className="text-xs text-rose-400 font-medium whitespace-nowrap">-5 pts/hr</span>
                        </div>
                    </div>
                </InputGroup>
            </div>

            {/* Right Column: Tasks & Notes */}
            <div className="space-y-8">
                 <InputGroup label={`Task Completion`} icon={CheckSquare}>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                            <span className="text-xs text-zinc-500 mb-2 block uppercase font-medium">Assigned</span>
                            <input
                                type="number"
                                min="1"
                                value={formData.tasksAssigned}
                                onChange={e => setFormData({ ...formData, tasksAssigned: parseInt(e.target.value) || 0 })}
                                className="w-full bg-transparent border-b border-zinc-800 py-1 text-white text-2xl font-bold focus:outline-none focus:border-emerald-500 text-center"
                            />
                         </div>
                         <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                            <span className="text-xs text-zinc-500 mb-2 block uppercase font-medium">Completed</span>
                            <input
                                type="number"
                                min="0"
                                max={formData.tasksAssigned}
                                value={formData.tasksCompleted}
                                onChange={e => setFormData({ ...formData, tasksCompleted: parseInt(e.target.value) || 0 })}
                                className="w-full bg-transparent border-b border-zinc-800 py-1 text-emerald-400 text-2xl font-bold focus:outline-none focus:border-emerald-500 text-center"
                            />
                         </div>
                     </div>
                     <div className="text-center mt-2">
                        <span className="text-xs text-zinc-500">
                            Success Rate: <span className="text-white font-bold">{formData.tasksAssigned > 0 ? Math.round((formData.tasksCompleted / formData.tasksAssigned) * 100) : 0}%</span>
                        </span>
                     </div>
                </InputGroup>

                <InputGroup label="Notes (Optional)">
                    <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        rows={6}
                        placeholder="What did you learn today? Any obstacles?"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none leading-relaxed"
                    />
                </InputGroup>
            </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <div className="pt-6 border-t border-zinc-800 flex justify-end">
             <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold py-4 px-12 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-3 transition-transform active:scale-95 text-lg disabled:cursor-not-allowed"
            >
                <Save size={20} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Saving...' : 'Save & Calculate Points'}
            </button>
        </div>
      </form>
    </div>
  );
};