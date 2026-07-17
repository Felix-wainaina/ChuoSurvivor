// src/types/unit.ts

export interface Unit {
  id: string;
  name: string;
  materialCount: number;
  theme: {
    bg: string;
    border: string;
    text: string;
    icon: string;
  };
}