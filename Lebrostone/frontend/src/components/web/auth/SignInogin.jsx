import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import Navbar from "../comman/Navbar";
import Footer from "../comman/Footer";
import instance from "../api/AxiosConfig";
import { useToast } from "../../../context/ToastContext";

const SignInogin = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phoneNumber: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      if (onlyNums.length <= 10) {
        setFormData({ ...formData, [name]: onlyNums });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleAuthSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userToken", "active-session");
    success("Login successful! Welcome back.");
    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1000);
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const details = jwtDecode(response.credential);
      const res = await instance.post("/api/google-auth", {
        email: details.email,
        name: details.name,
        sub: details.sub,
      });
      const data = res.data;
      if (data.success) {
        handleAuthSuccess(data.user);
      }
    } catch (err) {
      error(err.message || "Google login failed. Please try again.");
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();

    if (formData.phoneNumber.length !== 10) {
      error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await instance.post("/api/login", formData);
      const data = res.data;
      if (data.success) {
        handleAuthSuccess(data.user);
      } else {
        error(data.message || "Invalid credentials");
      }
    } catch (err) {
      error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center bg-[#e0f7f3] py-16 px-4 relative overflow-hidden">
        {/* Decorative Blur Orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#b2ede2] rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#cff3ed] rounded-full blur-3xl opacity-60"></div>

        {/* Login Card */}
        <div className="bg-white p-10 rounded-[40px] shadow-sm w-full max-w-[480px] z-10 text-center border border-white/50">
          {/* Icon Header */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#00a688] p-4 rounded-2xl shadow-lg shadow-[#00a688]/20">
              <Lock className="text-white" size={28} />
            </div>
          </div>

          <h2 className="text-[32px] font-bold text-[#004d40] mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Please login to your account
          </p>

          <form onSubmit={handleManualLogin} className="space-y-5 text-left">
            {/* Mobile Number Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Enter Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={18} />
                </span>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="10-digit mobile number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00a688]/20 focus:border-[#00a688] outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00a688]/20 focus:border-[#00a688] outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm px-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#00a688]"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-[#00a688] font-bold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00a688] hover:bg-[#008d74] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#00a688]/30 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* GOOGLE SIGN IN BUTTON */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 z-0 bg-[#1a73e8] rounded-full flex items-center px-2 pointer-events-none min-w-[240px]">
                <div className="bg-white rounded-full p-1.5 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path
                      fill="#4285F4"
                      d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91a8.78 8.78 0 0 0 2.69-6.6z"
                    />
                    <path
                      fill="#34A853"
                      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.7H.95v2.33A9 9 0 0 0 9 18z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.95a9 9 0 0 0 0 8.08l3.01-2.33z"
                    />
                    <path
                      fill="#EA4335"
                      d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4A9 9 0 0 0 9 0 9 9 0 0 0 .95 4.96L3.96 7.29c.71-2.12 2.7-3.71 5.04-3.71z"
                    />
                  </svg>
                </div>
                <span className="text-white font-medium ml-4 text-[15px]">
                  Sign in with Google
                </span>
              </div>
              <div className="opacity-0 relative z-10">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  theme="outline"
                  size="large"
                  width="240"
                  shape="pill"
                />
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#00a688] font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignInogin;
