import { useEffect, useRef, useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import {
  User,
  Lock,
  Bell,
  Palette,
  Camera,
  Shield,
  Trash2,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border ${className}`}
      style={{ background: "#111827", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + "22", border: `1px solid ${color}44` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <h2 className="text-[17px] font-semibold text-white">{label}</h2>
    </div>
  );
}

export function Settings() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [preferences, setPreferences] = useState({
    currency: "INR",
    language: "en",
    notifications: {
      email: true,
      push: true,
      budgetAlerts: true,
      goalReminders: true,
      groupUpdates: true,
    },
  });

  useEffect(() => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    });
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem("finx_preferences");
    if (!stored) {
      setPreferences((p) => ({
        ...p,
        currency: user?.preferredCurrency || p.currency,
      }));
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setPreferences((p) => ({
        currency: user?.preferredCurrency || parsed.currency || p.currency,
        language: parsed.language || p.language,
        notifications: { ...p.notifications, ...(parsed.notifications || {}) },
      }));
    } catch {
      setPreferences((p) => ({
        ...p,
        currency: user?.preferredCurrency || p.currency,
      }));
    }
  }, [user?.preferredCurrency]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = profileData.phoneNumber.trim();
    if (normalizedPhone && !/^[+]?[\d\s().-]{7,20}$/.test(normalizedPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    try {
      await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phoneNumber: normalizedPhone,
      });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.errors?.[0]?.message ||
          err?.response?.data?.message ||
          "Failed to update profile",
      );
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error("Please fill all password fields");
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const response = await api.patch("/users/change-password", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });
      toast.success(response?.data?.message || "Password changed successfully");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.errors?.[0]?.message ||
          err?.response?.data?.message ||
          "Failed to change password",
      );
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ preferredCurrency: preferences.currency });
      localStorage.setItem(
        "finx_preferences",
        JSON.stringify({
          currency: preferences.currency,
          language: preferences.language,
          notifications: preferences.notifications,
        }),
      );
      toast.success("Preferences saved successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.errors?.[0]?.message ||
          err?.response?.data?.message ||
          "Failed to save preferences",
      );
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
      toast.success("Profile photo updated");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.errors?.[0]?.message ||
          err?.response?.data?.message ||
          "Failed to update profile photo",
      );
    } finally {
      e.target.value = "";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="pb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-violet-100 to-cyan-200 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage your account and preferences
          </p>
        </div>

        {/* 2x2 Grid with custom pairing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Profile & Notifications */}
          <SectionCard>
            <SectionHeader
              icon={<User className="w-4 h-4" />}
              label="Profile"
              color="#8b5cf6"
            />

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar row */}
              <div className="flex items-center gap-5 pb-1">
                <div className="relative shrink-0">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="avatar"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold ring-2 ring-white/10"
                      style={{
                        background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                      }}
                    >
                      {user?.name?.slice(0, 2).toUpperCase() || "JD"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      background: "#1e2535",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <Camera className="w-3 h-3 text-slate-300" />
                  </button>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {user?.name || "Your Name"}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {user?.email || "your@email.com"}
                  </p>
                  <p className="text-slate-600 text-[11px] mt-1">
                    JPG, PNG or GIF · max 2MB
                  </p>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              </div>

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={profileData.phoneNumber}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    phoneNumber: e.target.value,
                  })
                }
              />

              <div className="pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<Bell className="w-4 h-4" />}
              label="Notifications"
              color="#f59e0b"
            />
            <div className="space-y-2">
              {[
                {
                  key: "email",
                  title: "Email Notifications",
                  desc: "Receive notifications via email",
                },
                {
                  key: "push",
                  title: "Push Notifications",
                  desc: "Receive push notifications on your device",
                },
                {
                  key: "budgetAlerts",
                  title: "Budget Alerts",
                  desc: "Get notified when you exceed your budget",
                },
                {
                  key: "goalReminders",
                  title: "Goal Reminders",
                  desc: "Reminders to help you reach your savings goals",
                },
                {
                  key: "groupUpdates",
                  title: "Group Updates",
                  desc: "Notifications from group expense activities",
                },
              ].map(({ key, title, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div>
                    <p className="text-white text-sm font-medium">{title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                  </div>
                  <Toggle
                    checked={
                      preferences.notifications[
                        key as keyof typeof preferences.notifications
                      ]
                    }
                    onChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          [key]: checked,
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Row 2: Password & Preferences */}
          <SectionCard>
            <SectionHeader
              icon={<Lock className="w-4 h-4" />}
              label="Change Password"
              color="#06b6d4"
            />
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={passwordData.current}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current: e.target.value })
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.new}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new: e.target.value })
                  }
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.confirm}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirm: e.target.value,
                    })
                  }
                />
              </div>
              <div className="pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<Palette className="w-4 h-4" />}
              label="Preferences"
              color="#10b981"
            />
            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Currency select */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Currency
                  </label>
                  <select
                    value={preferences.currency}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        currency: e.target.value,
                      })
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-normal bg-[#1e2535] border border-[#2a3347] outline-none transition-all hover:border-[#3d4f6e] focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/15 appearance-none cursor-pointer"
                    style={{ colorScheme: "dark" }}
                  >
                    {currencyOptions.map((o) => (
                      <option
                        key={o.value}
                        value={o.value}
                        className="bg-[#1e2535]"
                      >
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Language select */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        language: e.target.value,
                      })
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-normal bg-[#1e2535] border border-[#2a3347] outline-none transition-all hover:border-[#3d4f6e] focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/15 appearance-none cursor-pointer"
                    style={{ colorScheme: "dark" }}
                  >
                    {languageOptions.map((o) => (
                      <option
                        key={o.value}
                        value={o.value}
                        className="bg-[#1e2535]"
                      >
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </SectionCard>
        </div>

        {/* Danger Zone */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "rgba(239,68,68,0.04)",
            borderColor: "rgba(239,68,68,0.2)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <Shield className="w-4 h-4 text-rose-400" />
            <h2 className="text-[17px] font-semibold text-rose-400">
              Danger Zone
            </h2>
          </div>
          <div
            className="flex items-center justify-between px-4 py-4 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <div>
              <p className="text-white text-sm font-medium">Delete Account</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-400 transition-all hover:bg-rose-500/10 active:scale-[0.98]"
              style={{ border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative shrink-0 w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
      style={{
        background: checked
          ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
          : "#1e2535",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${checked ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}
