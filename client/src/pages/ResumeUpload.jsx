import { useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setParsed(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("Please login first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError(null);
      const res = await axios.post("http://localhost:5001/api/upload-resume", formData, {
        headers: { "x-user-id": user.uid },
      });
      setParsed(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-blue-600 mb-4 shadow-lg">
              <Upload className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              Upload Your Resume
            </h1>
            <p className="text-gray-600">Upload your resume to get AI-powered job recommendations</p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Resume File (PDF, DOC, DOCX)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:border-blue-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                  {file && (
                    <p className="mt-3 text-sm font-medium text-blue-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {file.name}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Upload Failed</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full py-4 text-white font-semibold rounded-full bg-blue-600 hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Parsing Resume...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload & Parse Resume
              </span>
            )}
          </button>

          {/* Parsed Results */}
          {parsed && (
            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Resume Parsed Successfully!</h3>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(parsed, null, 2)}
                </pre>
              </div>
              <button
                onClick={() => navigate("/resume/history")}
                className="mt-4 w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                View Resume History
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
