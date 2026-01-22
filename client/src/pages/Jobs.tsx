import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Filter, Search, Sparkles } from "lucide-react";

const jobCache = new Map<string, { data: any[]; ts: number }>();
const CACHE_TTL_MS = 60 * 1000;

const getCacheEntry = (key: string) => {
  const entry = jobCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    jobCache.delete(key);
    return null;
  }
  return entry.data;
};

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [showMatched, setShowMatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchJobs(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const fetchJobs = async (query: string = "") => {
    const cacheKey = query || "__all__";
    try {
      setLoading(true);
      const cached = getCacheEntry(cacheKey);
      if (cached) {
        setJobs(cached);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const response = await axios.get(`${apiUrl}/api/jobs`, {
        params: query ? { q: query } : {},
      });
      setJobs(response.data);
      jobCache.set(cacheKey, { data: response.data, ts: Date.now() });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const openJob = (job: any) => setSelectedJob(job);
  const closeJob = () => setSelectedJob(null);

  const fetchMatchedJobs = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const resumesRes = await axios.get(`${apiUrl}/api/my-resumes`, {
        headers: { "x-user-id": user.uid },
      });

      setLoading(false);
      if (resumesRes.data.length === 0) {
        alert("Please upload a resume first to see matched jobs");
        setShowMatched(false);
        setLoading(false);
        return;
      }

      const latestResume = resumesRes.data[0];
      const resumeContent = `Name: ${latestResume.name}\nEmail: ${latestResume.email}\nSkills: ${latestResume.skills.join(", ")}\nExperience: ${latestResume.experience}`;
      const blob = new Blob([resumeContent], { type: "application/pdf" });
      const formData = new FormData();
      formData.append("file", blob, "resume.pdf");

      const matchRes = await axios.post("http://localhost:8000/match-resume", formData);
      console.log("Match response:", matchRes.data);
      console.log("Matches:", matchRes.data.matches);
      setMatchedJobs(matchRes.data.matches || []);
      setShowMatched(true);
    } catch (error) {
      console.error("Error fetching matched jobs:", error);
      alert("Failed to fetch matched jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayJobs: any[] = showMatched ? matchedJobs : jobs;
  const filteredJobs = displayJobs.filter((job: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const jobData = showMatched ? job.job : job;
    return (
      jobData?.title?.toLowerCase().includes(query) ||
      jobData?.company?.toLowerCase().includes(query) ||
      jobData?.location?.toLowerCase().includes(query) ||
      jobData?.skills?.some((skill: string) => skill.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            {showMatched ? "Matched Jobs" : "Job Opportunities"}
          </h1>
          <p className="text-gray-600">
            {showMatched ? "Jobs that match your resume skills" : "Browse available job positions"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, company, location, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => {
                if (showMatched) {
                  setShowMatched(false);
                } else {
                  fetchMatchedJobs();
                }
              }}
              disabled={loading}
              className={`px-6 py-3 rounded-full font-semibold transition flex items-center space-x-2 ${
                showMatched ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50`}
            >
              <Sparkles className="h-5 w-5" />
              <span>{showMatched ? "Show All Jobs" : "Show Matched Jobs"}</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredJobs.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  {searchQuery ? "No jobs found matching your search" : "No jobs available"}
                </p>
              </div>
            ) : (
              filteredJobs.map((item: any, idx: number) => {
                const job = showMatched ? item.job : item;
                const matchScore = showMatched ? item.similarity : null;

                return (
                  <div key={idx} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{job?.title}</h3>
                        <p className="text-gray-600 font-medium">{job?.company}</p>
                      </div>
                      {matchScore && (
                        <div className="ml-4 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-md">
                          <p className="text-xs font-medium">Match</p>
                          <p className="text-lg font-bold">{(matchScore * 100).toFixed(0)}%</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {job?.location && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {job.location}
                        </div>
                      )}
                      {job?.salary && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {job.salary}
                        </div>
                      )}
                      <div className="flex items=center text-gray-600 text-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        {job?.postedAt ? new Date(job.postedAt).toLocaleDateString() : "Recently posted"}
                      </div>
                    </div>

                    {job?.description && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{job.description}</p>
                    )}

                    {job?.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.slice(0, 6).map((skill: string, sidx: number) => (
                          <span key={sidx} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full hover:shadow-lg transition" onClick={() => openJob(job)}>
                      View Details
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Role</p>
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                {selectedJob.company && <p className="text-gray-600 mt-1">{selectedJob.company}</p>}
              </div>
              <button onClick={closeJob} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
              <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                {selectedJob.location && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <MapPin className="h-4 w-4" />
                    {selectedJob.location}
                  </span>
                )}
                {selectedJob.salary && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <DollarSign className="h-4 w-4" />
                    {selectedJob.salary}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  <Clock className="h-4 w-4" />
                  {selectedJob.postedAt ? new Date(selectedJob.postedAt).toLocaleDateString() : "Recently posted"}
                </span>
              </div>

              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {selectedJob.description && (
                <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-100">
              <button onClick={closeJob} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition">Close</button>
              <button onClick={() => selectedJob.url && window.open(selectedJob.url, "_blank", "noopener,noreferrer")} disabled={!selectedJob.url} className={`px-5 py-2 rounded-lg font-semibold transition ${selectedJob.url ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
                {selectedJob.url ? "Apply on site" : "No apply link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
