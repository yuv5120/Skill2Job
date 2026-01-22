import { useEffect, useState } from "react";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Calendar, Briefcase, Sparkles, Loader } from "lucide-react";

export default function ResumeHistory() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<Record<string, any>>({});
  const [loadingMatch, setLoadingMatch] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const res = await axios.get("http://localhost:5001/api/my-resumes", {
            headers: { "x-user-id": u.uid },
          });
          setResumes(res.data);
        } catch (err) {
          console.error("Error fetching resumes", err);
        }
      }
    });
  }, []);

  const handleMatch = async (resumeId: string) => {
    const resume = resumes.find((r) => r.id === resumeId);
    if (!resume) return;

    try {
      setLoadingMatch(resumeId);

      const fakePDF = new Blob([
        `Name: ${resume.name}\nEmail: ${resume.email}\nSkills: ${resume.skills.join(", ")}\nExperience: ${resume.experience}`,
      ], { type: "application/pdf" });

      const formData = new FormData();
      formData.append("file", fakePDF, "resume.pdf");

      const res = await axios.post("http://localhost:8000/match-resume", formData);
      setMatches({ ...matches, [resumeId]: res.data });
    } catch (err) {
      console.error("Error matching resume", err);
      alert("Failed to match resume");
    } finally {
      setLoadingMatch(null);
    }
  };

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
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Resume History</h1>
          <p className="text-gray-600">View and manage all your uploaded resumes</p>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No resumes uploaded yet</p>
            <button onClick={() => navigate("/resume/upload")} className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition">Upload Your First Resume</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume: any) => (
              <div key={resume.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6 transform hover:-translate-y-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <FileText className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{resume.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{resume.email}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Uploaded</p>
                      <p className="text-sm text-gray-700">{new Date(resume.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resume.skills.slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">{skill}</span>
                        ))}
                        {resume.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">+{resume.skills.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => handleMatch(resume.id)} disabled={loadingMatch === resume.id} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                  {loadingMatch === resume.id ? (<><Loader className="h-5 w-5 animate-spin" /><span>Matching...</span></>) : (<><Briefcase className="h-5 w-5" /><span>Find Jobs</span></>)}
                </button>

                {matches[resume.id] && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <h4 className="font-bold text-green-900 mb-2 text-sm">Matched Jobs:</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {matches[resume.id].matches?.map((match: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-lg shadow-sm border border-green-100">
                          <p className="font-semibold text-gray-900 text-sm">{match.job?.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{match.job?.company}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-green-700">Match: {(match.similarity * 100).toFixed(1)}%</span>
                            <span className="text-xs text-gray-500">{match.job?.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
