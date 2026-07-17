// src/services/api.ts

export async function uploadMaterial(file: File, userPrompt: string = "", lang: string = "en") {
  // 1. Package components securely inside a browser multi-part payload wrapper
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_prompt', userPrompt);
  formData.append('lang', lang);

  // 2. Point target directly to Francis' backend explain endpoint route
  const explanationResponse = await fetch('http://127.0.0.1:8000/explain', {
    method: 'POST',
    body: formData, 
  });

  if (!explanationResponse.ok) {
    throw new Error('Failed to parse document and compile the study summary.');
  }

  const explanationData = await explanationResponse.json();
  const generatedId = crypto.randomUUID();

  // 3. Immediately leverage the clean explanation text to formulate structural quizzes
  const quizResponse = await fetch('http://127.0.0.1:8000/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: explanationData.text }), 
  });

  let quizQuestions = [];
  if (quizResponse.ok) {
    const quizData = await quizResponse.json();
    quizQuestions = quizData.quiz || [];
  }

// src/services/api.ts (Inside the uploadMaterial return block)

// src/services/api.ts (Inside the uploadMaterial return block)

  const baseTitle = file.name.replace(/\.[^/.]+$/, "");

  // Return an object that matches the complete 'ExplanationData' schema perfectly
  return {
    id: generatedId,
    title: baseTitle,
    courseCode: baseTitle.substring(0, 3).toUpperCase(), // e.g., "WEB" or "LIN" as a dynamic placeholder
    description: explanationData.text.substring(0, 120) + "...", // Short card summary
    explanationText: explanationData.text,
    quizQuestions: quizQuestions,
    language: (lang === "sw" ? "sw" : "en") as "en" | "sw", // FIXED: Assert type as the strict literal union
    timestamp: Date.now(), // Matches Unix epoch number
    hasOfflineFile: file.type === 'application/pdf' // Matches your storage schema key exactly
  };
}