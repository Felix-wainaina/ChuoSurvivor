// src/pages/UploadMaterial.tsx
import { useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import type { Unit, Material } from '../types/unit';

export default function UploadMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [units] = useState<Unit[]>(() => JSON.parse(localStorage.getItem('chuosurvivor_units') || '[]'));
  const currentUnit = units.find(u => u.id === id);
  const unitName = currentUnit ? currentUnit.name : "Unknown Unit";

  const [selectedLang, setSelectedLang] = useState<'EN' | 'SW'>('EN');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [aiLoadingText, setAiLoadingText] = useState<string | null>(null);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(prev => [...Array.from(files), ...prev]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProcessDocument = (mode: 'explain' | 'quiz') => {
    if (selectedFiles.length === 0) {
      window.alert("Please pick at least one file to upload first!");
      return;
    }

    const languageLabel = selectedLang === 'EN' ? 'English' : 'Kiswahili';
    setAiLoadingText(mode === 'explain' 
      ? `Gemma is evaluating your files to generate explanations in ${languageLabel}...`
      : `Gemma is mining text contents to compile interactive quiz evaluation packs...`
    );

    setTimeout(() => {
      const now = new Date();
      const timestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      const newMaterials: Material[] = selectedFiles.map((file, idx) => ({
        id: (Date.now() + idx).toString(),
        unitId: id || 'unknown',
        title: file.name.split('.')[0],
        type: file.type === 'application/pdf' ? 'pdf' : 'image',
        uploadedAt: timestamp
      }));

      const existingMaterials = JSON.parse(localStorage.getItem('chuosurvivor_materials') || '[]');
      localStorage.setItem('chuosurvivor_materials', JSON.stringify([...existingMaterials, ...newMaterials]));

      setAiLoadingText(null);
      navigate(`/unit/${id}`);
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-dmsans bg-white text-slate-900 relative select-none overflow-x-hidden">
      <Navbar />

      {aiLoadingText && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center px-6 animate-fadeIn">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin mb-6"></div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 animate-pulse">{aiLoadingText}</h3>
          <p className="text-sm font-medium text-slate-500">Gemma/Ollama logic runs completely offline.</p>
        </div>
      )}

      <main className="flex-1 px-8 md:px-16 max-w-3xl mx-auto w-full pt-12 pb-8 flex flex-col justify-between">
        <div className="w-full min-w-0">
          <div className="mb-8">
            <Link to={`/unit/${id}`} className="flex items-center gap-3 hover:text-slate-600 transition-colors w-fit mb-2 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <h1 className="text-3xl font-black tracking-tight truncate max-w-lg">New material — {unitName}</h1>
            </Link>
            <p className="text-slate-500 text-sm ml-9 font-medium">Upload photos or PDFs of your notes.</p>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileSelection} accept="image/*,application/pdf" multiple className="hidden" />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-2xl p-14 flex flex-col items-center justify-center text-center mb-6 cursor-pointer hover:bg-gray-100/50 hover:border-gray-400 transition-all shadow-sm"
          >
            <svg className="mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p className="text-sm font-semibold text-slate-600">Drag an image or PDF here, or tap to browse</p>
          </div>

          {/* Corrected Stacking Card Grid with text-wrapping to prevent container distortion */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-col gap-3 mb-6 max-h-[280px] overflow-y-auto pr-1 w-full min-w-0">
              {selectedFiles.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center justify-between animate-scaleUp w-full min-w-0 overflow-hidden">
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                    <div className={`px-3 py-2 rounded-xl font-black text-[10px] uppercase shrink-0 ${file.type === 'application/pdf' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {file.type === 'application/pdf' ? 'pdf' : 'img'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm break-words leading-tight">{file.name}</h4>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">Ready for local engine evaluation</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} 
                    className="text-slate-400 hover:text-red-600 p-2 hover:bg-slate-50 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-bold text-slate-700">Explain in:</span>
            <div className="flex p-1 border border-gray-200 rounded-full bg-white shadow-sm gap-1">
              <button type="button" onClick={() => setSelectedLang('EN')} className={`px-5 py-1.5 text-sm font-bold rounded-full transition-all cursor-pointer ${selectedLang === 'EN' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>English</button>
              <button type="button" onClick={() => setSelectedLang('SW')} className={`px-5 py-1.5 text-sm font-bold rounded-full transition-all cursor-pointer ${selectedLang === 'SW' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Kiswahili</button>
            </div>
          </div>
        </div>

        <div className="w-full pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
          <button onClick={() => handleProcessDocument('explain')} className="w-full bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer text-sm">
            Explain this
            <svg className="w-4 h-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </button>
          <button onClick={() => handleProcessDocument('quiz')} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer text-sm">
            Generate Quiz
            <svg className="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </button>
        </div>
      </main>
    </div>
  );
}