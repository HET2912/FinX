import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../../../../FinX_Logo.png";
import bgImage from "../../../../Bg.png";

export function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/profile-setup");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (err as any)?.response?.data?.message || "Signup failed";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0b0f19]">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          // filter: "blur(1px)",
          transform: "scale(1.05)",
        }}
      />
      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative w-full max-w-md">
        {/* Form Card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Logo inside card */}
          <div className="flex justify-center mb-6">
            <img
              src={Logo}
              alt="Finx Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="mb-6">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Join Us
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Sign Up
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Create an account to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Full Name
              </label>
              <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                <User className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full bg-transparent py-2.5 text-white text-sm placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Email
              </label>
              <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                <Mail className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full bg-transparent py-2.5 text-white text-sm placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Password
              </label>
              <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                <Lock className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="w-full bg-transparent py-2.5 text-white text-sm placeholder-slate-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Confirm Password
              </label>
              <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                <Lock className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-transparent py-2.5 text-white text-sm placeholder-slate-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              }}
            >
              <span className="flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
            </button>

            {/* Sign In Link */}
            <p className="text-center text-slate-400 text-xs pt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
