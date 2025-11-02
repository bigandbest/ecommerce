"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Name validation
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        email,
        password,
        full_name: name,
        user_type: "individual",
      });
      if (result.success) {
        toast.success(
          "Registration successful! Please check your email to verify your account."
        );
        router.push("/pages/login");
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-7xl h-auto flex items-center font-outfit bg-[#2A2A2A] rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Container */}
        <div className="hidden md:flex md:w-[60%] h-[600px] p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#FD5B00] to-[#FF8A00] rounded-xl flex items-center justify-center relative overflow-hidden">
            <video
              className="w-full h-full object-cover rounded-xl"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/loginsignupvideo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Right Container */}
        <div className="w-full md:w-[40%] h-[600px] flex flex-col justify-center px-8 lg:px-12 py-8">
          <div className="w-full h-auto flex flex-col gap-6 xl:gap-8">
            <h1 className="text-3xl font-semibold text-[#F8F8FA] xl:text-5xl">
              Sign Up
            </h1>

            <form
              onSubmit={handleSubmit}
              className="w-full h-auto flex flex-col gap-5"
            >
              {/* Name Field */}
              <div className="w-full h-auto flex flex-col gap-3">
                <label htmlFor="email" className="text-[#F8F8FA]">
                  Name
                </label>
                <input
                  type="text"
                  required
                  id="name"
                  placeholder="Enter Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 bg-[#F8F8FA] outline-none xl:h-12 rounded-2xl p-3"
                />
              </div>

              {/* Email Field */}
              <div className="w-full h-auto flex flex-col gap-3">
                <label htmlFor="email" className="text-[#F8F8FA]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  id="email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 bg-[#F8F8FA] outline-none xl:h-12 rounded-2xl p-3"
                />
              </div>

              {/* Password Field with Toggle */}
              <div className="w-full h-auto flex flex-col gap-3 relative">
                <label htmlFor="password" className="text-[#F8F8FA]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    id="password"
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 bg-[#F8F8FA] outline-none xl:h-12 rounded-2xl p-3 pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[#F8F8FA] text-sm lg:text-base">
                have an account?{" "}
                <Link
                  href={"/pages/login"}
                  className="text-[#FF7558] cursor-pointer"
                >
                  Sign In
                </Link>
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="bg-[#FD5B00] text-white font-semibold rounded-2xl text-center xl:py-3 cursor-pointer md:hover:bg-[#fd5d00c9] xl:text-xl py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>
          </div>

          <div className="w-full h-auto flex flex-col gap-4 xl:gap-6">
            {/* Custom Styled Checkbox */}
            <div className="w-full h-auto flex gap-3 items-start md:items-center">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="hidden"
                />
                <div
                  className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                    rememberMe
                      ? "bg-[#FD5B00] border-[#FD5B00]"
                      : "bg-white border-gray-300"
                  }`}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <label
                htmlFor="terms"
                className="text-white text-xs xl:text-base cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
              >
                By clicking Create account, I agree that I have read and
                accepted the Terms of Use and Privacy Policy.
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
