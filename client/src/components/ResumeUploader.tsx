import React, { useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("resume", file as any);

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
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Upload Your Resume</h2>
      <input
        type="file"
        accept=".pdf,.txt"
        onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] || null)}
        className="block w-full p-2 border rounded"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded hover:opacity-90 transition"
      >
        {loading ? "Uploading..." : "Upload and Parse"}
      </button>

      {parsed && (
        <div className="mt-6 border-t pt-4 space-y-2 text-left">
          <h3 className="text-xl font-semibold">Parsed Info:</h3>
          <p><strong>Name:</strong> {parsed.name}</p>
          <p><strong>Email:</strong> {parsed.email}</p>
          <p><strong>Experience:</strong> {parsed.experience}</p>
          <p><strong>Skills:</strong> {parsed.skills.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
