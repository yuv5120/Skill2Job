import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut, updateProfile, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Lock, LogOut, Edit2, Save, X } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setMessage({ type: "error", text: "Passwords don't match" });
          setLoading(false);
          return;
        }
        if (newPassword.length < 6) {
          setMessage({ type: "error", text: "Password must be at least 6 characters" });
          setLoading(false);
          return;
        }
        await updatePassword(user, newPassword);
        setNewPassword("");
        setConfirmPassword("");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-600 h-32"></div>
          
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="flex items-end space-x-4">
                <div className="h-32 w-32 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                  <div className="h-28 w-28 rounded-xl bg-blue-600 flex items-center justify-center">
                    <User className="h-14 w-14 text-white" />
                  </div>
                </div>
                <div className="pb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user.displayName || "User"}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mb-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl ${
                message.type === "success" 
                  ? "bg-green-50 border border-green-200 text-green-800" 
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}>
                {message.text}
              </div>
            )}

            {/* Profile Details */}
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-gray-500">Full Name</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{user.displayName || "Not set"}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Mail className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-gray-500">Email Address</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Phone className="h-5 w-5 text-pink-600" />
                      <p className="text-sm text-gray-500">Phone Number</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{user.phoneNumber || "Not set"}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Lock className="h-5 w-5 text-rose-600" />
                      <p className="text-sm text-gray-500">Password</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">••••••••</p>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSignOut}
                    className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-full hover:bg-red-100 transition flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password (Optional)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {newPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user.displayName || "");
                      setNewPassword("");
                      setConfirmPassword("");
                      setMessage(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition flex items-center space-x-2"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
