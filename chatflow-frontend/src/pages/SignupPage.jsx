import React from "react";
import bgImage from "/assets/login_bg.png";
import appLogo from "/assets/app-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { REACT_ENDPOINTS } from "../utils/endpoints";
import { registerUserApi } from "../redux/slice/authSlice";
// import { registerUserApi } from "../redux/slice/authSlice";

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    full_name: "",
    mobile_number: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const { registerLoading, error } = useSelector(
    (state) => state.auth
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const result = await dispatch(
      registerUserApi(formData)
    );

    if (result.meta.requestStatus === "fulfilled") {
      navigate(REACT_ENDPOINTS.LOGIN);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Main Wrapper */}
      <div className="relative w-full max-w-5xl h-[720px] rounded-[30px] overflow-hidden">
        
        {/* Background Blue Image */}
        <img
          src={bgImage}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />

        {/* Center Signup Card */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 px-8 py-8">

            {/* Logo */}
            <div className="flex justify-center mb-2">
              <img src={appLogo} alt="App Logo" className="w-16 h-16" />
            </div>

            {/* Heading */}
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-gray-900">
                Create account
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Join ChatFlow and start chatting instantly
              </p>
            </div>

            {/* Form */}
            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile_number"
                  placeholder="9876543210"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-gray-900"
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              {/* Sign Up */}
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:opacity-90 transition"
              >
                {registerLoading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  navigate(REACT_ENDPOINTS.LOGIN)
                }
                className="text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}