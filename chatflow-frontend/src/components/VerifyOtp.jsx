import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import { useFormik } from "formik";
import * as Yup from "yup";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import bgImage from "/assets/login_bg.png";

import { verifyForgotOtp } from "../api/auth/auth";

import {
    showError,
    showSuccess,
} from "../utils/toast";
import { REACT_ENDPOINTS } from "../utils/endpoints";

const MAX_ATTEMPTS = 5;

const VerifyOtp = ({
    setResetToken,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const otpInputRef = useRef(null);

    const email =
        location.state?.email || "";

    const [loading, setLoading] =
        useState(false);

    const [attempts, setAttempts] =
        useState(0);

    useEffect(() => {
        otpInputRef.current?.focus();

        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const formik = useFormik({
        initialValues: {
            otp: "",
        },

        validationSchema: Yup.object({
            otp: Yup.string()
                .matches(
                    /^\d{6}$/,
                    "OTP must be 6 digits"
                )
                .required("OTP is required"),
        }),

        onSubmit: async (values) => {
            if (attempts >= MAX_ATTEMPTS) {
                showError(
                    "Maximum attempts reached. Request a new OTP."
                );

                return;
            }

            try {
                setLoading(true);

                const response =
                    await verifyForgotOtp(
                        email,
                        values.otp
                    );

                const token =
                    response?.resetToken;

                if (!token) {
                    throw new Error(
                        "Reset token missing"
                    );
                }

                setResetToken(token);

                formik.resetForm();

                showSuccess(
                    "OTP verified successfully"
                );

                navigate(REACT_ENDPOINTS.RESET_PASSWORD);
            } catch (error) {
                setAttempts((prev) => prev + 1);

                if (error.status === 429) {
                    showError(
                        "Too many requests. Try later."
                    );
                } else {
                    showError(
                        error.message ||
                        "Invalid or expired OTP"
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
                <img
                    src={bgImage}
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />

                {/* Center Card */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-[380px] bg-white/95 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 px-8 py-8">

                        {/* Logo */}
                        <div className="flex justify-center mb-5">
                            <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center">
                                <span className="text-white text-lg font-bold">
                                    ⚡
                                </span>
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="text-center mb-7">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Verify OTP
                            </h1>

                            <p className="text-sm text-gray-500 mt-2">
                                Enter the 6-digit OTP
                                sent to your email
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={
                                formik.handleSubmit
                            }
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="otp"
                                    className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2"
                                >
                                    OTP
                                </label>

                                <input
                                    ref={otpInputRef}
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    placeholder="123456"
                                    value={
                                        formik.values.otp
                                    }
                                    onChange={
                                        formik.handleChange
                                    }
                                    onBlur={
                                        formik.handleBlur
                                    }
                                    aria-invalid={
                                        formik.touched.otp &&
                                            formik.errors.otp
                                            ? "true"
                                            : "false"
                                    }
                                    aria-describedby="otp-error"
                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition tracking-[0.4em] text-center text-lg"
                                />

                                {formik.touched.otp &&
                                    formik.errors.otp && (
                                        <p
                                            id="otp-error"
                                            className="mt-1 text-sm text-red-500"
                                        >
                                            {
                                                formik.errors
                                                    .otp
                                            }
                                        </p>
                                    )}
                            </div>

                            {/* Attempts */}
                            <div className="text-sm text-gray-500">
                                Attempts remaining:{" "}
                                {
                                    MAX_ATTEMPTS -
                                    attempts
                                }
                            </div>

                            {/* Verify Button */}
                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    attempts >=
                                    MAX_ATTEMPTS
                                }
                                className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:opacity-90 transition 
                disabled:cursor-not-allowed disabled:opacity-50
                cursor-pointer"
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify OTP"}
                            </button>
                        </form>

                        {/* Info Box */}
                        <div className="my-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            Please enter the OTP
                            within 5 minutes before
                            it expires.
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Wrong email?{" "}
                            <button
                                className="text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer"
                                onClick={() =>
                                    navigate(
                                        REACT_ENDPOINTS.FORGOT_PASSWORD
                                    )
                                }
                            >
                                Go back
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;