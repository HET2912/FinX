import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await login({ email: formData.email, password: formData.password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
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
          backgroundImage: "url('/Bg.png')",
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
              src="/FinX_Logo.png"
              alt="Finx Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="mb-6">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Welcome Back
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Sign In
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) =>
                    setFormData({ ...formData, remember: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-violet-600 focus:ring-violet-500/50 focus:ring-offset-0"
                />
                <span className="text-slate-400 text-xs">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Forgot password?
              </Link>
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
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-slate-400 text-xs pt-2">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* ── Responsive overrides for mobile (max-width: 640px) ── */}
      <style>{`
  @media (max-width: 640px) {
    /* Reduce form width on mobile */
    .max-w-md {
      max-width: 18rem;  /* 320px, down from 448px */
    }
    
    /* Form card padding */
    .p-6 {
      padding: 1rem;
    }
    .md\\:p-8 {
      padding: 1rem;
    }
    
    /* Spacing adjustments */
    .space-y-5 {
      --tw-space-y-reverse: 0;
      margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
      margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
    }
    .mb-6 {
      margin-bottom: 0.75rem;
    }
    .mb-1\\.5 {
      margin-bottom: 0.25rem;
    }
    .mb-1 {
      margin-bottom: 0.125rem;
    }
    .mt-1 {
      margin-top: 0.125rem;
    }
    .pt-2 {
      padding-top: 0.25rem;
    }
    .gap-2 {
      gap: 0.25rem;
    }
    .mr-2 {
      margin-right: 0.25rem;
    }
    
    /* Input padding */
    .px-3 {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
    .py-2\\.5 {
      padding-top: 0.375rem;
      padding-bottom: 0.375rem;
    }
    .p-3 {
      padding: 0.5rem;
    }
    
    /* Typography scaling */
    .text-3xl {
      font-size: 1.5rem;
      line-height: 1.875rem;
    }
    .text-sm {
      font-size: 0.75rem;
      line-height: 1rem;
    }
    .text-xs {
      font-size: 0.625rem;
      line-height: 0.875rem;
    }
    
    /* Icon sizing */
    .w-4 {
      width: 0.75rem;
    }
    .h-4 {
      height: 0.75rem;
    }
    
    /* Logo height */
    .h-10 {
      height: 2rem;
    }
    
    /* Checkbox sizing */
    .w-4 {
      width: 0.875rem;
    }
    .h-4 {
      height: 0.875rem;
    }
    
    /* Border radius */
    .rounded-2xl {
      border-radius: 0.75rem;
    }
    .rounded-xl {
      border-radius: 0.5rem;
    }
  }
`}</style>
    </div>
  );
}
