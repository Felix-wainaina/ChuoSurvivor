// src/lib/storage.ts
import { get, set, del } from 'idb-keyval';

/**
 * Saves a raw PDF file/Blob directly to IndexedDB under an independent key.
 * This keeps the main text history array lightweight and avoids database bloat.
 * * @param key Unique identifier string (e.g., `pdf_${materialId}`)
 * @param file The file or Blob object retrieved from the file picker
 */
export async function savePdfToStorage(key: string, file: Blob): Promise<void> {
  try {
    // IndexedDB natively supports storing raw Blobs/Files
    await set(key, file);
  } catch (error) {
    console.error(`[Storage] Failed to save binary file to IndexedDB for key: ${key}`, error);
    throw new Error('Offline file storage allocation failed.');
  }
}

/**
 * Retrieves a stored PDF Blob from IndexedDB and converts it into a temporary 
 * Object URL that can be directly passed to HTML <iframe> or <a> tags for viewing.
 * * @param key The unique key used when the file was saved
 * @returns A temporary DOM string URL, or null if the file is not found
 */
export async function getPdfAsUrl(key: string): Promise<string | null> {
  try {
    const fileBlob: Blob | undefined = await get(key);
    
    if (!fileBlob) {
      console.warn(`[Storage] No offline file found matching key: ${key}`);
      return null;
    }
    
    // Convert the raw database Blob into an accessible object URL
    return URL.createObjectURL(fileBlob);
  } catch (error) {
    console.error(`[Storage] Failed to read or parse file from IndexedDB for key: ${key}`, error);
    return null;
  }
}

/**
 * Deletes an offline file binary from storage to free up browser space.
 * * @param key The unique key used when the file was saved
 */
export async function deletePdfFromStorage(key: string): Promise<void> {
  try {
    await del(key);
  } catch (error) {
    console.error(`[Storage] Failed to remove offline binary file for key: ${key}`, error);
  }
}

/**
 * Utility function to revoke a temporary Object URL when a student closes 
 * the document viewer, releasing browser memory allocation instantly.
 * * @param url The temporary Object URL string to clean up
 */
export function revokeStoredFileUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}