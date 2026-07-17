import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import UnitCard from '../components/features/UnitCard';
import AddUnitForm from '../components/features/AddUnitForm';
import type { Unit, Material } from '../types/unit';

export default function MyUnits() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Edit Modal States
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editName, setEditName] = useState('');
  const [editDateType, setEditDateType] = useState<'CAT' | 'Exam' | ''>('');
  const [editDateValue, setEditDateValue] = useState('');
  
  // State for units and materials sourced purely from local memory
  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem('chuosurvivor_units');
    return saved ? JSON.parse(saved) : [];
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('chuosurvivor_materials');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chuosurvivor_units', JSON.stringify(units));
  }, [units]);

  // Syncing active material counts across screens dynamically
  const getMaterialCount = (unitId: string) => {
    return materials.filter(m => m.unitId === unitId).length;
  };

  const handleAddUnit = (name: string, dateType?: 'CAT' | 'Exam', dateValue?: string) => {
    const colorThemes = [
      { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-900', icon: '💻' },
      { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-900', icon: '📐' },
      { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-900', icon: '📁' }
    ];
    const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
    
    // Exact timestamp formatting
    const now = new Date();
    const timestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    const newUnit: Unit = {
      id: Date.now().toString(),
      name,
      dateType,
      dateValue,
      theme: randomTheme,
      createdAt: timestamp
    };

    setUnits([...units, newUnit]);
  };

  // Pre-fill and open the edit modal
  const handleOpenEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setEditName(unit.name);
    setEditDateType(unit.dateType || '');
    setEditDateValue(unit.dateValue || '');
    setActiveMenuId(null);
  };

  // Save the edited changes
  const handleSaveEdit = () => {
    if (!editingUnit || !editName.trim()) return;
    
    setUnits(units.map(u => u.id === editingUnit.id ? {
      ...u,
      name: editName.trim(),
      dateType: editDateType === '' ? undefined : editDateType,
      dateValue: editDateValue || undefined
    } : u));
    
    setEditingUnit(null);
  };

  const handleDeleteUnit = (id: string) => {
    if (window.confirm("Are you sure you want to delete this unit and all its contents?")) {
      setUnits(units.filter(u => u.id !== id));
      // Clean up orphaned materials associated with this unit
      const remainingMaterials = materials.filter(m => m.unitId !== id);
      setMaterials(remainingMaterials);
      localStorage.setItem('chuosurvivor_materials', JSON.stringify(remainingMaterials));
    }
    setActiveMenuId(null);
  };

  // Generate today's date string to block past dates in the edit modal
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen w-full flex flex-col font-dmsans bg-white text-slate-900 select-none">
      <Navbar />

      <main className="flex-1 px-8 md:px-16 max-w-5xl mx-auto w-full pt-12 pb-20">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">My units</h1>
        </div>

        {units.length === 0 ? (
          <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-gray-50/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-xl font-bold text-slate-900 mb-2">You haven't added a unit yet.</h2>
            <p className="text-slate-500 mb-8 max-w-md">Create a course unit workspace to begin storing notes offline.</p>
            <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white font-medium px-6 py-3 rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
              Add your first unit
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {units.map((unit) => (
                <div key={unit.id} className="relative group">
                  
                  {/* Dynamic Unit Card Component Wrapper */}
                  <UnitCard unit={{ ...unit, materialCount: getMaterialCount(unit.id) }} />

                  {/* Absolute Mounted Three-Dots Action Button */}
                  <div className="absolute top-5 right-5 z-20">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === unit.id ? null : unit.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/80 border border-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>

                    {/* Context Overlay Menu */}
                    {activeMenuId === unit.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 shadow-xl rounded-xl p-1 flex flex-col gap-0.5 animate-fadeIn">
                        <button 
                          onClick={(e) => { e.preventDefault(); handleOpenEdit(unit); }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); handleDeleteUnit(unit.id); }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-6 right-6 text-[10px] text-slate-400 font-medium">Added {unit.createdAt}</span>
                </div>
              ))}

              <button onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-slate-900 hover:border-slate-400 transition-colors h-48 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold text-sm">Add a unit</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Dismiss menus when clicking outside */}
      {activeMenuId && <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />}

      <AddUnitForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddUnit} />

      {/* Edit Unit Modal Overlay */}
      {editingUnit && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-6">Edit Unit Details</h2>
            
            <div className="flex flex-col gap-5">
              {/* Name Edit */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 block">Unit Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                  placeholder="e.g. Linear Algebra"
                />
              </div>

              {/* Date Type & Value Edit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 block">Event Type</label>
                  <select
                    value={editDateType}
                    onChange={(e) => setEditDateType(e.target.value as 'CAT' | 'Exam' | '')}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all bg-white"
                  >
                    <option value="">None</option>
                    <option value="CAT">CAT</option>
                    <option value="Exam">Exam</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 block">Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={editDateValue}
                    onChange={(e) => setEditDateValue(e.target.value)}
                    disabled={!editDateType}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:bg-slate-50 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setEditingUnit(null)} 
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  disabled={!editName.trim()}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}