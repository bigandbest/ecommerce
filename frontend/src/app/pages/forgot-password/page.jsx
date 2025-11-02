"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import Link from "next/link";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setIsEmailSent(true);
        toast.success("Password reset email sent! Please check your inbox.");
      } else {
        toast.error(result.error || "Failed to send reset email");
      }
    } catch (error) {
      toast.error("An error occurred while sending reset email");
    } finally {
      setLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 lg:p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h2>
            <p className="text-gray-600 mb-6">
              We have sent a password reset link to {email}
            </p>
            <Link
              href="/pages/login"
              className="text-[#FF6B00] hover:text-[#e65c00] font-medium"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 lg:p-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot your password?
          </h2>
          <p className="text-gray-600">
            Enter your email address and we will send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6B00] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#e65c00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
          >
            {loading ? "Sending..." : "Send reset email"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/pages/login"
            className="text-[#FF6B00] hover:text-[#e65c00] font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
