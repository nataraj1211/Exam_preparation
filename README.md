# StudyMate AI - College Exam Preparation Assistant 🎓

> **Tagline:** *"Upload. Understand. Practice. Score."*  
> **Final Year MCA / Computer Science Degree Project**

StudyMate AI is a modern, responsive, full-stack AI-powered study platform designed for college and university students. Students upload syllabus study materials (PDF, Word DOCX, PowerPoint PPTX, or TXT), and the system automatically extracts, analyzes, and transforms them into comprehensive exam preparation dossiers, interactive RAG doubt solvers, revision flashcards, and instant-validated MCQ practice quizzes.

---

## 🌟 Key Features

### 1. Document Extraction & Multi-Format Ingestion
* **Drag & Drop Upload Interface**: Supports `.pdf`, `.docx`, `.pptx`, and `.txt` files up to 25MB.
* **Intelligent File Extractors**:
  * **PDF**: Robust parsing using `pdf-parse`.
  * **Word (.docx)**: Direct paragraph extraction with `mammoth`.
  * **PowerPoint (.pptx)**: XML slide-by-slide text extraction with `adm-zip`.
  * **Text (.txt)**: Clean UTF-8 reading and sanitization.
* **Upload Progress & Real-time Status**: Displays file name, size, type, progress bar, and status (`✓ Processing completed`).

### 2. AI Document Processing & Summarizer
* **Quick Summary**: Concise 2-3 sentence overview of the core concepts.
* **Detailed Study Notes**: In-depth explanations structured for syllabus revision.
* **Important Topics & Keywords**: Automatically identified key syllabus areas.
* **Key Definitions & Mathematical Formulas**: Highlighted terms with formulas and constraints.
* **Exam Focus**: Categorized hints and focus questions for **2 Marks**, **5 Marks**, and **10 / 16 Marks** university questions.

### 3. Ask Doubts – AI Chatbot (RAG Architecture)
* Dedicated conversational assistant scoped strictly to each uploaded document.
* **RAG (Retrieval-Augmented Generation)**: Chunks documents and scores chunks using TF-IDF / keyword relevance before synthesizing answers.
* **Document Citations**: Displays exact source excerpts and sections.
* **Exam-Oriented Prompt Chips**:
  * *"Explain this topic simply"*
  * *"Give an example"*
  * *"Explain for 2 marks"*
  * *"Explain for 16 marks"*
  * *"What are the important points for exams?"*
* **One-Click Answer Copying & Chat Clearing**.

### 4. MCQ Practice Quiz System
* **Custom Generator**:
  * Question Count: 5, 10, 15, or 20 questions
  * Difficulty: Easy, Medium, Hard, Mixed
  * Topic Scope: Entire document or specific syllabus topic
* **Interactive Test Interface**:
  * Clickable options (A, B, C, D)
  * **Instant Feedback Mode**: Select an option to immediately reveal `✓ Correct!` or `✗ Incorrect`, the correct answer, and an AI explanation.
  * **4-State Question Navigator**: 
    1. Unattempted (Gray)
    2. Current Question (Ring/Scale active)
    3. Answered (Emerald)
    4. Marked for Review (Amber)
  * Live Exam Timer and Submit Confirmation modal.

### 5. Quiz Results & Performance Analysis
* **Radial Score Meter**: Visual circular percentage chart with confetti celebration for scores $\ge 75\%$.
* **Breakdown Metrics**: Total Score, Percentage, Correct, Wrong, Skipped, and Time Elapsed.
* **Question Review**: Complete post-test review comparing student choices against correct answers with AI explanations.
* **Action Buttons**: `Retry Quiz`, `Generate New Questions`, `Back to Summary`, `Download PDF`.

### 6. Study Progress Dashboard
* Total Study Materials, Total Quizzes, Questions Attempted, Average Score, Doubts Solved.
* **Topic-Wise Proficiency Bars**:
  * Operating Systems $\to$ 82%
  * DBMS $\to$ 91%
  * Computer Networks $\to$ 74%
  * Python Programming $\to$ 86%
* Complete quiz attempt history table with date, difficulty, score, and retake actions.

### 7. Export & PDF Generation
* Generate formatted, professional PDF dossiers using `jspdf` for:
  * AI Summaries
  * Categorized 2/5/16-Mark Question Banks
  * Quiz Results and detailed answer keys
* One-click "Copy Summary" and "Copy Answer" buttons with visual clipboard checkmarks.

### 8. Global Search
* Global search across Documents, Syllabus Topics, Keywords, and MCQ Questions (`Ctrl + K` or `/`).

### 9. Dark & Light Mode
* High-tech dark mode and clean paper-white light mode with persistence in `localStorage`.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti, jsPDF |
| **Backend** | Node.js, Express.js (ES Modules), Multer, pdf-parse, mammoth, adm-zip |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **Database** | Relational In-Memory Store with atomic JSON persistence (`backend/database/database.json`) |
| **AI Service** | Pluggable AI engine supporting Google Gemini, OpenAI, and a built-in educational NLP tutor |

---

## 🚀 How to Run Locally

### Prerequisites
* Node.js v18+ (tested on Node v24.13.0)
* npm v9+

### 1. Start the Backend Server
```bash
cd backend
npm install
node server.js
```
*Backend runs on `http://localhost:5000`.*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🎓 Preloaded Demo Credentials for Viva / Evaluation

You can test immediately without creating an account or searching for a PDF file:

* Click **"Launch MCA Demo Experience"** or **"Demo Student"** on the landing page.
* Or use credentials:
  * **Email:** `student@studymate.ai`
  * **Password:** `student123`

Preloaded study materials included out-of-the-box:
1. `Operating Systems Unit 1.pdf` (Process Management, Scheduling, PCB, Deadlocks)
2. `DBMS Unit 1 - Relational Model & Architecture.pdf` (3-Schema Architecture, Codd's Rules, Relational Algebra)

---

## 🔒 Security & AI Configuration
* AI API keys are never exposed on the frontend.
* To configure an external cloud key, add to `backend/.env`:
  ```env
  AI_PROVIDER=gemini
  AI_API_KEY=your_key_here
  ```
* If no external key is provided, the **Built-in Educational Engine** takes over seamlessly, ensuring 100% uptime during exams and college demonstrations.
