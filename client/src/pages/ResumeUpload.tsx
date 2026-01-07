import { useNavigate } from "react-router-dom";
import ResumeUploader from "../components/ResumeUploader";
import { ArrowLeft, Upload } from "lucide-react";

export default function ResumeUpload() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 mb-4 shadow-lg">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Upload Resume</h1>
            <p className="text-gray-600">Upload your resume (PDF or text) to parse and save it</p>
          </div>

          <ResumeUploader />
        </div>
      </main>
    </div>
  );
}
