import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';

type RequestMessage =
  | { type: 'download'; modelUrl: string }
  | { type: 'generate'; requestId: string; prompt: string; modelUrl: string };

type WorkerMessage =
  | { type: 'download-progress'; loaded: number; total?: number }
  | { type: 'ready' }
  | { type: 'response'; requestId: string; text: string }
  | { type: 'error'; requestId?: string; message: string };

let inference: LlmInference | undefined;
let loadedModelUrl: string | undefined;

function post(message: WorkerMessage) {
  self.postMessage(message);
}

async function cacheModel(modelUrl: string) {
  const cache = await caches.open('gemma-4-e2b-model');
  if (await cache.match(modelUrl)) return;

  const response = await fetch(modelUrl);
  if (!response.ok || !response.body) throw new Error('Unable to download the offline model.');

  const total = Number(response.headers.get('content-length')) || undefined;
  const reader = response.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const copy = new Uint8Array(value.byteLength);
    copy.set(value);
    chunks.push(copy.buffer);
    loaded += value.byteLength;
    post({ type: 'download-progress', loaded, total });
  }
  await cache.put(modelUrl, new Response(new Blob(chunks), { headers: { 'Content-Type': 'application/octet-stream' } }));
}

async function getInference(modelUrl: string) {
  if (inference && loadedModelUrl === modelUrl) return inference;
  await cacheModel(modelUrl);
  const genai = await FilesetResolver.forGenAiTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm',
  );
  inference = await LlmInference.createFromModelPath(genai, modelUrl);
  loadedModelUrl = modelUrl;
  post({ type: 'ready' });
  return inference;
}

self.onmessage = async ({ data }: MessageEvent<RequestMessage>) => {
  try {
    if (data.type === 'download') {
      await getInference(data.modelUrl);
      return;
    }
    const llm = await getInference(data.modelUrl);
    const text = await llm.generateResponse(data.prompt);
    post({ type: 'response', requestId: data.requestId, text });
  } catch (error) {
    post({ type: 'error', requestId: data.type === 'generate' ? data.requestId : undefined, message: error instanceof Error ? error.message : 'Offline model failed to start.' });
  }
};
