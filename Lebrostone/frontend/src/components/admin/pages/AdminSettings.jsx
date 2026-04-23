import React, { useState, useEffect } from "react";
import { Save, Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import instance from "../../web/api/AxiosConfig";

const AdminSettings = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Form states
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: ""
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [profileForm, setProfileForm] = useState({
    newEmail: "",
    currentPassword: "",
    newPassword: ""
  });

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Get auth header helper
  const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  };

  // Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instance.get("/api/admin/settings/profile", getAuthHeader());
        if (res.data.success) {
          setAdminData(res.data.data);
          setEmailForm(prev => ({ ...prev, newEmail: res.data.data.email }));
          setProfileForm(prev => ({ ...prev, newEmail: res.data.data.email }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setMessage({ type: "error", text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle form submissions
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    if (!emailForm.newEmail || !emailForm.password) {
      setMessage({ type: "error", text: "Please fill all fields" });
      setSaving(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      setSaving(false);
      return;
    }

    try {
      const res = await instance.put("/api/admin/settings/update-email", emailForm, getAuthHeader());
      if (res.data.success) {
        setMessage({ type: "success", text: "Email updated successfully!" });
        setAdminData(res.data.data);
        setEmailForm({ newEmail: res.data.data.email, password: "" });
        setProfileForm(prev => ({ ...prev, newEmail: res.data.data.email }));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update email";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Please fill all fields" });
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setSaving(false);
      return;
    }

    try {
      const res = await instance.put("/api/admin/settings/update-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, getAuthHeader());
      if (res.data.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update password";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    if (!profileForm.currentPassword) {
      setMessage({ type: "error", text: "Current password is required" });
      setSaving(false);
      return;
    }

    if (profileForm.newEmail && profileForm.newPassword) {
      setMessage({ type: "error", text: "Please update either email or password, not both at once" });
      setSaving(false);
      return;
    }

    if (!profileForm.newEmail && !profileForm.newPassword) {
      setMessage({ type: "error", text: "Please provide email or password to update" });
      setSaving(false);
      return;
    }

    try {
      const updateData = {
        currentPassword: profileForm.currentPassword
      };

      if (profileForm.newEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileForm.newEmail)) {
          setMessage({ type: "error", text: "Please enter a valid email address" });
          setSaving(false);
          return;
        }
        updateData.newEmail = profileForm.newEmail;
      }

      if (profileForm.newPassword) {
        if (profileForm.newPassword.length < 6) {
          setMessage({ type: "error", text: "Password must be at least 6 characters" });
          setSaving(false);
          return;
        }
        updateData.newPassword = profileForm.newPassword;
      }

      const res = await instance.put("/api/admin/settings/update-profile", updateData, getAuthHeader());
      if (res.data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setAdminData(res.data.data);
        setProfileForm({
          newEmail: res.data.data.email,
          currentPassword: "",
          newPassword: ""
        });
        setEmailForm(prev => ({ ...prev, newEmail: res.data.data.email }));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update profile";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Settings</h1>
          <p className="text-gray-600">Manage your admin account settings</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success" 
              ? "bg-green-50 border border-green-200 text-green-700" 
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {message.type === "success" ? 
              <CheckCircle size={20} /> : 
              <AlertCircle size={20} />
            }
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "email"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Change Email
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "password"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Change Password
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Email
                  </label>
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={20} />
                    <input
                      type="email"
                      value={adminData?.email || ""}
                      disabled
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Email (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={20} />
                    <input
                      type="email"
                      value={profileForm.newEmail}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, newEmail: e.target.value }))}
                      placeholder="Enter new email address"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <Lock className="text-gray-400" size={20} />
                    <div className="relative flex-1">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <div className="flex items-center gap-3">
                    <Lock className="text-gray-400" size={20} />
                    <div className="relative flex-1">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Updating..." : "Update Profile"}
                </button>
              </form>
            )}

            {/* Change Email Tab */}
            {activeTab === "email" && (
              <form onSubmit={handleEmailUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Email
                  </label>
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={20} />
                    <input
                      type="email"
                      value={adminData?.email || ""}
                      disabled
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Email
                  </label>
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={20} />
                    <input
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                      placeholder="Enter new email address"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="flex items-center gap-3">
                    <Lock className="text-gray-400" size={20} />
                    <div className="relative flex-1">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={emailForm.password}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter current password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Updating..." : "Update Email"}
                </button>
              </form>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="flex items-center gap-3">
                    <Lock className="text-gray-400" size={20} />
                    <div className="relative flex-1">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="flex items-center gap-3">
                    <Lock className="text-gray-400" size={20} />
                    <div className="relative flex-1">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="flex items-center gap-3">
                    <Lock className="text-gray-400" size={20} />
                    <div className="relative flex-1">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;