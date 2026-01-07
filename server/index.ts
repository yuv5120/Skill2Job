import express from "express";
import cors from "cors";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import prisma from "./prisma";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", (req, res) => res.send("API running"));

app.get("/api/my-resumes", async (req, res) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) return res.status(401).send("Unauthorized");

  try {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(resumes);
  } catch (err: any) {
    console.error("Error fetching resumes:", err.message);
    res.status(500).send("Failed to fetch resumes");
  }
});

const jobsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/jobs", jobsLimiter, async (req, res) => {
  try {
    const dbJobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
    });
    const dbJobsWithUrl = dbJobs.map((job) => ({ ...job, url: null }));

    const { q, location, page = 1, country = "in" } = req.query as {
      q?: string;
      location?: string;
      page?: string | number;
      country?: string;
    };
    let externalJobs: any[] = [];
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_API_KEY;

    if (appId && appKey) {
      const params: Record<string, any> = {
        app_id: appId,
        app_key: appKey,
        results_per_page: 20,
      };
      if (q) params.what = q;
      if (location) params.where = location;

      try {
        const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
        const { data } = await axios.get(url, { params });
        const results = Array.isArray((data as any)?.results) ? (data as any).results : [];
        externalJobs = results.map((r: any) => ({
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
      } catch (e: any) {
        console.error("Adzuna fetch failed:", e.message);
      }
    } else {
      try {
        const { data } = await axios.get("https://remotive.com/api/remote-jobs");
        const jobs = Array.isArray((data as any)?.jobs) ? (data as any).jobs : [];
        externalJobs = jobs.map((j: any) => ({
          id: `ext_${j.id}`,
          title: j.title,
          company: j.company_name,
          location: j.candidate_required_location,
          salary: j.salary || null,
          description: j.description || "",
          skills: Array.isArray(j.tags) ? j.tags : [],
          postedAt: j.publication_date,
          url: (j as any).url || (j as any).job_url || null,
        }));
      } catch (e: any) {
        console.error("External jobs fetch failed:", e.message);
      }
    }

    res.json([...externalJobs, ...dbJobsWithUrl]);
  } catch (err: any) {
    console.error("Get jobs error:", err);
    res.status(500).send("Error fetching jobs");
  }
});

app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
  const file = req.file;
  const userId = req.headers["x-user-id"] as string | undefined;
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

    const { name, email, skills, experience } = (response as any).data;

    const cleanText = (text: any) =>
      typeof text === "string" ? text.replace(/\x00/g, "").trim() : "";

    const cleanArray = (arr: any) => (Array.isArray(arr) ? arr.map((s) => cleanText(s)) : []);

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
  } catch (err: any) {
    console.error("Parsing error:", err.message);
    res.status(500).send("Error parsing resume");
  }
});

app.post("/api/jobs", async (req, res) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) return res.status(401).send("Unauthorized");

  const { title, description, skills } = req.body as any;

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
  } catch (err: any) {
    console.error("Create job error:", err);
    res.status(500).send("Error creating job");
  }
});

app.post("/api/save-matches", express.json(), async (req, res) => {
  const { resumeId, matches } = req.body as any;

  try {
    const prismaAny = prisma as any;
    const saved = await prisma.$transaction(
      (matches as any[]).map((match) =>
        prismaAny.match.create({
          data: {
            resumeId,
            jobId: (match as any).jobId,
            score: (match as any).score,
          },
        })
      )
    );

    res.json({ success: true, saved });
  } catch (err: any) {
    console.error("Save match error:", (err as any).message);
    res.status(500).send("Failed to save matches");
  }
});

app.delete("/api/resume/:id", async (req, res) => {
  const resumeId = req.params.id;
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) return res.status(401).send("Unauthorized");

  try {
    await prisma.resume.delete({
      where: {
        id: resumeId,
      },
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Delete resume error:", err);
    res.status(500).send("Error deleting resume");
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
