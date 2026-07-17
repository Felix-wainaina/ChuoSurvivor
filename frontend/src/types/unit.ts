// src/types/unit.ts
export interface Unit {
  id: string;
  name: string;
  dateType?: 'CAT' | 'Exam';
  dateValue?: string;
  theme: { bg: string; border: string; text: string; icon: string };
  createdAt: string;
  materialCount?: number; // Added to completely erase the Type errors!
}

export interface Material {
  id: string;
  unitId: string;
  title: string;
  type: 'pdf' | 'image';
  uploadedAt: string;
  explanationText?: string;
  quizQuestions?: Array<{
    question: string;
    options: string[];
    correct_answer: string;
  }>;
}
