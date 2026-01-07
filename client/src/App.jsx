import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeHistory from "./pages/ResumeHistory";
import ResumeMatcher from "./pages/ResumeMatcher";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resume/upload" element={<ResumeUpload />} />
        <Route path="/resume/history" element={<ResumeHistory />} />
        <Route path="/resume/matcher" element={<ResumeMatcher />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/admin" element={<Admin />} />
        {/* Legacy routes for backward compatibility */}
        <Route path="/upload-resume" element={<ResumeUpload />} />
        <Route path="/resume-history" element={<ResumeHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

