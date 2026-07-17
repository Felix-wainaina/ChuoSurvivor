// src/lib/resources.ts

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ExplanationData {
  id: string;
  courseCode: string;     // Added for unit card layout
  title: string;          // Unit/Topic name
  description: string;    // Brief summary text
  timestamp: number;
  language: 'en' | 'sw';
  hasOfflineFile: boolean;
  explanationText: string;
  quizQuestions: QuizQuestion[];
}

export const mockSavedNotes: ExplanationData[] = [
  {
    id: "note-101",
    courseCode: "SMA 2201",
    title: "Linear Algebra I",
    description: "Master matrices, systems of linear equations, vector spaces, and computer graphics transformations offline.",
    timestamp: Date.now() - 3600000 * 2,
    language: "en",
    hasOfflineFile: true,
    explanationText: `A matrix is a rectangular array of numbers arranged in rows and columns...`,
    quizQuestions: [
      {
        id: "q1",
        question: "What do 'm' and 'n' represent in an m x n matrix?",
        options: ["m = columns, n = rows", "m = rows, n = columns", "m = elements", "m = variables"],
        correctAnswer: "m = rows, n = columns"
      }
    ]
  },
  {
    id: "note-102",
    courseCode: "CCS 2210",
    title: "Misingi ya Algorithm",
    description: "Jifunze muundo wa algorithm, uchambuzi wa mfululizo wa hatua, na utatuzi wa matatizo bila mtandao.",
    timestamp: Date.now() - 3600000 * 24,
    language: "sw",
    hasOfflineFile: false,
    explanationText: `Algorithm ni mfululizo wa hatua zilizoainishwa vizuri...`,
    quizQuestions: [
      {
        id: "q3",
        question: "Algorithm ni nini?",
        options: ["Aina ya lugha", "Mfululizo wa hatua za kutatua tatizo", "Mfumo wa uendeshaji"],
        correctAnswer: "Mfululizo wa hatua za kutatua tatizo"
      }
    ]
  }
];