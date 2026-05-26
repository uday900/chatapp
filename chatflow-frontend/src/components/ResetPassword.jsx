
import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth/auth";
import { showError, showSuccess } from "../utils/toast";
import bgImage from "/assets/login_bg.png";
import { REACT_ENDPOINTS } from "../utils/endpoints";
import appLogo from "/assets/app-logo.png";

const passwordSchema = Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
        /[^A-Za-z0-9]/,
        "Must contain at least one special character"
    )
    .required("Password is required");

const ResetPassword = ({ resetToken, clearResetToken }) => {
    const navigate = useNavigate();
    const passwordInputRef = useRef(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        passwordInputRef.current?.focus();

        if (!resetToken) {
            showError("Reset session expired. Please verify OTP again.");
            navigate(REACT_ENDPOINTS.FORGOT_PASSWORD);
        }
    }, [resetToken, navigate]);

    const formik = useFormik({
        initialValues: {
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema: Yup.object({
            newPassword: passwordSchema,
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("newPassword")], "Passwords must match")
                .required("Confirm password is required"),
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);

                await resetPassword(
                    resetToken,
                    values.newPassword
                );

                formik.resetForm();

                clearResetToken?.();

                showSuccess("Password reset successful");

                navigate(REACT_ENDPOINTS.LOGIN);

            } catch (error) {

                const errorCode =
                    error?.response?.data?.errorCode;

                const message =
                    error?.response?.data?.message;

                if (error.status === 429) {

                    showError(
                        "Too many requests. Try later."
                    );

                } else if (
                    errorCode ===
                    "RESET_TOKEN_EXPIRED"
                ) {

                    showError(
                        "Reset session expired. Please verify OTP again."
                    );

                    clearResetToken?.();

                    navigate(
                        REACT_ENDPOINTS.FORGOT_PASSWORD
                    );

                } else if (
                    errorCode ===
                    "INVALID_RESET_TOKEN"
                ) {

                    showError(
                        "Invalid reset session. Please request a new OTP."
                    );

                    clearResetToken?.();

                    navigate(
                        REACT_ENDPOINTS.FORGOT_PASSWORD
                    );

                } else {

                    showError(
                        message ||
                        "Failed to reset password"
                    );
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
                <img src={bgImage} alt="background" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                {/* Center Card */} <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-[380px] bg-white/95 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 px-8 py-8">
                        {/* Logo */}
                        <div className="flex justify-center mb-2">
                                         <img src={appLogo} alt="App Logo" className="w-16 h-16" />
                           
                        </div>
                        {/* Heading */}
                        <div className="text-center mb-7">
                            <h1 className="text-2xl font-bold text-gray-900"> Reset Password </h1>
                            <p className="text-sm text-gray-500 mt-2"> Create a strong new password </p>
                        </div>
                        {/* Form */}
                        <form onSubmit={formik.handleSubmit} className="space-y-4" >
                            {/* New Password */}
                            <div>
                                <label htmlFor="newPassword" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2" > New Password </label>
                                <input
                                    ref={passwordInputRef}
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={formik.values.newPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    aria-invalid={formik.touched.newPassword && formik.errors.newPassword
                                        ? "true"
                                        : "false"}
                                    aria-describedby="new-password-error"
                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition" />
                                {formik.touched.newPassword && formik.errors.newPassword && (<p id="new-password-error" className="mt-1 text-sm text-red-500" > {formik.errors.newPassword} </p>)}
                            </div> {/* Confirm Password */} <div>
                                <label htmlFor="confirmPassword" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2" >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    aria-invalid={formik.touched.confirmPassword && formik.errors.confirmPassword ? "true" : "false"}
                                    aria-describedby="confirm-password-error"
                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition" />
                                {formik.touched.confirmPassword && formik.errors.confirmPassword &&
                                    (<p id="confirm-password-error" className="mt-1 text-sm text-red-500" >
                                        {formik.errors.confirmPassword} </p>
                                    )
                                }
                            </div>
                            {/* Password Rules */}
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                                Password must contain:
                                <ul className="mt-2 list-disc pl-5 space-y-1">
                                    <li>Minimum 8 characters</li>
                                    <li>One uppercase letter</li>
                                    <li>One lowercase letter</li>
                                    <li>One number</li>
                                    <li>One special character</li>
                                </ul> </div> {/* Submit */}
                            <button type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50" >
                                {loading ? "Resetting Password..." : "Reset Password"}
                            </button>
                        </form>
                        {/* Footer */}
                        <p className="text-center text-sm text-gray-500 mt-4"> Back to{" "}
                            <button className="text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer"
                                onClick={() => navigate(REACT_ENDPOINTS.LOGIN)} > Sign in </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;