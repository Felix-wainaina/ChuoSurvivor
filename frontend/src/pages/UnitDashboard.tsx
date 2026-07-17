// src/pages/UnitDashboard.tsx
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import type { Unit, Material } from '../types/unit';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

interface StudyPlanPayload {
  planMarkdown: string;
  reminders: string[];
}

// Target your local Ollama instance running Gemma
const OLLAMA_API_URL = 'http://localhost:8000'; // Ensure your local Ollama instance is running and accessible
const OLLAMA_MODEL = 'gemma4'; // Swap to 'gemma' or your exact pulled model name if needed

export default function UnitDashboard() {
  const { id } = useParams();
  const [activeMaterialMenu, setActiveMaterialMenu] = useState<string | null>(null);
  const [previewingFile, setPreviewingFile] = useState<Material | null>(null);
  const [aiLoadingText, setAiLoadingText] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  
  // Interactive Quiz Module States
  const [activeQuizContext, setActiveQuizContext] = useState<{ title: string; questions: Question[] } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Active Study Plan & Agent Reminders States
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [agentReminders, setAgentReminders] = useState<string[]>([]);

  const [units] = useState<Unit[]>(() => JSON.parse(localStorage.getItem('chuosurvivor_units') || '[]'));
  const [materials, setMaterials] = useState<Material[]>(() => JSON.parse(localStorage.getItem('chuosurvivor_materials') || '[]'));

  useEffect(() => {
    localStorage.setItem('chuosurvivor_materials', JSON.stringify(materials));
  }, [materials]);

  const currentUnit = units.find(u => u.id === id);
  const unitName = currentUnit ? currentUnit.name : "Unknown Unit";
  const unitMaterials = materials.filter(m => m.unitId === id);

  // Active Local Agent Logic running through Ollama
  const triggerAiAction = async (actionType: 'quiz' | 'studyplan', materialTitle?: string) => {
    setActiveMaterialMenu(null);
    setAgentError(null);
    const scopeTitle = materialTitle || unitName;
    
    // Attempt to locate any contextual body text inside the file metadata if available
    const contextualBody = previewingFile?.title || "General syllabus architecture definitions.";
    console.log(contextualBody);

    if (actionType === 'quiz') {
      setAiLoadingText(`Gemma is parsing context layers from "${scopeTitle}" to extract a 10-question matrix...`);
      

      try {
        const response = await fetch(`${OLLAMA_API_URL}/quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: contextualBody,
          })
        });

        if (!response.ok) throw new Error(`Ollama engine returned operational status code: ${response.status}`);
        
        const data = await response.json();
        console.log("Quiz Response:", data);

        // 1. Safely handle if data or data.quiz comes back as a pre-parsed object/array or raw string
        let quizArray: any[] = [];

        if (Array.isArray(data)) {
          quizArray = data;
        } else if (data.quiz) {
          quizArray = typeof data.quiz === 'string' ? JSON.parse(data.quiz) : data.quiz;
        } else if (typeof data === 'string') {
          const parsedRoot = JSON.parse(data);
          quizArray = parsedRoot.quiz || [];
        }

        // 2. Structural schema validation check matching your actual payload structure
        if (!Array.isArray(quizArray) || quizArray.length === 0) {
          throw new Error("Gemma agent responded with an invalid structural schema format.");
        }

        // 3. Reset state blocks and assign directly to the active layout configuration
        setQuizAnswers({});
        setQuizSubmitted(false);

        // Map the working quiz array into your target state
        setActiveQuizContext({ 
          title: scopeTitle, 
          questions: quizArray // 👈 Passes the 5 valid question items smoothly
        });

      } catch (err: any) {
        console.error("Agent execution fault:", err);
        setAgentError(`Failed to coordinate with Gemma local agent. Ensure Ollama is running and '${OLLAMA_MODEL}' is pulled. Node details: ${err.message}`);
      } finally {
        setAiLoadingText(null);
      }

    } else {
      // Study Plan & Reminders Pipeline Generation
      setAiLoadingText(`Gemma is processing allocation parameters to deploy your localized roadmap schedule...`);
      
      const timelineContextText = currentUnit?.dateType && currentUnit?.dateValue 
        ? `Target milestone deadline tracking parameter: ${currentUnit.dateType} scheduled on ${currentUnit.dateValue}`
        : `Target standard flexible roadmap timeline framework setup.`;

      const planSystemPrompt = `You are the Gemma educational planning agent. Analyze the unit workspace context and construct a customized, step-by-step roadmap timeline study plan along with 3 immediate actionable reminders or warnings for the student.
      You must respond strictly in JSON format matching this schema:
      {
        "planMarkdown": "Your detailed markdown formatted study guide steps here...",
        "reminders": ["Reminder or target alert milestone 1", "Reminder 2", "Reminder 3"]
      }
      Do not include conversational filler text outside the JSON block.`;

      try {
        const response = await fetch(`${OLLAMA_API_URL}/study_plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: [
              { role: 'system', content: planSystemPrompt },
              { role: 'user', content: `Create a targeted study plan roadmap and 3 short actionable alerts for the unit "${unitName}" centered around "${scopeTitle}". Deadline parameters: ${timelineContextText}` }
            ],
            stream: false,
            options: { temperature: 0.5 },
            format: 'json'
          })
        });

        if (!response.ok) throw new Error(`Ollama engine returned operational status code: ${response.status}`);
        
        const data = await response.json();
        const parsedPayload: StudyPlanPayload = JSON.parse(data.message.content);

        setGeneratedPlan(parsedPayload.planMarkdown);
        setAgentReminders(parsedPayload.reminders || []);
      } catch (err: any) {
        console.error("Agent execution fault:", err);
        setAgentError(`Failed to compile study plan via Gemma. Verify your local Ollama connection parameters.`);
      } finally {
        setAiLoadingText(null);
      }
    }
  };

  const calculateQuizScore = () => {
    if (!activeQuizContext) return 0;
    return activeQuizContext.questions.reduce((score, q) => {
      return score + (quizAnswers[q.id] === q.correct ? 1 : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-dmsans bg-white text-slate-900 select-none relative overflow-x-hidden">
      <Navbar />

      {/* Action Processing Overlay Screen */}
      {aiLoadingText && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center px-6 animate-fadeIn">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mb-6"></div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{aiLoadingText}</h3>
          <p className="text-sm font-medium text-slate-500">Ollama local instance processing via model: <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{OLLAMA_MODEL}</span></p>
        </div>
      )}

      {/* Interactive 10-Question Quiz Terminal Drawer */}
      {activeQuizContext && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 flex flex-col justify-between animate-slideLeft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Gemma Agent Core</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 truncate max-w-md">Quiz: {activeQuizContext.title}</h2>
              </div>
              <button onClick={() => setActiveQuizContext(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Questions Container Block */}
            <div className="flex-1 overflow-y-auto my-6 pr-2 flex flex-col gap-6">
              {activeQuizContext.questions.map((q, idx) => (
                <div key={q.id || idx} className="border border-slate-100 bg-slate-50/30 p-4 rounded-xl">
                  <p className="text-sm font-bold text-slate-900 leading-relaxed mb-3">
                    <span className="text-blue-600 mr-1">Q{idx + 1}.</span> {q.text}
                  </p>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[q.id] === oIdx;
                      const isCorrect = q.correct === oIdx;
                      let optionStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                      
                      if (quizSubmitted) {
                        if (isCorrect) optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
                        else if (isSelected) optionStyle = "border-red-400 bg-red-50 text-red-900";
                        else optionStyle = "border-slate-100 bg-white opacity-60 text-slate-400";
                      } else if (isSelected) {
                        optionStyle = "border-slate-900 bg-slate-900 text-white font-medium shadow-sm";
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                          className={`w-full text-left p-3 text-xs rounded-xl border transition-all flex items-start gap-2 ${optionStyle} ${!quizSubmitted && 'cursor-pointer'}`}
                        >
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${isSelected ? 'border-current font-bold' : 'border-slate-300'}`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="leading-normal">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quiz Action Control Bar */}
            <div className="pt-4 border-t border-slate-100 bg-white">
              {quizSubmitted ? (
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl text-white">
                  <div className="pl-2">
                    <p className="text-xs font-semibold text-slate-400">Quiz Grading Complete</p>
                    <p className="text-lg font-black">Score: {calculateQuizScore()} / 10 ({calculateQuizScore() * 10}%)</p>
                  </div>
                  <button onClick={() => setActiveQuizContext(null)} className="bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer">
                    Close Terminal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-sm hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  Submit Answers ({Object.keys(quizAnswers).length}/10 answered)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visual Canvas Document Reader Sidebar Drawer */}
      {previewingFile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 flex flex-col justify-between animate-slideLeft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase shrink-0 ${previewingFile.type === 'pdf' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{previewingFile.type}</span>
                <h2 className="text-xl font-bold text-slate-900 truncate max-w-md">{previewingFile.title}</h2>
              </div>
              <button onClick={() => setPreviewingFile(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 rounded-2xl border border-slate-200 p-6 font-mono text-slate-700">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[100%] flex flex-col gap-6">
                <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Document Workspace Layer</span>
                  <span className="text-xs text-slate-400">Page 1 of 1</span>
                </div>

                <div className="flex flex-col gap-4 text-xs font-sans leading-relaxed text-slate-600">
                  <h3 className="text-base font-black text-slate-900 tracking-tight font-mono">{previewingFile.title}</h3>
                  <p>Document source verified locally inside sandboxed system constraints. Ready for Gemma agent mining ingestion protocols.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 bg-white">
              <button onClick={() => { setPreviewingFile(null); triggerAiAction('quiz', previewingFile.title); }} className="w-full bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl text-sm hover:bg-slate-200 transition-colors cursor-pointer">Generate Target Quiz</button>
              <button onClick={() => { setPreviewingFile(null); triggerAiAction('studyplan', previewingFile.title); }} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-slate-800 transition-colors cursor-pointer">Generate Study Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <main className="flex-1 px-8 md:px-16 max-w-5xl mx-auto w-full pt-12 pb-20">
        
        {/* Error Alert Box Banner */}
        {agentError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-1 text-xs text-red-800 animate-fadeIn">
            <p className="font-bold">⚠️ Local Agent Error Connection Intercepted</p>
            <p className="opacity-90">{agentError}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10 pb-6 border-b border-slate-100">
          <Link to="/my-units" className="flex items-center gap-3 hover:text-slate-600 transition-colors w-fit min-w-0 flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <h1 className="text-3xl font-black tracking-tight truncate">{unitName}</h1>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            {unitMaterials.length > 0 && (
              <>
                <button 
                  onClick={() => triggerAiAction('studyplan')}
                  className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-full hover:bg-slate-100 text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  📅 Generate Unit Plan via Gemma
                </button>
                <Link to={`/unit/${id}/upload`} className="bg-slate-900 text-white font-bold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors text-xs flex items-center gap-2 cursor-pointer shadow-sm">
                  Upload material
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Display Grid for generated Agent outputs (Reminders and Study Plans) */}
        {(generatedPlan || agentReminders.length > 0) && (
          <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Actionable Reminders Panel Column */}
            {agentReminders.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-200/60 p-5 rounded-2xl h-fit">
                <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  🔔 Agent System Reminders
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {agentReminders.map((reminder, idx) => (
                    <li key={idx} className="text-xs font-medium text-slate-700 flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{reminder}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Structured Study Plan Display Panel Column */}
            {generatedPlan && (
              <div className="lg:col-span-2 bg-slate-50 border border-slate-200/80 p-6 rounded-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    📖 Gemma Custom Learning Roadmap
                  </h3>
                  <button onClick={() => setGeneratedPlan(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Clear</button>
                </div>
                <div className="text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
                  {generatedPlan}
                </div>
              </div>
            )}
          </div>
        )}

        {unitMaterials.length === 0 ? (
          <div className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-gray-50/30">
            <h3 className="text-lg font-bold text-slate-800 mb-4">No materials uploaded yet for this course unit workspace.</h3>
            <Link to={`/unit/${id}/upload`} className="bg-slate-900 text-white font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-all text-sm cursor-pointer shadow-sm">Upload your first material</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Uploaded Study Materials ({unitMaterials.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unitMaterials.map((file) => (
                <div key={file.id} className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center justify-between relative hover:border-slate-200 transition-all w-full min-w-0">
                  <div onClick={() => setPreviewingFile(file)} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group pr-2">
                    <div className={`p-3 rounded-xl font-black text-[10px] uppercase shrink-0 tracking-wider ${file.type === 'pdf' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{file.type}</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight break-words group-hover:text-blue-600 transition-colors">{file.title}</h4>
                      <p className="text-[11px] font-medium text-slate-400 mt-1">Uploaded {file.uploadedAt}</p>
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setActiveMaterialMenu(activeMaterialMenu === file.id ? null : file.id);
                      }} 
                      className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>

                    {activeMaterialMenu === file.id && (
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 shadow-xl rounded-xl p-1 z-50 flex flex-col gap-0.5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            triggerAiAction('quiz', file.title);
                          }} 
                          className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          ❓ Generate Quiz
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerAiAction('studyplan', file.title);
                          }} 
                          className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          📅 Generate Plan
                        </button>
                        <div className="h-[1px] bg-slate-100 my-0.5" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm("Remove this document permanently?")) setMaterials(materials.filter(m => m.id !== file.id));
                            setActiveMaterialMenu(null);
                          }} 
                          className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      {activeMaterialMenu && <div className="fixed inset-0 z-10" onClick={() => setActiveMaterialMenu(null)} />}
    </div>
  );
}