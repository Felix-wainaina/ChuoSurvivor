// src/types/material.ts
export interface MaterialUploadState {
  file: File | null;
  unitId: string;
  language: 'en' | 'sw';
  isUploading: boolean;
  error: string | null;
}