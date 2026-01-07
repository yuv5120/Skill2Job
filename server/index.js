const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const prisma = require("./prisma");

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON for all routes

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", (req, res) => res.send("API running"));

app.get("/api/my-resumes", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).send("Unauthorized");

  try {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(resumes);
  } catch (err) {
    console.error("Error fetching resumes:", err.message);
    res.status(500).send("Failed to fetch resumes");
  }
});

// Rate limiter to protect Adzuna API quota
const jobsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max requests per minute for this route
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/jobs", jobsLimiter, async (req, res) => {
  try {
    const dbJobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
    });
    const dbJobsWithUrl = dbJobs.map((job) => ({ ...job, url: null }));

    // External jobs via Adzuna (India only)
    const { q, location, page = 1, country = "in" } = req.query;
    let externalJobs = [];
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_API_KEY;

    if (appId && appKey) {
      const params = {
        app_id: appId,
        app_key: appKey,
        results_per_page: 20,
      };
      if (q) params.what = q;
      if (location) params.where = location;

      try {
        const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
        const { data } = await axios.get(url, { params });
        const results = Array.isArray(data?.results) ? data.results : [];
        externalJobs = results.map((r) => ({
          id: `adz_${r.id}`,
          title: r.title,
          company: r.company?.display_name || null,
          location: r.location?.display_name || null,
          salary:
            r.salary_min && r.salary_max
              ? `$${Math.round(r.salary_min)} - $${Math.round(r.salary_max)}`
              : null,
          description: r.description || "",
          skills: [],
          postedAt: r.created,
          url: r.redirect_url || null,
        }));
      } catch (e) {
        console.error("Adzuna fetch failed:", e.message);
      }
    } else {
      // Fallback to Remotive when Adzuna credentials missing
      try {
        const { data } = await axios.get("https://remotive.com/api/remote-jobs");
        const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
        externalJobs = jobs.map((j) => ({
          id: `ext_${j.id}`,
          title: j.title,
          company: j.company_name,
          location: j.candidate_required_location,
          salary: j.salary || null,
          description: j.description || "",
          skills: Array.isArray(j.tags) ? j.tags : [],
          postedAt: j.publication_date,
          url: j.url || j.job_url || null,
        }));
      } catch (e) {
        console.error("External jobs fetch failed:", e.message);
      }
    }

    res.json([...externalJobs, ...dbJobsWithUrl]);
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).send("Error fetching jobs");
  }
});

app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
  const file = req.file;
  const userId = req.headers["x-user-id"];
  if (!file) return res.status(400).send("No file uploaded");
  if (!userId) return res.status(401).send("Unauthorized");

  try {
    const form = new FormData();
    form.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await axios.post("http://localhost:8000/parse-resume", form, {
      headers: form.getHeaders(),
    });

    const { name, email, skills, experience } = response.data;

const cleanText = (text) =>
  typeof text === "string" ? text.replace(/\x00/g, "").trim() : "";

const cleanArray = (arr) =>
  Array.isArray(arr) ? arr.map((s) => cleanText(s)) : [];

const saved = await prisma.resume.create({
  data: {
    userId,
    name: cleanText(name),
    email: cleanText(email),
    skills: cleanArray(skills),
    experience: cleanText(experience),
  },
});

    res.json(saved);
  } catch (err) {
    console.error("Parsing error:", err.message);
    res.status(500).send("Error parsing resume");
  }
});

app.post("/api/jobs", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).send("Unauthorized");

  const { title, description, skills } = req.body;

  try {
    const job = await prisma.job.create({
      data: {
        title,
        description,
        skills,
        postedBy: userId,
      },
    });
    res.json(job);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).send("Error creating job");
  }
});
app.post("/api/save-matches", express.json(), async (req, res) => {
  const { resumeId, matches } = req.body;

  try {
    const saved = await prisma.$transaction(
      matches.map((match) =>
        prisma.match.create({
          data: {
            resumeId,
            jobId: match.jobId,
            score: match.score,
          },
        })
      )
    );

    res.json({ success: true, saved });
  } catch (err) {
    console.error("Save match error:", err.message);
    res.status(500).send("Failed to save matches");
  }
});
app.delete("/api/resume/:id", async (req, res) => {
  const resumeId = req.params.id;
  const userId = req.headers["x-user-id"];

  if (!userId) return res.status(401).send("Unauthorized");

  try {
    await prisma.resume.delete({
      where: {
        id: resumeId,
      },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete resume error:", err);
    res.status(500).send("Error deleting resume");
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
