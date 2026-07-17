import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import type { Unit, Material } from '../types/unit';

export default function UploadMaterial() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Bulletproof ID extractor: checks path params, query parameters, and navigation state
  const queryParams = new URLSearchParams(location.search);
  const targetUnitId = 
    params.unitId || 
    params.id || 
    queryParams.get('unitId') || 
    queryParams.get('id') || 
    (location.state as any)?.unitId ||
    (location.state as any)?.id;

  // App states
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState<'English' | 'Kiswahili'>('English');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch target unit dynamically using a flexible comparison checks
  useEffect(() => {
    if (!targetUnitId) return;
    
    const savedUnits = localStorage.getItem('chuosurvivor_units');
    if (savedUnits) {
      const parsed: Unit[] = JSON.parse(savedUnits);
      // Loose equality (==) protects against string vs number type mismatches
      const found = parsed.find(u => u.id == targetUnitId);
      if (found) {
        setCurrentUnit(found);
      }
    }
  }, [targetUnitId]);

  // Handle accumulation of multiple document selections
  const handleFileDropOrSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  };

  // Remove individual items from staging layout
  const removeFileFromQueue = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // True local agent check pipeline 
  const handleTriggerInference = async (taskMode: 'explain' | 'quiz') => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one note document or image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Initialize FormData object
      const formData = new FormData();

      // 2. Append multiple files using a loop 
      // Note: If your backend expects a list of files, the key name is usually 'files'
      selectedFiles.forEach((file) => {
        formData.append('files', file); 
      });

      // 3. Append your metadata states
      formData.append('language', language);
      formData.append('unitId', targetUnitId ? targetUnitId.toString() : 'unassigned');

      // 4. Send the request without setting Content-Type manually
      const nativeInferenceCheck = await fetch(`http://localhost:8000/${taskMode}`, {
        method: 'POST',
        body: formData, // 👈 Pass the FormData object here
      });

      if (!nativeInferenceCheck.ok) {
        // Log the structural validation failure reason directly to console
        const validationErrorPayload = await nativeInferenceCheck.json().catch(() => null);
        console.error("422 Details:", validationErrorPayload);
        
        throw new Error("Local model environment responded with an internal status error.");
      }

      // Read state storage and append array logs 
      const savedRawMaterials = localStorage.getItem('chuosurvivor_materials');
      const currentStoredMaterials: Material[] = savedRawMaterials ? JSON.parse(savedRawMaterials) : [];

      const freshMaterialsBatch: Material[] = selectedFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        unitId: targetUnitId ? targetUnitId.toString() : 'unassigned',
        title: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        uploadedAt: new Date().toLocaleDateString('en-GB') 
      }));

      localStorage.setItem(
        'chuosurvivor_materials', 
        JSON.stringify([...currentStoredMaterials, ...freshMaterialsBatch])
      );

      setIsLoading(false);
      navigate('/units'); // Redirect back gracefully upon generation task success
    } catch (err) {
      setIsLoading(false);
      setError(
        "Could not communicate with local Gemma model engine. Ensure Ollama is open and running in your terminal background via 'ollama run gemma'."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-dmsans">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Gemma is evaluating your files to generate explanations in {language}...
        </h2>
        <p className="text-slate-500 text-sm">Gemma/Ollama logic runs completely offline.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-dmsans bg-white text-slate-900 select-none">
      <Navbar />

      <main className="flex-1 px-8 md:px-16 max-w-3xl mx-auto w-full pt-12 pb-20">
        {/* Back Button and Context Title Header */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold mb-6 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">
          New material — <span className="uppercase text-slate-700">{currentUnit ? currentUnit.name : 'Unassigned Unit'}</span>
        </h1>
        <p className="text-slate-500 text-sm mb-8">Upload photos or PDFs of your notes.</p>

        {/* Global Error Banner Display */}
        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Multi-file Input Trigger Drag Zone */}
        <label className="w-full h-44 border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors mb-8">
          <input 
            type="file" 
            multiple 
            accept="image/*,application/pdf" 
            className="hidden" 
            onChange={handleFileDropOrSelect} 
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="font-semibold text-slate-700 text-sm">Drag an image or PDF here, or tap to browse</span>
        </label>

        {/* Staged Multi-File Table Area */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-col gap-3 mb-8">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="w-full border border-slate-100 bg-white shadow-sm rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wider ${file.type.includes('pdf') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {file.type.includes('pdf') ? 'PDF' : 'IMG'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 max-w-md truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">Ready for local engine evaluation</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFileFromQueue(idx)}
                  className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Inference Execution Configuration Panel */}
        <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-6">
          <span className="text-sm font-bold text-slate-500">Explain in:</span>
          <div className="bg-slate-100 p-1 rounded-full flex gap-1">
            <button 
              onClick={() => setLanguage('English')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'English' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('Kiswahili')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'Kiswahili' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Kiswahili
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleTriggerInference('explain')}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            Explain this ↓
          </button>
          <button 
            onClick={() => handleTriggerInference('quiz')}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            Generate Quiz 
          </button>
        </div>
      </main>
    </div>
  );
}