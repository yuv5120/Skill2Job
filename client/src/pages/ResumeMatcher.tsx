import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Briefcase, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

export default function ResumeMatcher() {
  const [file, setFile] = useState<File | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleMatch = async () => {
    if (!file) {
      setError("Please select a resume PDF to match");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);
      const res = await axios.post("http://localhost:8000/match-resume", formData);
      setMatches(res.data.matches || []);
    } catch (err: any) {
      console.error("Matching error:", err);
      setError(err.response?.data?.error || "Failed to match resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx_auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate("/dashboard")} className="flex items_center space-x-2 text_gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items_center justify_center h-20 w-20 rounded-2xl bg-blue-600 mb-4 shadow-lg">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Skill2Job</h1>
            <p className="text-gray-600">Upload your resume to find the best matching job opportunities</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Resume File (PDF Only)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items_center justify_center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:border-purple-400">
                <div className="flex flex_col items-center justify_center pt-5 pb-6">
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                  {file && (<p className="mt-3 text-sm font-medium text-purple-600 flex items-center"><CheckCircle className="h-4 w-4 mr-2" />{file.name}</p>)}
                </div>
                <input type="file" accept=".pdf" onChange={(e) => { const f = (e.target as HTMLInputElement).files?.[0] || null; setFile(f); setError(null); }} className="hidden" />
              </label>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Matching Failed</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <button onClick={handleMatch} disabled={loading || !file} className="w-full py-4 text-white font-semibold rounded-full bg-blue-600 hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            {loading ? (<span className="flex items_center justify_center"><svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Finding Best Matches...</span>) : (<span className="flex items_center justify_center"><Sparkles className="h-5 w-5 mr-2" />Match Resume to Jobs</span>)}
          </button>

          {matches.length > 0 && (
            <div className="mt-8">
              <div className="flex items center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items_center justify_center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Top Job Matches</h3>
                  <p className="text-sm text_gray-500">Found {matches.length} matching opportunities</p>
                </div>
              </div>

              <div className="space-y-4">
                {matches.map((match: any, idx: number) => (
                  <div key={idx} className="p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{match.job?.title}</h4>
                        <p className="text-sm text-gray-600">{match.job?.company}</p>
                      </div>
                      <div className="ml-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-md">
                        <p className="text-xs font-medium">Match Score</p>
                        <p className="text-lg font-bold">{(match.similarity * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text_gray-600 mb-3">
                      <span className="flex items_center">📍 {match.job?.location || "Remote"}</span>
                      {match.job?.salary && (<span className="flex items_center">💰 {match.job.salary}</span>)}
                    </div>

                    {match.job?.description && (<p className="text-sm text-gray-700 mb-3 line-clamp-2">{match.job.description}</p>)}

                    {match.job?.skills && match.job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {match.job.skills.slice(0, 5).map((skill: string, sidx: number) => (
                          <span key={sidx} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && matches.length === 0 && file && !error && (
            <div className="mt-8 text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No matching jobs found</p>
              <p className="text-sm text-gray-400 mt-1">Try uploading a different resume</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
