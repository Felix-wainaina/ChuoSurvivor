# ChuoSurvivor 🎓
### Your AI-Powered Campus Survival Guide

ChuoSurvivor is an offline-first AI study companion built for the **Gemma 4 Hackathon**. It helps university students understand lecture content anywhere — even with no internet connection — by running Google's **Gemma 4 (e4b)** model locally through Ollama.

Built for the **Edge / On-Device Track**.

---

## 📖 Overview

Students upload a photo of their lecture notes, textbook page, or assignment. ChuoSurvivor:

1. **Explains** the content simply — in English or simplified Kiswahili
2. **Generates a short quiz** to reinforce understanding
3. **Saves everything locally**, so notes and quizzes remain accessible with zero internet connectivity, even after closing the app

All AI inference runs **entirely on-device** via Ollama — no cloud API calls, no data leaving the machine.

---

## ✨ Features

- 📷 **Image-based explanations** — upload lecture notes or textbook pages, get a simplified breakdown
- 🌍 **Bilingual output** — toggle between English and simplified Kiswahili explanations
- 📝 **Auto-generated quizzes** — reinforces what was just explained
- 💾 **Offline persistence** — saved notes and quizzes are browsable without any internet connection
- 🔒 **Privacy-first** — all inference happens locally; nothing is sent to external servers

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS v4 |
| Backend | FastAPI (Python) |
| AI Model | Gemma 4 (`gemma-4-26b-a4b-it`) via Google AI Studio |
| Offline Storage | IndexedDB (`idb-keyval`) |

---

## 📋 Prerequisites

Before running this project, make sure you have:

- [Node.js](https://nodejs.org/) (v18 or later) and npm
- [Python](https://www.python.org/) (v3.10 or later)
- [Ollama](https://ollama.com/download) installed locally
- The Gemma 4 model pulled:
  ```bash
  ollama pull gemma4:e4b
  ```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ChuoSurvivor
```

### 2. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or as shown in your terminal).

### 3. Set up the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn study_model:app --reload
```

The backend will be available at `http://localhost:8000`.

### 4. Confirm Ollama is running the model

```bash
ollama run gemma4:e4b
```

Test with a prompt like:

```
Explain Newton's First Law simply.
```

If it responds correctly, local inference is working and the app is ready to use fully offline.

---

## 📁 Project Structure

```
ChuoSurvivor/
├── frontend/          # React + Vite + Tailwind app
├── backend/           # FastAPI server, connects to Ollama
└── README.md
└── .gitignore
```

---

## 🌐 Offline Verification

To confirm the app runs fully offline:

1. Turn off wifi / enable airplane mode
2. Upload a lecture note image and generate an explanation + quiz
3. Close and reopen the app — saved notes should still load from local storage

---

## 👥 Team

| Name | Role |
|---|---|
| Felix Nduati | Frontend & Integration Lead |
| Francis Mung'ang'u | Backend / Ollama Bridge |
| Nevean Adhiambo | Prompt Engineering & Multilingual Layer |
| Baruch Marambi | Offline Storage & Persistence |

---

## 🏆 Built For

**Gemma 4 Hackathon Sprint** — Edge / On-Device Track
