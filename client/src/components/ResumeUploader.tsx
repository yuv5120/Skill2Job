import React, { useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

const ResumeUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("resume", file);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to upload a resume");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5001/api/upload-resume", formData, {
        headers: {
          "x-user-id": user.uid,
        },
      });
      setParsed(res.data);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div className="relative">
          <label className="flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-blue-300 rounded-2xl cursor-pointer bg-white hover:bg-blue-50 transition-all duration-300 group">
            <div className="flex flex-col items-center justify-center pt-7 pb-8">
              <svg className="w-16 h-16 mb-4 text-blue-500 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-lg font-semibold text-gray-700">
                {file ? (
                  <span className="text-blue-600">{file.name}</span>
                ) : (
                  <span>Click to upload or drag and drop</span>
                )}
              </p>
              <p className="text-sm text-gray-500">PDF or TXT (Max 10MB)</p>
            </div>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full py-4 text-lg font-semibold text-white rounded-xl bg-blue-600 hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </div>
          ) : (
            "Upload and Parse Resume"
          )}
        </button>

        {parsed && (
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-blue-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Parsed Successfully!</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{parsed.name}</p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-purple-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{parsed.email}</p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-pink-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Experience</p>
                  <p className="text-lg font-semibold text-gray-900">{parsed.experience}</p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {parsed.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ResumeUploader;
