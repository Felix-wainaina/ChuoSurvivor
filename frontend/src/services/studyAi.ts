import { generateWithLocalGemma } from './localGemma';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
const CLOUD_TIMEOUT_MS = 8_000;

export type StudyAiResult = { text: string; activeModel: 'cloud' | 'local'; fellBack: boolean };

async function cloudResponse(prompt: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
    signal,
  });
  if (!response.ok) throw new Error(`Cloud request failed (${response.status}).`);
  const data = await response.json() as { text?: string; response?: string };
  if (!data.text && !data.response) throw new Error('Cloud response was empty.');
  return data.text ?? data.response ?? '';
}

export async function requestStudyAnswer(prompt: string): Promise<StudyAiResult> {
  if (!navigator.onLine) return { text: await generateWithLocalGemma(prompt), activeModel: 'local', fellBack: false };

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CLOUD_TIMEOUT_MS);
  try {
    return { text: await cloudResponse(prompt, controller.signal), activeModel: 'cloud', fellBack: false };
  } catch {
    return { text: await generateWithLocalGemma(prompt), activeModel: 'local', fellBack: true };
  } finally {
    window.clearTimeout(timeout);
  }
}
