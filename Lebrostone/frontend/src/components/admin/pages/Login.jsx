import React, { useState } from "react";
import instance from "../../web/api/AxiosConfig";
import logo from "/logo.png";
import { useToast } from "../../../context/ToastContext";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { success, error } = useToast();
  const [errMsg, setErrMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await instance.post("/api/admin/login", { email, password });

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        success("Login Successful! ✅");
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";

      setErrMsg(message);
      error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-gray-200">
        {/* ✅ STEP 4: Image Source Fixed */}
        <img
          src={logo}
          alt="Lebrostone"
          className="h-20 mx-auto mb-6 object-contain"
          onError={(e) => {
            e.target.style.display = "none"; // Agar image na mile to hide kar de
            console.log("Logo failed to load from:", logo);
          }}
        />

        <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter italic">
          Admin Portal
        </h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">
          Inventory Control System
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Email Access
            </label>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Security Password
            </label>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* {error message if occers hide } */}
          <p className="text-red-500 text-sm">{errMsg && (
    <p className="text-red-500 text-sm">{errMsg}</p>
)}</p>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-blue-600 shadow-xl transition-all active:scale-95"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
