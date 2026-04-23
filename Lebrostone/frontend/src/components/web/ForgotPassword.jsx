import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "../web/comman/Navbar";
import Footer from "../web/comman/Footer";
import instance from "./api/AxiosConfig";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Set new password, 4: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await instance.post("/api/auth/forgot-password", { email });
      if (res.data.success) {
        setSuccess("OTP sent to your email address!");
        setStep(2);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send OTP";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await instance.post("/api/auth/verify-reset-otp", { email, otp });
      if (res.data.success) {
        setSuccess("OTP verified successfully!");
        setStep(3);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid OTP";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await instance.post("/api/auth/reset-password", { 
        email, 
        otp, 
        newPassword 
      });
      if (res.data.success) {
        setSuccess("Password reset successfully!");
        setStep(4);
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to reset password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const res = await instance.post("/api/auth/forgot-password", { email });
      if (res.data.success) {
        setSuccess("OTP resent successfully!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to resend OTP";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-[#e0f7f3] py-16 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#b2ede2] rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#cff3ed] rounded-full blur-3xl opacity-60"></div>

        <div className="bg-white p-10 rounded-[40px] shadow-sm w-full max-w-[500px] z-10 border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-[#00a688] p-4 rounded-2xl shadow-lg shadow-[#00a688]/20">
                <Lock className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#004d40] mb-2">
              Reset Password
            </h1>
            <p className="text-gray-500">
              {step === 1 && "Enter your email to receive OTP"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "Set your new password"}
              {step === 4 && "Password reset successful!"}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= num 
                    ? "bg-[#00a688] text-white" 
                    : "bg-gray-200 text-gray-500"
                } font-bold text-sm`}>
                  {step > num ? <CheckCircle size={16} /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > num ? "bg-[#00a688]" : "bg-gray-200"
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-500" size={16} />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-green-600 text-sm">{success}</span>
            </div>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a688] focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00a688] text-white py-3 rounded-xl font-bold hover:bg-[#00856d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (value.length <= 6) setOtp(value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-[#00a688] focus:border-transparent"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  OTP sent to {email}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 bg-[#00a688] text-white py-3 rounded-xl font-bold hover:bg-[#00856d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full text-[#00a688] font-bold py-2 hover:underline"
              >
                Resend OTP
              </button>
            </form>
          )}

          {/* Step 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a688] focus:border-transparent"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a688] focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#00a688] text-white py-3 rounded-xl font-bold hover:bg-[#00856d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-500" size={40} />
              </div>
              
              <p className="text-gray-600">
                You will be redirected to login page in a few seconds...
              </p>
              
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#00a688] text-white py-3 rounded-xl font-bold hover:bg-[#00856d] transition-colors"
              >
                Go to Login Now
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-[#00a688] font-bold hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;