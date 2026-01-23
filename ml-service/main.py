from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import spacy
import fitz  # PyMuPDF
import requests
import hashlib
import redis
import re
import json
import os

# Initialize Redis and SpaCy
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
try:
    r = redis.from_url(redis_url, decode_responses=True)
    r.ping()  # Test connection
    REDIS_AVAILABLE = True
except Exception as e:
    print(f"Redis connection failed: {e}. Running without cache.")
    REDIS_AVAILABLE = False
    r = None

app = FastAPI()

# Enable CORS for all origins (frontend on Vercel, backend on Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://skill2-job.vercel.app",
        "https://skill2job-server.onrender.com",
        "*"  # Allow all origins for now
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
nlp = spacy.load("en_core_web_md")


@app.get("/")
def home():
    return {"message": "ML API running"}


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    import hashlib
    import re

    contents = await file.read()
    file_hash = hashlib.md5(contents).hexdigest()

    # Check cache if Redis is available
    if REDIS_AVAILABLE and r:
        try:
            cached = r.get(file_hash)
            if cached:
                return json.loads(cached)
        except Exception:
            # Fallback if cache is corrupted
            try:
                r.delete(file_hash)
            except:
                pass

    try:
        # Try to parse as PDF first
        text = ""
        try:
            doc = fitz.open(stream=contents, filetype="pdf")
            text = "\n".join([page.get_text() for page in doc])
        except:
            # If PDF parsing fails, treat as plain text
            pass
        
        # Fallback to plain text if PDF parsing failed
        if not text or len(text.strip()) < 10:
            text = contents.decode('utf-8', errors='ignore')
        
        lines = text.splitlines()

        # === Extract Email ===
        email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        email = email_match.group(0) if email_match else "Not found"

        # === Extract Name === (first valid non-heading line)
        name = "Not found"
        for line in lines:
            clean = line.strip()
            if (
                clean
                and len(clean.split()) >= 2
                and "email" not in clean.lower()
                and "phone" not in clean.lower()
                and "@" not in clean
                and not re.search(r"\d", clean)
            ):
                name = clean
                break

        # === Extract Skills from 'Skills' or 'Additional Information' section ===
        skills = []
        skills_found = False
        for i, line in enumerate(lines):
            if re.search(r"(skills|additional information)", line, re.IGNORECASE):
                skills_block = []
                for j in range(i + 1, min(i + 8, len(lines))):
                    if any(
                        kw in lines[j].lower()
                        for kw in ["education", "projects", "experience", "certification"]
                    ):
                        break
                    skills_block.append(lines[j])
                flat = " ".join(skills_block)
                skills = [s.strip() for s in re.split(r"[,\n]", flat) if len(s.strip()) > 1]
                skills_found = True
                break

        # === Extract Experience from 'Professional Experience' or 'Experience' section ===
        experience = "Not found"
        experience_found = False
        experience_lines = []

        for i, line in enumerate(lines):
            if re.search(r"(professional experience|experience)", line.strip(), re.IGNORECASE):
                for j in range(i + 1, len(lines)):
                    if re.search(
                        r"(projects|education|skills|certifications|additional information)",
                        lines[j].strip(),
                        re.IGNORECASE,
                    ):
                        break
                    experience_lines.append(lines[j].strip())
                break

        if experience_lines:
            experience = "\n".join(experience_lines).strip()

        result = {
            "name": name,
            "email": email,
            "skills": skills[:10],
            "experience": experience,
        }

        # Cache result if Redis is available
        if REDIS_AVAILABLE and r:
            try:
                r.set(file_hash, json.dumps(result), ex=86400)
            except Exception as e:
                print(f"Failed to cache result: {e}")
        
        return result

    except Exception as e:
        return {"error": str(e)}

@app.post("/match-resume")
async def match_resume(file: UploadFile = File(...)):
    contents = await file.read()

    try:
        # Extract resume text - try PDF first, then plain text
        text = ""
        try:
            doc = fitz.open(stream=contents, filetype="pdf")
            text = "".join([page.get_text() for page in doc])
        except:
            # If PDF parsing failed, treat as plain text
            pass
        
        # If no text from PDF, try reading as plain text
        if not text or len(text.strip()) < 10:
            text = contents.decode('utf-8', errors='ignore')
        
        if not text or len(text.strip()) < 10:
            return {"error": "Could not extract text from file", "matches": []}
        
        resume_doc = nlp(text)

        # Fetch jobs
        res = requests.get("http://localhost:5001/api/jobs")
        jobs = res.json()

        scored = []
        for job in jobs:
            title = job.get('title', '')
            description = job.get('description', '')
            skills_list = job.get('skills', [])
            if isinstance(skills_list, list):
                skills_str = ' '.join(skills_list)
            else:
                skills_str = str(skills_list or '')
            job_text = f"{title} {description} {skills_str}"
            job_doc = nlp(job_text)
            similarity = resume_doc.similarity(job_doc)
            scored.append((job, similarity))
        # Allow more results by using a slightly lower threshold
        scored = [(job, score) for job, score in scored if score > 0.4]
        top_matches = sorted(scored, key=lambda x: x[1], reverse=True)[:5]

        return {
            "matches": [
                {"job": job, "similarity": round(score, 2)} for job, score in top_matches
            ]
        }

    except Exception as e:
        return {"error": str(e), "matches": []}
