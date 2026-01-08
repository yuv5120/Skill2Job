import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { Upload, Briefcase, User, Mail, Clock, FileText, History, UserCircle, Settings } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items=center justify-center shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-600">Skill2Job</h1>
              </div>
            </div>
            
            <Link to="/profile" className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">{user.displayName || "User"}</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-blue-600">{user.displayName || "there"}!</span>
          </h2>
          <p className="text-gray-600">Start matching your resume with the perfect job opportunities</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Link to="/resume/upload" className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 h-80 flex flex-col justify-center">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">Upload Resume</h3>
                <p className="text-gray-600 mb-4">Upload your resume and get AI-powered job recommendations.</p>
                <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Get Started
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/jobs" className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 h-80 flex flex-col justify-center">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">Browse Jobs</h3>
                <p className="text-gray-600 mb-4">Explore available job opportunities and find positions that match your skills.</p>
                <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Explore Jobs
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <History className="h-6 w-6 mr-2 text-blue-600" />
            Quick Links
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/resume/history" className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:shadow-md transition-all duration-300 group h-40">
              <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition mb-3">
                <FileText className="h-6 w-6 text-blue-600 group-hover:text-white transition" />
              </div>
              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">Resume History</p>
              <p className="text-xs text-gray-500">View all uploads</p>
            </Link>

            <Link to="/admin" className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-2xl hover:bg-purple-50 hover:shadow-md transition-all duration-300 group h-40">
              <div className="h-14 w-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 transition mb-3">
                <Settings className="h-6 w-6 text-purple-600 group-hover:text-white transition" />
              </div>
              <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition">Admin Panel</p>
              <p className="text-xs text-gray-500">Post new jobs</p>
            </Link>

            <button onClick={() => navigate('/resume/history')} className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-2xl hover:bg-pink-50 hover:shadow-md transition-all duration-300 group h-40 cursor-pointer border-none w-full">
              <div className="h-14 w-14 rounded-xl bg-pink-100 flex items-center justify-center group-hover:bg-pink-600 transition mb-3">
                <Clock className="h-6 w-6 text-pink-600 group-hover:text-white transition" />
              </div>
              <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition">Recent Activity</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
