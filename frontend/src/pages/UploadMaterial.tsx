// src/pages/UploadMaterial.tsx
import { useState, useRef } from 'react';
import { set } from 'idb-keyval';
import Navbar from '../components/layout/Navbar';
import { mockSavedNotes } from '../lib/resources';

export default function UploadMaterial() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State matching your design patterns
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [selectedUnit, setSelectedUnit] = useState<string>('1');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop helper states
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are supported at the moment.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Storage Layer Action: Save binary PDF block directly to IndexedDB
      const generatedNoteId = `note-${Date.now()}`;
      await set(`pdf_file_${generatedNoteId}`, file);

      // 2. Mock Backend Integration Loop: Simulate waiting 1.5s for Francis's API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Grab simulated structured response from resources
      const mockResult = mockSavedNotes[selectedUnit === '1' ? 0 : 1];
      
      console.log('Successfully generated explanation & stored file offline!', {
        noteId: generatedNoteId,
        data: mockResult
      });

      // Redirect student directly to the newly built dynamic resource page
      window.location.href = `/resource/${mockResult.id}`;
    } catch (err) {
      setError('An error occurred while saving the file locally.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-dmsans bg-white text-slate-900">
      <Navbar />

      <main className="flex-1 px-8 md:px-16 max-w-5xl mx-auto w-full pt-12 pb-20">
        <h1 className="text-3xl font-bold mb-8">Upload study material</h1>

        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-medium text-slate-600">
            Convert lecture handouts or textbook fragments into offline study targets.
          </h2>

          <form onSubmit={handleUploadSubmit} className="space-y-6 max-w-2xl">
            {/* Input fields row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Unit</label>
                <select 
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-slate-900 appearance-none cursor-pointer"
                >
                  <option value="1">Web Development</option>
                  <option value="2">Linear Algebra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Language</label>
                <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-colors ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('sw')}
                    className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-colors ${language === 'sw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Kiswahili
                  </button>
                </div>
              </div>
            </div>

            {/* Drag & Drop File Upload Box Container */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile.type === 'application/pdf') {
                    setFile(droppedFile);
                    setError(null);
                  } else {
                    setError('Only PDF files are supported.');
                  }
                }
              }}
              className={`w-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging ? 'border-slate-900 bg-slate-50/50' : 'border-gray-300 bg-gray-50/50 hover:border-slate-400'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf" 
                className="hidden" 
              />
              
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {file ? file.name : 'Click to upload or drag & drop'}
              </h3>
              <p className="text-xs text-slate-500">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF document file up to 20MB'}
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 font-medium text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons Footer */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={!file || isUploading}
                className={`font-medium px-6 py-3 rounded-full shadow-sm transition-colors flex items-center gap-2 ${
                  !file || isUploading 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing with Gemma...
                  </>
                ) : (
                  'Generate Study Materials'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => window.history.back()}
                className="text-slate-600 font-medium px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}