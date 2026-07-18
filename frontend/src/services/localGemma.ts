export type DownloadProgress = { loaded: number; total?: number };

const DEFAULT_MODEL_URL =
  'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.task';
const modelUrl = import.meta.env.VITE_LOCAL_MODEL_URL ?? DEFAULT_MODEL_URL;

let worker: Worker | undefined;
let requestNumber = 0;
const pending = new Map<string, { resolve: (value: string) => void; reject: (reason: Error) => void }>();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('../workers/gemma.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    if (data.type === 'response') {
      pending.get(data.requestId)?.resolve(data.text);
      pending.delete(data.requestId);
    }
    if (data.type === 'error' && data.requestId) {
      pending.get(data.requestId)?.reject(new Error(data.message));
      pending.delete(data.requestId);
    }
  };
  return worker;
}

export function downloadLocalModel(onProgress: (progress: DownloadProgress) => void): Promise<void> {
  const modelWorker = getWorker();
  return new Promise((resolve, reject) => {
    const listener = ({ data }: MessageEvent) => {
      if (data.type === 'download-progress') onProgress(data);
      if (data.type === 'ready') { cleanup(); resolve(); }
      if (data.type === 'error' && !data.requestId) { cleanup(); reject(new Error(data.message)); }
    };
    const cleanup = () => modelWorker.removeEventListener('message', listener);
    modelWorker.addEventListener('message', listener);
    modelWorker.postMessage({ type: 'download', modelUrl });
  });
}

export function generateWithLocalGemma(prompt: string): Promise<string> {
  const requestId = `gemma-${++requestNumber}`;
  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject });
    getWorker().postMessage({ type: 'generate', requestId, prompt, modelUrl });
  });
}
