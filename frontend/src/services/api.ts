export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

async function getErrorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return data?.detail || `Request failed with status ${response.status}.`;
}

export async function generateExplanation(file: File, userPrompt = '', lang: 'en' | 'sw' = 'en') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_prompt', userPrompt);
  formData.append('lang', lang);

  const response = await fetch(`${API_BASE_URL}/explain`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json() as Promise<{ text: string }>;
}

export async function generateQuiz(text: string): Promise<QuizQuestion[]> {
  const response = await fetch(`${API_BASE_URL}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));

  const data = await response.json() as { quiz?: QuizQuestion[] };
  return data.quiz ?? [];
}
