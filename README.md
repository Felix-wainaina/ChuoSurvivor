# ChuoSurvivor 🎓
### Your AI-Powered Campus Survival Guide

ChuoSurvivor is a web-based, AI-native study platform built for the **Gemma 4 Hackathon**. It helps university students navigate dense lecture content anywhere—even during total network blackouts—by combining a high-performance cloud agent with a seamless browser-side **Gemma 4 E2B** edge engine fallback.

Built for the **Autonomous Agent Track** and the **Local Language & Culture Track**.

---

## 📖 Overview

Students upload lecture notes, textbook PDFs, or assignments. ChuoSurvivor uses a **Hybrid Cloud-to-Edge AI architecture** to deliver zero-downtime tutoring:

1. **Explains** the content simply—in localized English or conversational Kiswahili.
2. **Generates a short quiz** to reinforce understanding with strict schema formatting.
3. **Architects a Day-by-Day Study Plan** tailored to the document's density.

**The Hybrid AI Magic:** When internet connectivity drops or cloud requests time out, a smart client-side router seamlessly shifts execution directly to Google's browser-optimized **Gemma 4 E2B** model running completely offline inside the user's browser storage using WebGPU.

---

## ✨ Features

- 📷 **Multimodal Document Ingestion** — Upload scanned lecture notes or text PDFs for immediate synthesis.
- 🌍 **Bilingual Tool-Calling** — Toggle between English and simplified Kiswahili explanations, matching the authentic tone of Kenyan students.
- 📝 **Dynamic JSON Quiz Generator** — Auto-generates exactly 10 non-repetitive multiple-choice questions natively.
- 🚀 **Cloud-to-Edge Routing Fallback** — Automatically switches to on-device edge inference if the backend network is unavailable.
- ⚡ **PWA Offline Persistence** — Fully functional Progressive Web App (PWA) with complete static UI caching and a background Web Worker execution system.
- 💾 **Data-Loss Prevention** — A "Save Anyway" pipeline caching materials locally into IndexedDB and `localStorage`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + TypeScript + Vite + Tailwind CSS v4 |
| **Edge AI Framework** | MediaPipe LLM Inference API (WebGPU runtime) |
| **Offline Engine** | Gemma 4 E2B (`gemma-4-E2B-it-litert-lm`) running in Web Worker |
| **Backend** | FastAPI (Python) |
| **Cloud Agent** | Gemma 4 via Google AI Studio API |
| **Offline Storage** | IndexedDB (`idb-keyval`) + Cache API |

---

## 📋 Prerequisites

Before running this project, make sure you have:

- [Node.js](https://nodejs.org/) (v18 or later) and npm
- [Python](https://www.python.org/) (v3.10 or later)
- A modern web browser with WebGPU enabled (Chrome recommended)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Felix-wainaina/ChuoSurvivor.git
cd ChuoSurvivor

### 2. Set up the frontend (Production Build / PWA Testing)
To fully verify the PWA service workers and edge AI capabilities, build and serve the production distribution folder:

```bash
cd frontend
npm install
npm run dev
```
Install a simple global server tool to run production bundles locally:

Bash
npm install -g serve
serve -s dist
Open the address provided (usually http://localhost:3000) in Chrome.

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
🌐 Offline Verification Workflow
To test the hybrid fallback engine:

Launch the frontend using serve -s dist.

Turn on "Enable Offline Study Mode (Requires ~3GB Download)" in the study workspace UI.

Wait for the loading bar to hit 100% and toggle the OFFLINE READY indicator.

Open Chrome DevTools (Inspect), navigate to the Network tab, and toggle your status to "Offline" (or pull your machine's Wi-Fi cord).

Refresh the page. The application will load immediately via Service Worker precaching.

Ask a follow-up question. The app will detect the disconnection, trigger a toast alert, and stream the generated response entirely inside the client using the browser's hardware!

---

## 👥 Team

| Name | Role |
|---|---|
| Felix Nduati | Frontend , PWA & Integration Lead |
| Francis Mung'ang'u | Backend / Ollama Bridge |
| Nevean Adhiambo | Prompt Engineering & Multilingual Layer |
| Baruch Marambi | Offline Storage & Persistence |

---

## 🏆 Built For

**Gemma 4 Hackathon Sprint** — Edge / On-Device Track
