// src/components/features/AddUnitForm.tsx
import { useState } from 'react';

interface AddUnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, dateType?: 'CAT' | 'Exam', dateValue?: string) => void;
}

export default function AddUnitForm({ isOpen, onClose, onAdd }: AddUnitFormProps) {
  const [name, setName] = useState('');
  const [dateType, setDateType] = useState<'CAT' | 'Exam' | ''>('');
  const [dateValue, setDateValue] = useState('');

  if (!isOpen) return null;

  // Timezone-safe current date (YYYY-MM-DD)
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minDate = today.toISOString().split('T')[0];

  // Helper utility to translate native YYYY-MM-DD strings into standard DD/MM/YYYY
  const formatToCalendarString = (rawDate: string) => {
    if (!rawDate) return '';
    const [year, month, day] = rawDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    // Extra protection against manually entering an invalid date
    if (dateType && dateValue && dateValue < minDate) {
      alert('Please choose today or a future date.');
      return;
    }

    const formattedDate = dateValue
      ? formatToCalendarString(dateValue)
      : undefined;

    onAdd(name.trim(), dateType || undefined, formattedDate);

    setName('');
    setDateType('');
    setDateValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-dmsans">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-100 animate-scaleUp">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Add new course unit
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Unit Name
            </label>
            <input
              type="text"
              placeholder="e.g., Distributed Systems"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-slate-900 bg-slate-50/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Deadline Type
              </label>
              <select
                value={dateType}
                onChange={(e) => setDateType(e.target.value as 'CAT' | 'Exam' | '')}
                className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-sm bg-white focus:outline-none"
              >
                <option value="">None</option>
                <option value="CAT">CAT</option>
                <option value="Exam">Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                When?
              </label>
              <input
                type="date"
                value={dateValue}
                min={minDate}
                onChange={(e) => setDateValue(e.target.value)}
                disabled={!dateType}
                className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-slate-700"
              />
            </div>
          </div>

          {dateType && dateValue && (
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-start">
              <span className="text-base mt-0.5">🧠</span>
              <p className="text-xs font-medium text-blue-900 leading-normal">
                <strong>Gemma Optimizer Active:</strong> Tracking this timeline
                allows the local LLM engine to synthesize personalized
                countdown reminders and generate high-priority offline study
                plans!
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-slate-800 cursor-pointer"
            >
              Create Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}