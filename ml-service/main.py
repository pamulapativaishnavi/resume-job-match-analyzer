import io
import re
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

app = FastAPI(
    title="Resume-Job Match Analyzer ML Service",
    description="High-performance NLP service for ATS keyword extraction, semantic alignment, and resume structure evaluation."
)

# Allow CORS so both local dev and web client can access it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load sentence-transformers if available
try:
    from sentence_transformers import SentenceTransformer, util
    print("Loading SentenceTransformer 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("SentenceTransformer loaded successfully.")
except Exception as e:
    print(f"Notice: SentenceTransformer unavailable ({e}). Using calibrated TF-IDF similarity.")
    model = None

# Comprehensive ATS Taxonomy with canonical mapping & synonym aliases
SKILL_ALIASES = {
    # Programming Languages
    'python': ['python', 'py'],
    'javascript': ['javascript', 'js'],
    'typescript': ['typescript', 'ts'],
    'java': ['java'],
    'c++': ['c++', 'cpp', 'c plus plus'],
    'c#': ['c#', 'csharp', 'c sharp'],
    'ruby': ['ruby'],
    'php': ['php'],
    'go': ['go', 'golang'],
    'rust': ['rust'],
    'swift': ['swift'],
    'kotlin': ['kotlin'],
    'sql': ['sql'],
    'html': ['html', 'html5'],
    'css': ['css', 'css3'],
    'bash': ['bash', 'shell script', 'shell scripting', 'shell'],
    'scala': ['scala'],
    'r': ['r language', 'r programming'],

    # Frontend Technologies
    'react': ['react', 'react.js', 'reactjs'],
    'vue': ['vue', 'vue.js', 'vuejs'],
    'angular': ['angular', 'angular.js', 'angularjs'],
    'next.js': ['next.js', 'nextjs', 'next js'],
    'nuxt': ['nuxt', 'nuxt.js', 'nuxtjs'],
    'svelte': ['svelte', 'sveltekit'],
    'bootstrap': ['bootstrap'],
    'tailwind': ['tailwind', 'tailwindcss', 'tailwind css'],
    'redux': ['redux', 'redux toolkit'],
    'graphql': ['graphql'],
    'jquery': ['jquery'],
    'webpack': ['webpack'],
    'vite': ['vite', 'vite.js', 'vitejs'],
    'sass': ['sass', 'scss'],
    'material ui': ['material ui', 'mui'],

    # Backend & Database
    'node.js': ['node.js', 'nodejs', 'node js', 'node'],
    'express': ['express', 'express.js', 'expressjs'],
    'django': ['django'],
    'flask': ['flask'],
    'fastapi': ['fastapi'],
    'spring boot': ['spring boot', 'spring framework', 'spring'],
    'ruby on rails': ['ruby on rails', 'rails'],
    'asp.net': ['asp.net', '.net core', 'dotnet', '.net'],
    'mongodb': ['mongodb', 'mongo'],
    'postgresql': ['postgresql', 'postgres', 'psql'],
    'mysql': ['mysql'],
    'redis': ['redis'],
    'sqlite': ['sqlite'],
    'firebase': ['firebase'],
    'prisma': ['prisma'],
    'dynamodb': ['dynamodb', 'dynamo db'],

    # DevOps / Cloud / Infrastructure
    'aws': ['aws', 'amazon web services'],
    'azure': ['azure', 'microsoft azure'],
    'gcp': ['gcp', 'google cloud', 'google cloud platform'],
    'docker': ['docker'],
    'kubernetes': ['kubernetes', 'k8s', 'kube'],
    'git': ['git'],
    'github': ['github'],
    'gitlab': ['gitlab'],
    'jenkins': ['jenkins'],
    'terraform': ['terraform'],
    'ansible': ['ansible'],
    'nginx': ['nginx'],
    'linux': ['linux'],
    'ci/cd': ['ci/cd', 'cicd', 'continuous integration', 'ci cd'],
    'vercel': ['vercel'],
    'prometheus': ['prometheus'],
    'grafana': ['grafana'],

    # Data Science / Machine Learning / AI
    'pytorch': ['pytorch', 'torch'],
    'tensorflow': ['tensorflow', 'tf'],
    'keras': ['keras'],
    'pandas': ['pandas'],
    'numpy': ['numpy'],
    'scikit-learn': ['scikit-learn', 'sklearn', 'scikit learn'],
    'spacy': ['spacy'],
    'nltk': ['nltk'],
    'huggingface': ['huggingface', 'hugging face', 'transformers'],
    'langchain': ['langchain'],
    'deep learning': ['deep learning', 'dl'],
    'machine learning': ['machine learning', 'ml'],
    'nlp': ['nlp', 'natural language processing'],
    'llm': ['llm', 'llms', 'large language models', 'large language model'],
    'rag': ['rag', 'retrieval-augmented generation', 'retrieval augmented generation'],

    # Concepts & Methodologies
    'rest api': ['rest api', 'rest apis', 'restful api', 'restful apis', 'restful'],
    'microservices': ['microservices', 'microservice'],
    'serverless': ['serverless'],
    'agile': ['agile', 'scrum'],
    'tdd': ['tdd', 'test driven development']
}

SECTION_HEADERS = {
    'skills': [r'skills', r'technical skills', r'technical strengths', r'technologies', r'core competencies', r'expertise', r'proficiencies', r'tools'],
    'experience': [r'experience', r'work history', r'employment', r'professional background', r'career history', r'work experience', r'employment history'],
    'education': [r'education', r'academic', r'qualification', r'degree', r'academic profile', r'education background'],
    'projects': [r'projects', r'personal projects', r'academic projects', r'key projects', r'selected projects']
}

class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str

def segment_resume(text: str) -> dict:
    lines = text.split('\n')
    current_section = 'summary'
    sections = {
        'summary': [],
        'skills': [],
        'experience': [],
        'education': [],
        'projects': []
    }
    
    for line in lines:
        line_clean = line.strip()
        line_lower = line_clean.lower()
        if not line_clean:
            continue
        
        header_found = False
        for sec, patterns in SECTION_HEADERS.items():
            for pattern in patterns:
                if len(line_clean) < 35 and re.match(r'^[^a-zA-Z0-9]*' + pattern + r'[^a-zA-Z0-9]*$', line_lower):
                    current_section = sec
                    header_found = True
                    break
                elif len(line_clean) < 35 and re.search(r'\b' + pattern + r'\b', line_lower):
                    if not re.search(r'\b(and|or|with|using|in|for|of|at|the|a|an)\b', line_lower) or pattern in ['work experience', 'technical skills']:
                        current_section = sec
                        header_found = True
                        break
            if header_found:
                break
        
        if not header_found:
            sections[current_section].append(line_clean)
            
    return {k: '\n'.join(v) for k, v in sections.items()}

def extract_keywords(text: str) -> set:
    found = set()
    text_lower = text.lower()
    
    for canonical, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            escaped = re.escape(alias)
            # Match word boundary or boundary punctuation
            pattern = r'(?:^|[\s,.;:()/\-\[\]])' + escaped + r'(?:$|[\s,.;:()/\-\[\]])'
            if re.search(pattern, text_lower):
                found.add(canonical)
                break
    return found

def compute_tfidf_similarity(text1: str, text2: str) -> float:
    if not text1.strip() or not text2.strip():
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform([text1, text2])
        raw_sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        # Calibrated scaling for resume-job description TF-IDF text density
        scaled_sim = min(1.0, max(0.0, float(raw_sim) * 1.65))
        return scaled_sim
    except Exception as e:
        print(f"TF-IDF Error: {e}")
        return 0.0

def compute_semantic_similarity(text1: str, text2: str) -> float:
    if not text1.strip() or not text2.strip():
        return 0.0
    if not model:
        return compute_tfidf_similarity(text1, text2)
    try:
        emb1 = model.encode(text1, convert_to_tensor=True)
        emb2 = model.encode(text2, convert_to_tensor=True)
        sim = util.cos_sim(emb1, emb2).item()
        return max(0.0, min(1.0, float(sim)))
    except Exception as e:
        print(f"Semantic model encoding error: {e}. Falling back to TF-IDF.")
        return compute_tfidf_similarity(text1, text2)

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Resume-Job Match Analyzer ML Service",
        "engine": "SentenceTransformer (all-MiniLM-L6-v2)" if model is not None else "TF-IDF Cosine Similarity",
        "supported_skills_count": len(SKILL_ALIASES)
    }

@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    resume_text = payload.resume_text
    jd_text = payload.job_description
    
    if not resume_text.strip() or not jd_text.strip():
        raise HTTPException(status_code=400, detail="Resume text and job description must not be empty.")
        
    segmented = segment_resume(resume_text)
    
    jd_keywords = extract_keywords(jd_text)
    resume_keywords = extract_keywords(resume_text)
    
    matched_keywords = list(jd_keywords.intersection(resume_keywords))
    missing_keywords = list(jd_keywords.difference(resume_keywords))
    
    if jd_keywords:
        keyword_score = len(matched_keywords) / len(jd_keywords)
    else:
        keyword_score = 0.5
        
    overall_semantic = compute_semantic_similarity(resume_text, jd_text)
    
    skills_text = segmented['skills']
    if skills_text.strip():
        skills_sim = compute_semantic_similarity(skills_text, jd_text)
    else:
        # Penalize slightly if dedicated skills section is missing
        skills_sim = overall_semantic * 0.75
        
    exp_text = segmented['experience']
    if exp_text.strip():
        exp_sim = compute_semantic_similarity(exp_text, jd_text)
    else:
        exp_sim = overall_semantic * 0.75

    s_overall = overall_semantic * 100
    s_keyword = keyword_score * 100
    s_skills = skills_sim * 100
    s_exp = exp_sim * 100
    
    final_score = int(0.40 * s_overall + 0.30 * s_keyword + 0.15 * s_skills + 0.15 * s_exp)
    final_score = max(0, min(100, final_score))
    
    suggestions = []
    if missing_keywords:
        top_missing = missing_keywords[:5]
        suggestions.append(f"Incorporate missing key skills to align with the job description: {', '.join(top_missing)}.")
    if not segmented['skills'].strip():
        suggestions.append("Consider creating a dedicated 'Skills' section in your resume to clearly showcase your technical stack.")
    if len(segmented['experience']) < 120:
        suggestions.append("Expand on your work experience section by adding details about your achievements and technical challenges.")
    if final_score < 60:
        suggestions.append("The overall match score is low. Tailor your professional summary and experience bullet points to match the language used in the job description.")
    elif final_score >= 85:
        suggestions.append("Outstanding alignment! Your profile strongly matches this job description.")
    else:
        suggestions.append("Solid alignment. Integrating 2-3 missing skills will push your score into the top tier.")

    sections_detected = {
        "summary": len(segmented['summary'].strip()) > 15,
        "skills": len(segmented['skills'].strip()) > 10,
        "experience": len(segmented['experience'].strip()) > 40,
        "education": len(segmented['education'].strip()) > 10,
        "projects": len(segmented['projects'].strip()) > 10
    }

    return {
        "matchScore": final_score,
        "missingKeywords": sorted(missing_keywords),
        "matchedKeywords": sorted(matched_keywords),
        "breakdown": {
            "semanticScore": round(s_overall, 1),
            "keywordScore": round(s_keyword, 1),
            "skillsScore": round(s_skills, 1),
            "experienceScore": round(s_exp, 1)
        },
        "suggestions": suggestions,
        "sectionsDetected": sections_detected
    }

@app.post("/analyze-file")
async def analyze_file(file: UploadFile = File(...), job_description: str = Form(...)):
    filename = file.filename.lower()
    content = await file.read()
    
    extracted_text = ""
    if filename.endswith(".pdf"):
        if PdfReader is None:
            raise HTTPException(status_code=500, detail="PDF parser not available on server.")
        try:
            reader = PdfReader(io.BytesIO(content))
            extracted_text = "\n".join([page.extract_text() or "" for page in reader.pages])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF file: {str(e)}")
    else:
        try:
            extracted_text = content.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = content.decode("latin-1")
            
    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from uploaded file.")
        
    return analyze(AnalyzeRequest(resume_text=extracted_text, job_description=job_description))

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
