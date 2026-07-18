import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { mockSavedNotes } from '../lib/resources';
import { useEffect, useState } from 'react';
import { downloadLocalModel, type DownloadProgress } from '../services/localGemma';
import { requestStudyAnswer } from '../services/studyAi';

// Strict type definition matching your ExplanationData layout interface properties
interface ExplanationData {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  explanationText: string;
  quizQuestions: any[];
  language: 'en' | 'sw';
  timestamp: number;
  hasOfflineFile: boolean;
}

// Strict type interface for message structures to eliminate generic string widening bugs
interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function StudyUnitView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Locate the matching data block dynamically out of synchronized resources, typed as ExplanationData
  const localUnits = JSON.parse(localStorage.getItem('chuosurvivor_units') || '[]') as Array<{ id: string; name: string }>;
  const localMaterials = JSON.parse(localStorage.getItem('chuosurvivor_materials') || '[]') as Array<{ unitId: string; title: string; explanationText?: string }>;
  const localUnit = localUnits.find((unit) => unit.id === id);
  const localExplanation = localMaterials.find((material) => material.unitId === id)?.explanationText;
  const unitData = (mockSavedNotes.find((note) => note.id === id) ?? (localUnit ? {
    id: localUnit.id,
    title: localUnit.name,
    courseCode: 'Study unit',
    description: '',
    explanationText: localExplanation ?? 'No material summary has been saved yet. Upload material first, then ask for help with the topic.',
    quizQuestions: [],
    language: 'en',
    timestamp: Date.now(),
    hasOfflineFile: false,
  } : undefined)) as ExplanationData | undefined;

  // State hook managing the timeline conversation flow, strongly typed as ChatMessage elements
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'ai', 
      text: "Hi! I've processed your material. Ask me any follow-up questions about this topic." 
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [activeModel, setActiveModel] = useState<'cloud' | 'local'>('cloud');
  const [offlineMode, setOfflineMode] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5_000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const enableOfflineMode = async (enabled: boolean) => {
    setOfflineMode(enabled);
    if (!enabled || isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress({ loaded: 0 });
    try {
      await downloadLocalModel(setDownloadProgress);
      setActiveModel('local');
    } catch (error) {
      setOfflineMode(false);
      setToast(error instanceof Error ? error.message : 'Could not prepare the offline model.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Fallback UI safeguard rendering container if an invalid or missing tracking ID is hit
  if (!unitData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-dmsans">
        <p className="text-slate-600 mb-4">Study unit material not found.</p>
        <button 
          onClick={() => navigate('/my-units')} 
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium transition hover:bg-blue-700 shadow-sm"
        >
          Back to Units
        </button>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // FIXED: Explicit type annotation prevents 'sender' string from widening into any generic string
    const nextMessages: ChatMessage[] = [
      ...messages, 
      { sender: 'user', text: inputMessage }
    ];
    
    setMessages(nextMessages);
    setInputMessage('');
    setIsAnswering(true);
    try {
      const prompt = `You are a supportive study assistant. The learner is studying "${unitData.title}". Their notes are:\n${unitData.explanationText}\n\nQuestion: ${inputMessage}`;
      const result = await requestStudyAnswer(prompt);
      setActiveModel(result.activeModel);
      if (result.fellBack) setToast('Connection unstable: Switched to offline E2B model');
      setMessages([
        ...nextMessages, 
        { sender: 'ai', text: result.text }
      ]);
    } catch (error) {
      setMessages([...nextMessages, { sender: 'ai', text: error instanceof Error ? `I couldn't answer just now: ${error.message}` : 'I could not answer just now.' }]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-dmsans flex flex-col">
      <Navbar />
      {toast && (
        <div role="status" className="fixed right-4 top-4 z-50 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-lg">
          {toast}
        </div>
      )}
      
      {/* Dynamic Header Structural Layout Area */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm z-10">
        <div className="min-w-0">
          <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {unitData.courseCode}
          </span>
          <h1 className="text-xl font-bold mt-1 break-words">{unitData.title}</h1>
        </div>
        <button 
          onClick={() => navigate('/my-units')}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Two-Column split screen view container wrapper */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-visible lg:overflow-hidden h-auto lg:h-[calc(100vh-140px)]">
        
        {/* LEFT COLUMN: Simplified Summary Content View Panel */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto border-r border-slate-200 bg-white">
          <h2 className="text-lg font-bold mb-4 text-slate-800 pb-2 border-b border-slate-100 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span> Simplified AI Explanation Summary</span>
            <span className="text-xs font-normal text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
              Language: {unitData.language === 'sw' ? 'Kiswahili' : 'English'}
            </span>
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
            {unitData.explanationText}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Follow-up Learning AI Chat Layout */}
        <div className="flex flex-col bg-slate-50 overflow-hidden min-h-[28rem] lg:h-full">
          {/* Chat message timeline window wrapper */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
              <span className="font-medium text-slate-500">Answering with</span>
              <span className={`rounded-full px-2.5 py-1 font-bold ${activeModel === 'local' ? 'bg-[#b6feb5]/60 text-slate-800' : 'bg-blue-50 text-blue-700'}`}>
                {activeModel === 'local' ? 'Offline E2B model' : 'Cloud model'}
              </span>
            </div>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-3 mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mx-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Enable Offline Study Mode (Requires ~3GB Download)</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Download a smaller version of our AI directly to your device so you can keep studying on the train, during power outages, or anywhere without Wi-Fi.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={offlineMode}
                aria-label="Enable Offline Study Mode"
                onClick={() => void enableOfflineMode(!offlineMode)}
                disabled={isDownloading}
                className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition ${offlineMode ? 'bg-blue-600' : 'bg-slate-300'} ${isDownloading ? 'cursor-wait opacity-70' : ''}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${offlineMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {isDownloading && (
              <div className="mt-3" aria-live="polite">
                <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Preparing offline model…</span><span>{downloadProgress?.total ? `${Math.round((downloadProgress.loaded / downloadProgress.total) * 100)}%` : `${Math.round((downloadProgress?.loaded ?? 0) / 1024 / 1024)} MB`}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: downloadProgress?.total ? `${Math.min(100, (downloadProgress.loaded / downloadProgress.total) * 100)}%` : '8%' }} /></div>
              </div>
            )}
          </div>

          {/* Interactive chat action string form prompt input bar */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              placeholder={`Ask anything about ${unitData.title}...`}
              className="flex-1 bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isAnswering}
              className="px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              {isAnswering ? 'Thinking…' : 'Send'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
