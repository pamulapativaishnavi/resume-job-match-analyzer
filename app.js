/**
 * Resume–Job Match Analyzer
 * Client Logic, PDF Parser, Presets, and Scoring Visualizer
 */

// Configure PDF.js worker
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const API_BASE_URL = 'http://127.0.0.1:8000';

// Comprehensive technical skill taxonomy matching backend ML model
// Comprehensive ATS Taxonomy with canonical mapping & synonym aliases
const SKILL_ALIASES = {
  // Programming Languages
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

  // Frontend Technologies
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

  // Backend & Database
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

  // DevOps / Cloud / Infrastructure
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

  // Data Science / Machine Learning / AI
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

  // Concepts & Methodologies
  'rest api': ['rest api', 'rest apis', 'restful api', 'restful apis', 'restful'],
  'microservices': ['microservices', 'microservice'],
  'serverless': ['serverless'],
  'agile': ['agile', 'scrum'],
  'tdd': ['tdd', 'test driven development']
};


// Presets data
const PRESETS = {
  fullstack: {
    resume: `Nishanth Kumar
Full-Stack Software Engineer
Email: nishanth@example.com | Portfolio: github.com/nishanth-dev

PROFESSIONAL SUMMARY
Results-driven Full-Stack Engineer with 4+ years of experience designing, scaling, and maintaining web applications. Proven track record in TypeScript, React, Node.js, and cloud deployments. Passionate about performant user experiences and resilient REST APIs.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript, Python, SQL, HTML, CSS
- Frontend: React, Redux, Next.js, Tailwind, Vite, Webpack
- Backend & DB: Node.js, Express, PostgreSQL, MongoDB, Redis, Prisma
- Cloud & DevOps: Docker, AWS (S3, EC2), Git, GitHub, Linux, CI/CD
- Methodologies: Agile, Scrum, REST API, TDD, Microservices

WORK EXPERIENCE
Senior Frontend / Full-Stack Engineer | TechCorp Labs (2022 - Present)
- Architected enterprise React and TypeScript dashboard used by 85k monthly active users.
- Designed scalable Node.js microservices with Express and PostgreSQL, reducing API latency by 34%.
- Integrated Redis caching layer for heavy analytics queries, improving response time to under 120ms.
- Containerized development and deployment workflows using Docker and configured automated GitHub Actions CI/CD pipelines.

Software Developer | Innovate Web Solutions (2020 - 2022)
- Built interactive single-page web applications with React, Next.js, and Tailwind CSS.
- Developed backend REST APIs with Node.js and MongoDB, handling authentication with JWT.
- Collaborated in an Agile Scrum team to deliver sprint goals ahead of schedule.

EDUCATION
Bachelor of Science in Computer Science | State University (2016 - 2020)

PROJECTS
- E-Commerce Microservices Engine: Built with React, Node.js, Docker, and Redis with Stripe payments.
- AI Resume Parser: Developed interactive web tool using TypeScript and modern REST APIs.`,

    jd: `Senior Full-Stack Engineer (React, Node.js, Cloud)

About the Role:
We are seeking a talented Senior Full-Stack Engineer to lead the design and development of our next-generation cloud platform. You will build cutting-edge user interfaces and high-throughput backend services.

Key Responsibilities:
- Build modern, high-performance web applications using React, TypeScript, and Next.js.
- Architect resilient microservices using Node.js, Express, and PostgreSQL.
- Implement efficient caching and message queues with Redis.
- Collaborate with cloud teams to deploy containerized services on Docker, Kubernetes, and AWS.
- Design and integrate REST API and GraphQL endpoints.
- Drive engineering best practices including TDD, CI/CD automation, and code reviews in an Agile environment.

Requirements & Qualifications:
- 3+ years experience with React, TypeScript, and modern frontend frameworks.
- Strong backend experience with Node.js, Express, PostgreSQL, and Redis.
- Solid understanding of Docker, Kubernetes, and AWS cloud infrastructure.
- Familiarity with GraphQL, Microservices architecture, and CI/CD pipelines.
- Excellent communication and problem-solving skills.`
  },

  aiml: {
    resume: `Dr. Anya Sharma
Machine Learning Engineer & Data Scientist
Email: anya@example.com | GitHub: github.com/anyasharma-ml

PROFESSIONAL SUMMARY
Applied AI/ML Engineer with 3+ years of expertise in Natural Language Processing (NLP), Deep Learning, and predictive modeling. Experienced in taking models from research notebooks to production REST APIs using Python, PyTorch, and FastAPI.

TECHNICAL SKILLS
- Languages: Python, SQL, R, Bash
- AI / ML / DL: PyTorch, TensorFlow, HuggingFace, Scikit-Learn, Pandas, NumPy, NLP, Deep Learning, LLM, RAG
- MLOps & Backend: FastAPI, Flask, Docker, Git, Linux, PostgreSQL
- Data Tools: Tableau, Matplotlib, Seaborn

WORK EXPERIENCE
Machine Learning Specialist | Cognitive AI Labs (2022 - Present)
- Developed transformer-based NLP retrieval systems (RAG) using HuggingFace and LangChain.
- Fine-tuned open-source LLMs using PyTorch, improving domain query accuracy by 22%.
- Built high-speed model inference microservices with FastAPI and Docker on Linux GPU servers.
- Automated data pipelines and preprocessing workflows using Pandas and NumPy.

Data Science Associate | DataSphere Analytics (2020 - 2022)
- Implemented classification and regression models using Scikit-Learn and SQL.
- Designed customer churn prediction pipeline, saving $250K in customer retention.

EDUCATION
Master of Science in Artificial Intelligence | Tech Institute (2018 - 2020)
Bachelor of Technology in Computer Engineering (2014 - 2018)

PROJECTS
- Semantic Search Engine: Built using Sentence Transformers, PyTorch, and FastAPI with vector indexing.
- Clinical NLP NER Extractor: Extracted biomedical entities with 92% F1 score.`,

    jd: `Senior Machine Learning & Generative AI Engineer

Role Overview:
Join our AI team to pioneer next-generation Large Language Model (LLM) and NLP solutions. You will develop, fine-tune, and deploy state-of-the-art models for enterprise automation.

Key Responsibilities:
- Design and implement end-to-end NLP and Deep Learning pipelines using Python, PyTorch, and HuggingFace.
- Build production Retrieval-Augmented Generation (RAG) systems and LLM agent frameworks with LangChain.
- Package and deploy inference endpoints with FastAPI, Docker, and Kubernetes.
- Train and evaluate predictive models using Scikit-Learn, Pandas, and NumPy.
- Work closely with software engineers to integrate AI models into microservices architectures.

Qualifications:
- Bachelor's or Master's in Computer Science, AI, or related field.
- Proficiency in Python, PyTorch, HuggingFace, and Scikit-Learn.
- Experience with RAG, LLM fine-tuning, and LangChain.
- Solid knowledge of Docker, FastAPI, Git, and Linux environments.
- Kubernetes and AWS MLOps experience is a strong plus.`
  },

  devops: {
    resume: `Marcus Vance
DevOps & Cloud Infrastructure Engineer
Email: marcus.vance@example.com | LinkedIn: linkedin.com/in/marcus-vance

PROFESSIONAL SUMMARY
DevOps Engineer with 5 years of experience managing multi-cloud platforms, infrastructure-as-code, and resilient CI/CD pipelines. Certified Kubernetes Administrator (CKA) and AWS Solutions Architect.

TECHNICAL SKILLS
- Cloud: AWS, GCP, Azure
- Containers & Orchestration: Docker, Kubernetes, Helm
- IaC & Automation: Terraform, Ansible, Bash, Shell, Linux
- CI/CD & Monitoring: Jenkins, GitHub Actions, Prometheus, Grafana, Nginx
- Scripting & APIs: Python, Go, Git

WORK EXPERIENCE
Lead Cloud DevOps Engineer | CloudScale Systems (2021 - Present)
- Designed and maintained production AWS infrastructure using Terraform and Ansible.
- Managed multi-cluster Kubernetes deployments hosting 120+ microservices.
- Built automated CI/CD pipelines using Jenkins and GitHub Actions, cutting release cycles by 50%.
- Implemented observability stack with Prometheus and Grafana for real-time alerting.

Systems Administrator | NetCore Infrastructure (2018 - 2021)
- Managed Linux and Nginx server clusters with 99.98% uptime.
- Automated daily backup and maintenance scripts in Bash and Python.

EDUCATION
B.S. in Information Systems & Networking (2014 - 2018)

PROJECTS
- Multi-Region AWS Terraform Blueprint: High-availability VPC, EKS, and RDS infrastructure.
- Zero-Downtime Canary Deployment Pipeline: Kubernetes and ArgoCD automation.`,

    jd: `Lead Cloud & DevOps Infrastructure Architect

Job Summary:
We are looking for a Senior DevOps Engineer to lead our cloud transformation, CI/CD automation, and Kubernetes orchestration strategies.

Key Responsibilities:
- Architect and manage scalable cloud infrastructure across AWS and GCP using Terraform.
- Oversee container orchestration using Docker, Kubernetes, and Helm.
- Establish robust CI/CD delivery pipelines using Jenkins and GitHub Actions.
- Ensure 24/7 observability and monitoring with Prometheus, Grafana, and ELK Stack.
- Automate configuration management using Ansible and Python scripting.
- Champion zero-trust cloud security and GitOps practices.

Required Skills:
- 4+ years in DevOps, SRE, or Cloud Engineering.
- Mastery of AWS, Docker, Kubernetes, and Terraform.
- Strong scripting skills in Python and Bash / Linux.
- Hands-on experience with Prometheus, Grafana, and CI/CD pipelines.
- GCP or Azure knowledge is preferred.`
  }
};

// DOM Elements
const serviceStatusPill = document.getElementById('service-status-pill');
const serviceStatusText = document.getElementById('service-status-text');

const tabUploadBtn = document.getElementById('tab-upload-btn');
const tabPasteBtn = document.getElementById('tab-paste-btn');
const tabUploadContent = document.getElementById('tab-upload');
const tabPasteContent = document.getElementById('tab-paste');

const resumeFileInput = document.getElementById('resume-file-input');
const resumeDropzone = document.getElementById('resume-dropzone');
const fileInfoBadge = document.getElementById('file-info-badge');
const uploadedFileName = document.getElementById('uploaded-file-name');
const btnRemoveFile = document.getElementById('btn-remove-file');
const resumeUploadPreview = document.getElementById('resume-upload-preview');
const resumeUploadMeta = document.getElementById('resume-upload-meta');

const resumeTextInput = document.getElementById('resume-text-input');
const resumeWordCount = document.getElementById('resume-word-count');
const jdTextInput = document.getElementById('jd-text-input');
const jdWordCount = document.getElementById('jd-word-count');

const btnSampleResume = document.getElementById('btn-sample-resume');
const btnSampleJd = document.getElementById('btn-sample-jd');
const btnClearAll = document.getElementById('btn-clear-all');
const btnAnalyze = document.getElementById('btn-analyze');
const btnPrintReport = document.getElementById('btn-print-report');

const loadingOverlay = document.getElementById('loading-overlay');
const loadingStepTitle = document.getElementById('loading-step-title');
const loadingStepDesc = document.getElementById('loading-step-desc');
const stepperProgressBar = document.getElementById('stepper-progress-bar');

const resultsSection = document.getElementById('results-section');
const scoreCircleFill = document.getElementById('score-circle-fill');
const finalScoreValue = document.getElementById('final-score-value');
const scoreVerdictBadge = document.getElementById('score-verdict-badge');
const scoreVerdictSummary = document.getElementById('score-verdict-summary');

const metricSemanticVal = document.getElementById('metric-semantic-val');
const barSemantic = document.getElementById('bar-semantic');
const metricKeywordVal = document.getElementById('metric-keyword-val');
const barKeyword = document.getElementById('bar-keyword');
const metricSkillsVal = document.getElementById('metric-skills-val');
const barSkills = document.getElementById('bar-skills');
const metricExpVal = document.getElementById('metric-exp-val');
const barExp = document.getElementById('bar-exp');

const matchedKeywordsContainer = document.getElementById('matched-keywords-container');
const missingKeywordsContainer = document.getElementById('missing-keywords-container');
const matchedCount = document.getElementById('matched-count');
const missingCount = document.getElementById('missing-count');

const recommendationsList = document.getElementById('recommendations-list');

let isBackendOnline = false;

// ==========================================================================
// Initialization & Backend Health Check
// ==========================================================================
async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/docs`, { method: 'HEAD', mode: 'cors' });
    if (res.ok || res.status === 200 || res.status === 404 || res.type === 'opaque') {
      setBackendStatus(true);
      return;
    }
  } catch (err) {
    // try GET health or docs
    try {
      const res2 = await fetch(`${API_BASE_URL}/`, { method: 'GET', mode: 'cors' });
      if (res2.ok) {
        setBackendStatus(true);
        return;
      }
    } catch (e2) {
      // Backend not yet running
    }
  }
  setBackendStatus(false);
}

function setBackendStatus(online) {
  isBackendOnline = online;
  serviceStatusPill.className = 'status-pill ' + (online ? 'status-online' : 'status-fallback');
  serviceStatusText.textContent = online 
    ? 'ML Engine Online (FastAPI)' 
    : 'Local Engine Active (Auto-Fallback)';
}

// Periodically check backend
checkBackendHealth();
setInterval(checkBackendHealth, 8000);

// ==========================================================================
// Tabs & Word Counters
// ==========================================================================
tabUploadBtn.addEventListener('click', () => switchTab('upload'));
tabPasteBtn.addEventListener('click', () => switchTab('paste'));

function switchTab(tab) {
  if (tab === 'upload') {
    tabUploadBtn.classList.add('active');
    tabPasteBtn.classList.remove('active');
    tabUploadContent.classList.add('active');
    tabPasteContent.classList.remove('active');
    if (!resumeUploadPreview.value.trim() && resumeTextInput.value.trim()) {
      resumeUploadPreview.value = resumeTextInput.value.trim();
      updateWordCount(resumeUploadPreview, resumeUploadMeta);
    }
  } else {
    tabPasteBtn.classList.add('active');
    tabUploadBtn.classList.remove('active');
    tabPasteContent.classList.add('active');
    tabUploadContent.classList.remove('active');
    if (!resumeTextInput.value.trim() && resumeUploadPreview.value.trim()) {
      resumeTextInput.value = resumeUploadPreview.value.trim();
      updateWordCount(resumeTextInput, resumeWordCount);
    }
  }
}

function updateWordCount(textarea, counterElem) {
  const text = textarea.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const chars = text.length;
  counterElem.textContent = `${words} words (${chars} chars)`;
}

resumeTextInput.addEventListener('input', () => updateWordCount(resumeTextInput, resumeWordCount));
resumeUploadPreview.addEventListener('input', () => updateWordCount(resumeUploadPreview, resumeUploadMeta));
jdTextInput.addEventListener('input', () => updateWordCount(jdTextInput, jdWordCount));

// ==========================================================================
// Presets Handling
// ==========================================================================
document.querySelectorAll('.preset-chip[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-preset');
    const preset = PRESETS[key];
    if (!preset) return;

    // Switch to paste tab and fill
    switchTab('paste');
    resumeTextInput.value = preset.resume;
    jdTextInput.value = preset.jd;
    updateWordCount(resumeTextInput, resumeWordCount);
    updateWordCount(jdTextInput, jdWordCount);

    showToast(`Loaded "${btn.textContent.trim()}" preset.`);
  });
});

btnSampleResume.addEventListener('click', () => {
  resumeTextInput.value = PRESETS.fullstack.resume;
  updateWordCount(resumeTextInput, resumeWordCount);
  showToast('Sample Resume inserted.');
});

btnSampleJd.addEventListener('click', () => {
  jdTextInput.value = PRESETS.fullstack.jd;
  updateWordCount(jdTextInput, jdWordCount);
  showToast('Sample Job Description inserted.');
});

btnClearAll.addEventListener('click', () => {
  resumeTextInput.value = '';
  resumeUploadPreview.value = '';
  jdTextInput.value = '';
  fileInfoBadge.classList.add('hidden');
  resumeFileInput.value = '';
  updateWordCount(resumeTextInput, resumeWordCount);
  updateWordCount(resumeUploadPreview, resumeUploadMeta);
  updateWordCount(jdTextInput, jdWordCount);
  resultsSection.classList.add('hidden');
  showToast('Cleared all inputs.');
});

// ==========================================================================
// File Upload & PDF Extraction
// ==========================================================================
resumeDropzone.addEventListener('click', (e) => {
  if (e.target !== btnRemoveFile && !btnRemoveFile.contains(e.target)) {
    resumeFileInput.click();
  }
});

resumeFileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFileUpload(e.target.files[0]);
  }
});

// Drag and drop events
['dragenter', 'dragover'].forEach(eventName => {
  resumeDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    resumeDropzone.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  resumeDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    resumeDropzone.classList.remove('drag-over');
  });
});

resumeDropzone.addEventListener('drop', (e) => {
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFileUpload(e.dataTransfer.files[0]);
  }
});

btnRemoveFile.addEventListener('click', (e) => {
  e.stopPropagation();
  resumeFileInput.value = '';
  fileInfoBadge.classList.add('hidden');
  resumeUploadPreview.value = '';
  updateWordCount(resumeUploadPreview, resumeUploadMeta);
});

async function handleFileUpload(file) {
  uploadedFileName.textContent = file.name;
  fileInfoBadge.classList.remove('hidden');

  const ext = file.name.split('.').pop().toLowerCase();
  
  if (ext === 'pdf') {
    showToast('Extracting text from PDF...');
    try {
      const text = await extractTextFromPDF(file);
      resumeUploadPreview.value = text;
      updateWordCount(resumeUploadPreview, resumeUploadMeta);
      showToast('PDF parsed successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error reading PDF file. Try pasting text directly.');
    }
  } else if (ext === 'txt') {
    const reader = new FileReader();
    reader.onload = (e) => {
      resumeUploadPreview.value = e.target.result;
      updateWordCount(resumeUploadPreview, resumeUploadMeta);
      showToast('Text file loaded!');
    };
    reader.readAsText(file);
  } else {
    // For DOCX or others, attempt text read or guide user
    const reader = new FileReader();
    reader.onload = (e) => {
      resumeUploadPreview.value = e.target.result || '';
      updateWordCount(resumeUploadPreview, resumeUploadMeta);
      showToast('Document loaded!');
    };
    reader.readAsText(file);
  }
}

async function extractTextFromPDF(file) {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js library not loaded');
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(' ') + '\n\n';
  }

  return fullText.trim();
}

// ==========================================================================
// Local Processing Engine (Fallback & Instant Analysis)
// ==========================================================================
function localSegmentResume(text) {
  const lines = text.split('\n');
  let currentSection = 'summary';
  const sections = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: []
  };

  const headers = {
    skills: [/skills/i, /technical skills/i, /technologies/i, /competencies/i, /proficiencies/i],
    experience: [/experience/i, /work history/i, /employment/i, /career history/i],
    education: [/education/i, /academic/i, /degree/i],
    projects: [/projects/i, /portfolio/i]
  };

  for (const line of lines) {
    const clean = line.trim();
    if (!clean) continue;
    let foundHeader = false;

    if (clean.length < 40) {
      for (const [sec, regexes] of Object.entries(headers)) {
        for (const regex of regexes) {
          if (regex.test(clean)) {
            currentSection = sec;
            foundHeader = true;
            break;
          }
        }
        if (foundHeader) break;
      }
    }

    if (!foundHeader) {
      sections[currentSection].push(clean);
    }
  }

  return {
    summary: sections.summary.join('\n'),
    skills: sections.skills.join('\n'),
    experience: sections.experience.join('\n'),
    education: sections.education.join('\n'),
    projects: sections.projects.join('\n')
  };
}

function localExtractKeywords(text) {
  const found = new Set();
  const lower = text.toLowerCase();
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    for (const alias of aliases) {
      const pattern = new RegExp(`(^|[^a-zA-Z0-9_#+.])${escapeRegExp(alias)}($|[^a-zA-Z0-9_#+.])`, 'i');
      if (pattern.test(lower)) {
        found.add(canonical);
        break;
      }
    }
  }
  return found;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function localCosineSimilarity(text1, text2) {
  if (!text1.trim() || !text2.trim()) return 0;
  const words1 = text1.toLowerCase().match(/[a-z0-9+#.]+/g) || [];
  const words2 = text2.toLowerCase().match(/[a-z0-9+#.]+/g) || [];

  const freq1 = {};
  const freq2 = {};
  const allWords = new Set([...words1, ...words2]);

  words1.forEach(w => freq1[w] = (freq1[w] || 0) + 1);
  words2.forEach(w => freq2[w] = (freq2[w] || 0) + 1);

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const w of allWords) {
    const v1 = freq1[w] || 0;
    const v2 = freq2[w] || 0;
    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

function runLocalAnalysis(resumeText, jdText) {
  const segmented = localSegmentResume(resumeText);
  const jdKeywords = localExtractKeywords(jdText);
  const resumeKeywords = localExtractKeywords(resumeText);

  const matched = [...jdKeywords].filter(k => resumeKeywords.has(k)).sort();
  const missing = [...jdKeywords].filter(k => !resumeKeywords.has(k)).sort();

  const keywordScore = jdKeywords.size > 0 ? (matched.length / jdKeywords.size) : 0.5;
  const overallSemantic = Math.min(1.0, localCosineSimilarity(resumeText, jdText) * 1.35);

  const skillsSim = segmented.skills.trim() 
    ? Math.min(1.0, localCosineSimilarity(segmented.skills, jdText) * 1.4) 
    : overallSemantic;

  const expSim = segmented.experience.trim() 
    ? Math.min(1.0, localCosineSimilarity(segmented.experience, jdText) * 1.3) 
    : overallSemantic;

  const sOverall = overallSemantic * 100;
  const sKeyword = keywordScore * 100;
  const sSkills = skillsSim * 100;
  const sExp = expSim * 100;

  const finalScore = Math.max(0, Math.min(100, Math.round(
    0.40 * sOverall + 0.30 * sKeyword + 0.15 * sSkills + 0.15 * sExp
  )));

  const suggestions = [];
  if (missing.length > 0) {
    suggestions.push(`Integrate missing high-priority target skills: ${missing.slice(0, 5).join(', ')}.`);
  }
  if (!segmented.skills.trim()) {
    suggestions.push('Create a dedicated "Technical Skills" section so ATS parsers can categorize your stack accurately.');
  }
  if (segmented.experience.length < 150) {
    suggestions.push('Elaborate on your Professional Experience with quantifiable metrics and achievements.');
  }
  if (finalScore < 60) {
    suggestions.push('Tailor resume keywords and terminology to mirror the phrasing in the job description.');
  } else if (finalScore >= 80) {
    suggestions.push('Excellent profile match! Your technical competencies align strongly with the job posting.');
  } else {
    suggestions.push('Solid baseline match. Adding 2-3 specific missing tools will elevate your score into the top tier.');
  }

  return {
    matchScore: finalScore,
    matchedKeywords: matched,
    missingKeywords: missing,
    breakdown: {
      semanticScore: Math.round(sOverall * 10) / 10,
      keywordScore: Math.round(sKeyword * 10) / 10,
      skillsScore: Math.round(sSkills * 10) / 10,
      experienceScore: Math.round(sExp * 10) / 10
    },
    suggestions,
    sectionsDetected: {
      summary: segmented.summary.trim().length > 20,
      skills: segmented.skills.trim().length > 10,
      experience: segmented.experience.trim().length > 30,
      education: segmented.education.trim().length > 10,
      projects: segmented.projects.trim().length > 10
    }
  };
}

// ==========================================================================
// Analysis Execution & Stepper Animation
// ==========================================================================
btnAnalyze.addEventListener('click', async () => {
  // Determine active resume text
  let resumeText = '';
  if (tabUploadContent.classList.contains('active')) {
    resumeText = resumeUploadPreview.value.trim() || resumeTextInput.value.trim();
  } else {
    resumeText = resumeTextInput.value.trim() || resumeUploadPreview.value.trim();
  }

  const jdText = jdTextInput.value.trim();

  if (!resumeText) {
    showToast('Please provide your resume text or upload a document.');
    return;
  }
  if (!jdText) {
    showToast('Please paste the target job description.');
    return;
  }

  // Show Loading Stepper
  loadingOverlay.classList.remove('hidden');
  updateLoadingStep('Extracting Text & Entities...', 'Analyzing resume structure and keyword density', 25);

  await new Promise(r => setTimeout(r, 400));
  updateLoadingStep('Computing Hybrid Similarities...', 'Applying TF-IDF and semantic vector embeddings', 65);

  let resultData = null;

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText, job_description: jdText })
    });

    if (response.ok) {
      resultData = await response.json();
      setBackendStatus(true);
    } else {
      throw new Error('Backend returned status ' + response.status);
    }
  } catch (err) {
    console.warn('Backend unavailable, using local high-performance engine:', err);
    resultData = runLocalAnalysis(resumeText, jdText);
  }

  updateLoadingStep('Finalizing ATS Gap Report...', 'Synthesizing recommendations and checklist', 95);
  await new Promise(r => setTimeout(r, 350));

  // Hide loading
  loadingOverlay.classList.add('hidden');

  // Render results
  renderResults(resultData, resumeText);
});

function updateLoadingStep(title, desc, progress) {
  loadingStepTitle.textContent = title;
  loadingStepDesc.textContent = desc;
  stepperProgressBar.style.width = `${progress}%`;
}

// ==========================================================================
// Render Results
// ==========================================================================
function renderResults(data, resumeText) {
  resultsSection.classList.remove('hidden');

  // Smooth scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const score = data.matchScore || 0;

  // Animate Circular Gauge
  animateScoreGauge(score);

  // Verdict Badge
  scoreVerdictBadge.className = 'verdict-badge';
  if (score >= 80) {
    scoreVerdictBadge.classList.add('badge-strong');
    scoreVerdictBadge.textContent = '🌟 Strong Match';
    scoreVerdictSummary.textContent = 'High qualification alignment. Your profile matches key ATS requirements closely.';
  } else if (score >= 60) {
    scoreVerdictBadge.classList.add('badge-moderate');
    scoreVerdictBadge.textContent = '⚡ Moderate Match';
    scoreVerdictSummary.textContent = 'Good baseline match. Addressing missing keywords will significantly boost ATS screening.';
  } else {
    scoreVerdictBadge.classList.add('badge-low');
    scoreVerdictBadge.textContent = '⚠️ Low Match';
    scoreVerdictSummary.textContent = 'Substantial gap detected. Tailor your skills and experience bullet points to the job description.';
  }

  // Breakdown Bars
  const breakdown = data.breakdown || {};
  animateBar(barSemantic, metricSemanticVal, breakdown.semanticScore ?? score);
  animateBar(barKeyword, metricKeywordVal, breakdown.keywordScore ?? score);
  animateBar(barSkills, metricSkillsVal, breakdown.skillsScore ?? score);
  animateBar(barExp, metricExpVal, breakdown.experienceScore ?? score);

  // Matched Keywords
  const matched = data.matchedKeywords || [];
  matchedCount.textContent = matched.length;
  matchedKeywordsContainer.innerHTML = '';
  if (matched.length === 0) {
    matchedKeywordsContainer.innerHTML = '<p class="empty-tags-hint">No common technical keywords identified yet.</p>';
  } else {
    matched.forEach(kw => {
      const tag = document.createElement('span');
      tag.className = 'keyword-tag tag-matched';
      tag.innerHTML = `<span>✓</span> <span>${escapeHtml(kw)}</span>`;
      matchedKeywordsContainer.appendChild(tag);
    });
  }

  // Missing Keywords
  const missing = data.missingKeywords || [];
  missingCount.textContent = missing.length;
  missingKeywordsContainer.innerHTML = '';
  if (missing.length === 0) {
    missingKeywordsContainer.innerHTML = '<p class="empty-tags-hint">🎉 No major target skills missing!</p>';
  } else {
    missing.forEach(kw => {
      const tag = document.createElement('span');
      tag.className = 'keyword-tag tag-missing';
      tag.title = 'Click to copy keyword';
      tag.innerHTML = `<span>${escapeHtml(kw)}</span> <span class="tag-icon-action">+</span>`;
      tag.addEventListener('click', () => {
        navigator.clipboard.writeText(kw);
        showToast(`Copied "${kw}" to clipboard!`);
      });
      missingKeywordsContainer.appendChild(tag);
    });
  }

  // Recommendations
  recommendationsList.innerHTML = '';
  const suggestions = data.suggestions || [];
  if (suggestions.length === 0) {
    suggestions.push('Your resume is well aligned with the job description. Keep your quantifiable impact clear.');
  }
  suggestions.forEach(tip => {
    const li = document.createElement('li');
    li.className = 'recommendation-item';
    li.innerHTML = `
      <span class="rec-bullet">✦</span>
      <span>${escapeHtml(tip)}</span>
    `;
    recommendationsList.appendChild(li);
  });

  lastAnalysisData = data;

  // Section Structure Audit
  const secDetected = data.sectionsDetected || (() => {
    const segmented = localSegmentResume(resumeText);
    return {
      summary: segmented.summary.trim().length > 15,
      skills: segmented.skills.trim().length > 10,
      experience: segmented.experience.trim().length > 40,
      education: segmented.education.trim().length > 10,
      projects: segmented.projects.trim().length > 10
    };
  })();

  updateChecklistItem('chk-summary', 'status-summary', secDetected.summary);
  updateChecklistItem('chk-skills', 'status-skills', secDetected.skills);
  updateChecklistItem('chk-experience', 'status-experience', secDetected.experience);
  updateChecklistItem('chk-education', 'status-education', secDetected.education);
  updateChecklistItem('chk-projects', 'status-projects', secDetected.projects);
}

function animateScoreGauge(targetScore) {
  const radius = 74;
  const circumference = 2 * Math.PI * radius; // ~465
  const offset = circumference - (targetScore / 100) * circumference;

  scoreCircleFill.style.strokeDasharray = `${circumference}`;
  scoreCircleFill.style.strokeDashoffset = `${offset}`;

  // Color stroke based on tier
  if (targetScore >= 80) {
    scoreCircleFill.style.stroke = 'var(--emerald-400)';
  } else if (targetScore >= 60) {
    scoreCircleFill.style.stroke = 'var(--amber-400)';
  } else {
    scoreCircleFill.style.stroke = 'var(--rose-400)';
  }

  // Count up animation
  let current = 0;
  const stepTime = Math.max(10, Math.floor(1000 / (targetScore || 1)));
  const timer = setInterval(() => {
    current++;
    if (current >= targetScore) {
      current = targetScore;
      clearInterval(timer);
    }
    finalScoreValue.textContent = current;
  }, stepTime);
}

function animateBar(barElem, labelElem, value) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  labelElem.textContent = `${clamped}%`;
  barElem.style.width = `${clamped}%`;
}

function updateChecklistItem(itemKey, statusKey, isDetected) {
  const item = document.getElementById(itemKey);
  const status = document.getElementById(statusKey);
  if (!item || !status) return;

  if (isDetected) {
    item.className = 'checklist-item detected';
    status.textContent = 'Detected';
    item.querySelector('.check-icon').textContent = '✓';
  } else {
    item.className = 'checklist-item missing';
    status.textContent = 'Missing / Brief';
    item.querySelector('.check-icon').textContent = '!';
  }
}

// Print / Export
btnPrintReport.addEventListener('click', () => {
  window.print();
});

// Copy Summary
const btnCopySummary = document.getElementById('btn-copy-summary');
let lastAnalysisData = null;

if (btnCopySummary) {
  btnCopySummary.addEventListener('click', () => {
    if (!lastAnalysisData) {
      showToast('Run an analysis first to copy the summary report.');
      return;
    }
    const d = lastAnalysisData;
    const summaryMd = `### Resume–Job Match Report
**Overall Score:** ${d.matchScore}%
- Semantic Alignment: ${d.breakdown?.semanticScore ?? '--'}%
- ATS Keyword Overlap: ${d.breakdown?.keywordScore ?? '--'}%
- Skills Depth: ${d.breakdown?.skillsScore ?? '--'}%
- Experience Match: ${d.breakdown?.experienceScore ?? '--'}%

**Matched Skills (${d.matchedKeywords?.length || 0}):**
${(d.matchedKeywords || []).join(', ') || 'None'}

**Missing Target Skills (${d.missingKeywords?.length || 0}):**
${(d.missingKeywords || []).join(', ') || 'None'}

**Key Recommendations:**
${(d.suggestions || []).map(s => `- ${s}`).join('\n')}
`;
    navigator.clipboard.writeText(summaryMd);
    showToast('Analysis summary copied to clipboard in Markdown!');
  });
}

// Toast Notifications
function showToast(message) {
  const existing = document.querySelector('.toast-notice');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
