import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700">Skill2Job</h1>
        <p className="text-gray-600 text-lg">
          Harness the power of Artificial Intelligence to match resumes with the most relevant job openings. 
          Upload your resume, explore job opportunities, and let smart matching do the rest.
        </p>
        <div className="flex justify-center gap-6">
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Login</button>
          <button onClick={() => navigate("/register")} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Sign Up</button>
        </div>
      </div>
    </div>
  );
}
