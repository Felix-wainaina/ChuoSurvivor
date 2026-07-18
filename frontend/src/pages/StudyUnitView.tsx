import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { mockSavedNotes } from '../lib/resources';

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
  const unitData = mockSavedNotes.find((note) => note.id === id) as ExplanationData | undefined;

  // State hook managing the timeline conversation flow, strongly typed as ChatMessage elements
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'ai', 
      text: "Hi! I've processed your material. Ask me any follow-up questions about this topic." 
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // FIXED: Explicit type annotation prevents 'sender' string from widening into any generic string
    const nextMessages: ChatMessage[] = [
      ...messages, 
      { sender: 'user', text: inputMessage }
    ];
    
    setMessages(nextMessages);
    setInputMessage('');

    // Simulate AI asynchronous response delay
    setTimeout(() => {
      setMessages([
        ...nextMessages, 
        { 
          sender: 'ai', 
          text: `I received your question about "${unitData.title}". This is a placeholder response until the live chat streaming endpoint is wired up.` 
        }
      ]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-dmsans flex flex-col">
      <Navbar />
      
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
              className="px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              Send
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
