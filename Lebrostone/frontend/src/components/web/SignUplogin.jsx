import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Phone,
  User,
  Mail,
  ChevronRight,
} from "lucide-react";

import Navbar from "../web/comman/Navbar";
import Footer from "../web/comman/Footer";
import instance from "./api/AxiosConfig";
import { useToast } from "../../context/ToastContext";

const SignUplogin = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      if (onlyNums.length <= 10) {
        setFormData({ ...formData, [name]: onlyNums });
      }
      return;
    }

    if (name === "email") {
      if (value.length <= 40) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await instance.post("/api/manual-signup", {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
      });
      const data = res.data;
      if (data.success) {
        success("Registration successful! Please login.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        error(data.message || "Signup failed");
      }
    } catch (err) {
      error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const details = jwtDecode(response.credential);
      const res = await instance.post("/api/google-auth", {
        email: details.email,
        name: details.name,
        sub: details.sub,
        picture: details.picture,
      });
      const data = res.data;
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        success("Google signup successful! Welcome.");
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      error(err.message || "Google signup failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center bg-[#e0f7f3] py-16 px-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#b2ede2] rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#cff3ed] rounded-full blur-3xl opacity-60"></div>

        <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm w-full max-w-[550px] z-10 border border-white/50">
          <div className="flex justify-center mb-4">
            <div className="bg-[#00a688] p-4 rounded-2xl shadow-lg shadow-[#00a688]/20">
              <User className="text-white" size={28} />
            </div>
          </div>

          <h2 className="text-[28px] md:text-[32px] font-bold text-[#004d40] text-center mb-1">
            Create Account
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Join the Lebrostone community today
          </p>

          <form className="space-y-5" onSubmit={handleSignUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  First Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00a688]/20 focus:border-[#00a688] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Last Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00a688]/20 focus:border-[#00a688] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Email (Max 40 chars)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00a688]/20 focus:border-[#00a688] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Mobile Number (10 Digits)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Phone size={18} />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    placeholder="10-digit Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00a688]/20 focus:border-[#00a688] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
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
                    placeholder="Create Password"
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00a688]/20 focus:border-[#00a688] outline-none transition-all placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00a688]/20 focus:border-[#00a688] outline-none transition-all placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00a688] hover:bg-[#008d74] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#00a688]/30 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"} {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          {/* Google Sign Up/In */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="w-full h-[1px] bg-gray-300"></div>
            <p className="text-sm text-gray-500">Or</p>
            <div className="w-full h-[1px] bg-gray-300"></div>
          </div>
          <div className="flex items-center justify-center mt-4 gap-2 bg-white rounded-2xl">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              theme="outline"
              size="large"
              width="240"
              shape="pill"
            />
          </div>
         
          <p className="mt-8 text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#00a688] font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUplogin;
