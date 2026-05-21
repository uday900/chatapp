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
  const [showPassword, setShowPassword] = React.useState(false);
  
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
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                    onClick={() => navigate(REACT_ENDPOINTS.FORGOT_PASSWORD)}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* Eye Icon */}
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-gray-900 cursor-pointer transition" 
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              {/* Sign In */}
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign in
              </button>
            </form>

            <div className="my-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Sign in with your email and password to continue securely.
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500 mt-4">
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