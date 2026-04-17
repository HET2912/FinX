import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  IndianRupee,
  Globe,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { countries, defaultCountryIso } from "../lib/countries";
import Logo from "../../../../FinX_Logo.png";
import bgImage from "../../../../Bg.png";

const incomeSourceOptions = [
  { value: "salary", label: "Salary" },
  { value: "business", label: "Business" },
  { value: "freelance", label: "Freelance" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
];

const currencyOptions = [
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "USD", label: "US Dollar ($)" },
];

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    incomeSource: "salary",
    monthlyIncome: "",
    preferredCurrency: "INR",
    selectedCountry: defaultCountryIso,
    phoneNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        incomeSource: user.incomeSource || "salary",
        monthlyIncome: user.monthlyIncome?.toString() || "",
        preferredCurrency: user.preferredCurrency || "INR",
        selectedCountry: defaultCountryIso,
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const selectedCountry =
    countries.find((country) => country.isoCode === formData.selectedCountry) ??
    countries[0];

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const normalizedPhone = formData.phoneNumber.trim();

    if (normalizedPhone && !/^[+]?\d[\d\s().-]{6,19}$/.test(normalizedPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const formattedPhone = normalizedPhone
      ? normalizedPhone.startsWith("+")
        ? normalizedPhone
        : `${selectedCountry.dialCode.replace(/-/g, "")} ${normalizedPhone}`
      : "";

    try {
      setSubmitting(true);
      await updateProfile({
        name: formData.name,
        email: formData.email,
        incomeSource: formData.incomeSource,
        monthlyIncome: Number(formData.monthlyIncome),
        preferredCurrency: formData.preferredCurrency,
        phoneNumber: formattedPhone,
      });
      toast.success("Profile setup complete!");
      navigate("/dashboard");
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to complete profile setup";
      toast.error(apiError);
      console.error(err);
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
      <div className="relative w-full max-w-2xl">
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

          <div className="mb-6 text-center md:text-left">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Almost Done
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Help us personalize your experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name Field */}
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Full Name
                </label>
                <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
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
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Country
                </label>
                <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                  <Globe className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <select
                    value={formData.selectedCountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selectedCountry: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-transparent py-2.5 text-white text-sm outline-none appearance-none cursor-pointer"
                  >
                    {countries.map((country) => (
                      <option
                        key={country.isoCode}
                        value={country.isoCode}
                        className="bg-slate-900 text-white"
                      >
                        {country.name} ({country.dialCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                  <span className="inline-flex items-center px-3 rounded-l-xl bg-slate-900/80 text-slate-300 text-sm border-r border-slate-700/60">
                    {selectedCountry.dialCode}
                  </span>
                  <input
                    type="tel"
                    placeholder={`${selectedCountry.dialCode} 555 000 0000`}
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="w-full bg-transparent py-2.5 px-3 text-white text-sm placeholder-slate-500 outline-none rounded-r-xl"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Income Source Field */}
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Income Source
                </label>
                <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                  <Briefcase className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <select
                    value={formData.incomeSource}
                    onChange={(e) =>
                      setFormData({ ...formData, incomeSource: e.target.value })
                    }
                    required
                    className="w-full bg-transparent py-2.5 text-white text-sm outline-none appearance-none cursor-pointer"
                  >
                    {incomeSourceOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-slate-900 "
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Monthly Income Field */}
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Monthly Income
                </label>
                <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                  <IndianRupee className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="number"
                    placeholder="5000"
                    value={formData.monthlyIncome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyIncome: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-transparent py-2.5 text-white text-sm placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Currency Field */}
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">
                Preferred Currency
              </label>
              <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                <Globe className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <select
                  value={formData.preferredCurrency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredCurrency: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-transparent py-2.5 text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  {currencyOptions.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-slate-900"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]"
              >
                Skip for Now
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
