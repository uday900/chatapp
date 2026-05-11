import React from "react";
import bgImage from "/assets/login_bg.png";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { REACT_ENDPOINTS } from "../utils/endpoints";
import { loginUserApi } from "../redux/slice/authSlice";
import { connectSocket } from "../socket/socket";

export default function LoginPage() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  
  const { loading, error } = useSelector((state) => state.auth);

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(loginUserApi({ email: username, password }));
    if (result.meta.requestStatus === "fulfilled") {
      connectSocket();
      navigate(REACT_ENDPOINTS.HOME);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Main Wrapper */}
      <div className="relative w-full max-w-5xl h-[650px] rounded-[30px] overflow-hidden ">

        {/* Background Blue Image */}
        <img
          src={bgImage}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />

        {/* Center Login Card */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-[380px] bg-white/95 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 px-8 py-8">

            {/* Logo */}
            <div className="flex justify-center mb-5">
              <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center">
                <span className="text-white text-lg font-bold">⚡</span>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="uday@darla.com"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Sign In */}
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:opacity-90 transition"
              >
                Sign in
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">
                Or continue with
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button className="w-full h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition font-medium flex items-center justify-center gap-3">
              <span className="text-lg">G</span>
              Google
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <button className="text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer" onClick={() => navigate(REACT_ENDPOINTS.SIGNUP)}>
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}