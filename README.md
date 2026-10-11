# Resume–Job Match Analyzer 🎯

An intelligent, AI-powered **Resume to Job Description Match & ATS Optimization Analyzer**. Designed to help job seekers and hiring teams evaluate resume alignment against job descriptions using dense semantic embeddings, TF-IDF cosine similarity, section quality audits, and technical keyword gap analysis.

---

## ✨ Features

- **Hybrid Semantic & ATS Scoring**:
  - Combines contextual semantic similarity (SentenceTransformer / TF-IDF) with keyword overlap.
  - Granular breakdown across:
    - **Overall Context / Semantic Fit**
    - **ATS Keyword Overlap**
    - **Technical Skills Depth**
    - **Work Experience Relevance**
- **ATS Keyword Gap Identification**:
  - Scans across 6 core tech domains (Languages, Frontend, Backend & Databases, DevOps & Cloud, AI/ML, Architecture/Methodologies).
  - Highlights matched skills (in emerald) vs. missing target skills (in rose) with 1-click clipboard copy.
- **Resume Section Quality Audit**:
  - Automatically segments and checks for standard resume sections: *Summary*, *Skills*, *Experience*, *Education*, and *Projects*.
- **Client-Side Document Parsing**:
  - Instant drag-and-drop parsing for **PDF** (via PDF.js) and **TXT** files.
  - Real-time word and character counters.
- **One-Click Realistic Presets**:
  - Pre-loaded with test profiles: *Senior Full-Stack Engineer*, *AI/ML Data Scientist*, and *Cloud & DevOps Architect*.
- **Modern Glassmorphic Dark UI**:
  - Responsive design with animated circular SVG match score gauge, glowing badges, and clean report printing/export.
- **Resilient Offline Fallback**:
  - Automatically falls back to a high-performance client-side NLP engine if the backend microservice is offline or booting up.

---

## 🏗️ Architecture

```
Resume–Job Match Analyzer/
├── ml-service/
│   ├── main.py              # FastAPI microservice (TF-IDF, SentenceTransformers, section segmentation)
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Python virtual environment
├── index.html               # Web client structure & SVG score gauge
├── style.css                # Glassmorphic dark design system & responsive layout
├── app.js                   # Client controller, PDF parser, presets & visualizer
├── .gitignore               # Git ignore rules for venv, caches, and temp files
└── README.md                # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Start the FastAPI ML Service

In a terminal:
```bash
cd ml-service
# Activate virtual environment:
.\venv\Scripts\Activate.ps1   # (Windows PowerShell)

# Start the API server:
uvicorn main:app --reload --port 8000
```
The ML API will be accessible at:
- **API Root**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### 2. Launch the Web Client

Open the project folder in VS Code and use **Live Server** (configured for port `5501`):
1. Open `index.html`.
2. Click **"Go Live"** in the VS Code status bar (or open `http://127.0.0.1:5501` in your browser).
3. The client will automatically connect to `http://127.0.0.1:8000` (showing a green status badge) or operate using its built-in local engine if the ML service is not yet started.

---

## 📊 Scoring Formula

The match score (0–100%) is computed using weighted multi-factor alignment:

$$\text{Final Score} = 0.40 \times \text{Semantic} + 0.30 \times \text{Keyword Overlap} + 0.15 \times \text{Skills Section} + 0.15 \times \text{Experience Section}$$

---

## 🛠️ API Reference

### `POST /analyze`
Accepts a JSON payload containing `resume_text` and `job_description`.

**Request**:
```json
{
  "resume_text": "Experienced Python developer with React, Docker, and PostgreSQL...",
  "job_description": "Looking for a Python backend engineer with Docker, Kubernetes, and AWS..."
}
```

**Response**:
```json
{
  "matchScore": 76,
  "matchedKeywords": ["docker", "python"],
  "missingKeywords": ["aws", "kubernetes"],
  "breakdown": {
    "semanticScore": 78.2,
    "keywordScore": 50.0,
    "skillsScore": 82.0,
    "experienceScore": 74.5
  },
  "suggestions": [
    "Incorporate missing key skills to align with the job description: aws, kubernetes."
  ]
}
```
