"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function OTPVerifyPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations("OTP");

    const uid = searchParams.get("uid");
    const role = searchParams.get("role");

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [timer, setTimer] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (!uid || !role) {
            setError(t("error_invalid_access"));
        }
    }, [uid, role, t]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Separate timer for resend button (30 seconds)
    useEffect(() => {
        setResendDisabled(true);
        const resendTimer = setTimeout(() => {
            setResendDisabled(false);
        }, 30000);
        return () => clearTimeout(resendTimer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, otp, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || t("error_verification_failed"));
            }

            setSuccess(t("success_verified"));
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setSuccess("");

        setResendDisabled(true);
        setTimeout(() => {
            setResendDisabled(false);
        }, 30000);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || t("error_resend_failed"));
            }

            setSuccess(t("success_resent"));
            setTimer(300);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-linen">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-soft p-6 sm:p-10">
                <h1 className="text-center text-3xl font-serif font-bold text-cocoa mb-2">
                    {t("title")}
                </h1>
                <p className="text-center text-taupe mb-8 text-sm">
                    {t("description")}
                </p>

                {error && <p className="mb-4 text-sm text-red-600 text-center">{error}</p>}
                {success && <p className="mb-4 text-sm text-green-600 text-center">{success}</p>}

                <form onSubmit={handleVerify} className="space-y-5">
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-borderSoft text-center text-2xl tracking-widest text-cocoa focus:outline-none focus:border-gold focus:ring-1 transition-all"
                        placeholder="000000"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                    />

                    <p className="text-center text-sm text-taupe">
                        {t("expires_in")} <span className="font-semibold text-cocoa">{formatTime(timer)}</span>
                    </p>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className={`w-full py-4 rounded-xl text-sand font-semibold bg-cocoa transition-all ${loading || otp.length !== 6 ? "opacity-60 cursor-not-allowed" : "hover:bg-taupe"
                            }`}
                    >
                        {loading ? t("verifying") : t("verify_proceed")}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-taupe">{t("didnt_receive")}</p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendDisabled}
                        className={`mt-2 text-sm font-semibold ${resendDisabled ? "text-gray-400 cursor-not-allowed" : "text-cocoa hover:text-goldDark hover:underline"
                            }`}
                    >
                        {resendDisabled ? t("resend_wait") : t("resend_otp")}
                    </button>
                </div>
            </div>
        </div>
    );
}
