

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { forgotPassword } from "../api/auth/auth";
import bgImage from "/assets/login_bg.png";
import { REACT_ENDPOINTS } from "../utils/endpoints";
import { showError, showSuccess } from "../utils/toast";
import appLogo from "/assets/app-logo.png";


const RESEND_COOLDOWN = 60;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    let interval;

    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [cooldown]);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        await forgotPassword(values.email);

        showSuccess("If account exists, OTP sent successfully");

        setCooldown(RESEND_COOLDOWN);

        navigate(REACT_ENDPOINTS.VERIFY_OTP, {
          state: {
            email: values.email,
          },
        });
      } catch (error) {
        if (error.status === 429) {
          showError("Too many requests. Try later.");
        } else {
          showError(error.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
  <div className="min-h-screen flex items-center justify-center px-4">
    {/* Main Wrapper */}
    <div className="relative w-full max-w-5xl h-[650px] rounded-[30px] overflow-hidden">

      {/* Background */}
      <img
        src={bgImage}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />

      {/* Center Card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[380px] bg-white/95 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 px-8 py-8">

          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img src={appLogo} alt="App Logo" className="w-16 h-16" />
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-gray-900">
              Forgot Password
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Enter your email to receive OTP
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={formik.handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2"
              >
                Email
              </label>

              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="uday@darla.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={
                  formik.touched.email &&
                  formik.errors.email
                    ? "true"
                    : "false"
                }
                aria-describedby="email-error"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />

              {formik.touched.email &&
                formik.errors.email && (
                  <p
                    id="email-error"
                    className="mt-1 text-sm text-red-500"
                  >
                    {formik.errors.email}
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={
                loading || cooldown > 0
              }
              className="w-full h-11 rounded-xl bg-black text-white font-semibold 
              hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50
              cursor-pointer"
            >
              {loading
                ? "Sending OTP..."
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Send OTP"}
            </button>
          </form>

          {/* Info Box */}
          <div className="my-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            We'll send a secure OTP to your
            registered email address.
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Remember your password?{" "}
            <button
              className="text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer"
              onClick={() => navigate(REACT_ENDPOINTS.LOGIN)}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
    // <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    //   <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
    //     <h1 className="mb-2 text-2xl font-bold text-gray-900">
    //       Forgot Password
    //     </h1>

    //     <p className="mb-6 text-sm text-gray-500">
    //       Enter your email to receive OTP
    //     </p>

    //     <form onSubmit={formik.handleSubmit} className="space-y-5">
    //       <div>
    //         <label
    //           htmlFor="email"
    //           className="mb-2 block text-sm font-medium text-gray-700"
    //         >
    //           Email
    //         </label>

    //         <input
    //           ref={emailInputRef}
    //           id="email"
    //           name="email"
    //           type="email"
    //           autoComplete="email"
    //           placeholder="Enter your email"
    //           value={formik.values.email}
    //           onChange={formik.handleChange}
    //           onBlur={formik.handleBlur}
    //           aria-invalid={
    //             formik.touched.email && formik.errors.email ? "true" : "false"
    //           }
    //           aria-describedby="email-error"
    //           className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
    //         />

    //         {formik.touched.email && formik.errors.email && (
    //           <p
    //             id="email-error"
    //             className="mt-1 text-sm text-red-500"
    //           >
    //             {formik.errors.email}
    //           </p>
    //         )}
    //       </div>

    //       <button
    //         type="submit"
    //         disabled={loading || cooldown > 0}
    //         className="flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    //       >
    //         {loading
    //           ? "Sending OTP..."
    //           : cooldown > 0
    //           ? `Resend in ${cooldown}s`
    //           : "Send OTP"}
    //       </button>
    //     </form>
    //   </div>
    // </div>
  );
};

export default ForgotPassword;