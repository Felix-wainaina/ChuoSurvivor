import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { uploadMaterial } from '../services/api'; 
import { savePdfToStorage } from '../lib/storage'; 
import { mockSavedNotes } from '../lib/resources'; 

export default function UploadMaterial() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [lang, setLang] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setErrorMessage(null);
      setFile(event.target.files[0]);
    }
  };

  const handleFormSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setErrorMessage("Please select a document or image before submitting.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Package payloads, execute FastAPI sequential pipeline endpoints (/explain & /quiz)
      const processedMaterial = await uploadMaterial(file, userPrompt, lang);

      // 2. Safely capture and cache heavy PDF binaries out of primary text history arrays
      if (file.type === 'application/pdf') {
        await savePdfToStorage(`pdf_${processedMaterial.id}`, file);
      }

      // 3. Keep local synchronous cache arrays up to date 
      mockSavedNotes.unshift(processedMaterial);

      // 4. DYNAMIC ROUTING UPDATE: Instantly push the user into the active workspace view!
      navigate(`/study-unit/${processedMaterial.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during material processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-dmsans">
      <Navbar />
      
      {/* Retains your exact styling content margins wrapper layout */}
      <main className="px-8 md:px-16 max-w-5xl mx-auto w-full pt-12 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload Study Material</h1>
          <p className="text-slate-500 mt-2">
            Upload images, notes, or presentation slides to generate simplified summaries and quizzes.
          </p>
        </div>

        <form onSubmit={handleFormSubmission} className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}

          {/* File Picker Container Block */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Document or Image
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition relative bg-slate-50">
              <input
                type="file"
                onChange={handleFileSelection}
                accept=".pdf,.docx,.pptx,.txt,.md,.json,.png,.jpg,.jpeg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1">
                <p className="text-sm text-slate-600 font-medium">
                  {file ? `Selected: ${file.name}` : "Click to browse or drag and drop your file here"}
                </p>
                <p className="text-xs text-slate-400">
                  Supports PDF, DOCX, PPTX, TXT, and Images up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Special Custom Prompt Context Layer */}
          <div>
            <label htmlFor="custom-prompt" className="block text-sm font-medium text-slate-700 mb-2">
              Custom Focus or Special Instructions (Optional)
            </label>
            <textarea
              id="custom-prompt"
              rows={3}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., 'Focus primarily on the circuit diagram' or 'Summarize the formulas used'"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>

          {/* Localization Dropdown Selection */}
          <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-slate-700 mb-2">
              Explanation Language
            </label>
            <select
              id="language-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full md:w-64 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="en">English (Simplified)</option>
              <option value="sw">Kiswahili (Rahisi)</option>
            </select>
          </div>

          {/* User Interface Trigger Button Elements */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/my-units')}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center shadow-sm"
            >
              {isProcessing ? "Processing Data..." : "Generate Study Guide"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
