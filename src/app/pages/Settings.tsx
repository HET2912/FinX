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
  Loader2,
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

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

    setIsUpdatingProfile(true);
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
    } finally {
      setIsUpdatingProfile(false);
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

    setIsChangingPassword(true);
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
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSavingPreferences(true);
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
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
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
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto px-1">
        {/* Header */}
        <div className="space-y-2">
          {/* Row 1: Heading */}
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
                Account & Preferences
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Settings
              </h1>
            </div>
          </div>

          {/* Row 2: Description paragraph */}
          <p className="text-slate-400 text-sm">
            Manage your account details, security, and application preferences
          </p>
        </div>
        {/* 2x2 Grid with custom pairing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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
                  {isUploadingAvatar ? (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-800 ring-2 ring-white/10">
                      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    </div>
                  ) : user?.profilePicture ? (
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
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "#1e2535",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-3 h-3 text-slate-300 animate-spin" />
                    ) : (
                      <Camera className="w-3 h-3 text-slate-300" />
                    )}
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
                  disabled={isUploadingAvatar}
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
                  disabled={isUpdatingProfile}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  disabled={isUpdatingProfile}
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
                disabled={isUpdatingProfile}
              />

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  }}
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
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
                disabled={isChangingPassword}
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
                  disabled={isChangingPassword}
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
                  disabled={isChangingPassword}
                />
              </div>
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  }}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
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
                    disabled={isSavingPreferences}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-normal bg-[#1e2535] border border-[#2a3347] outline-none transition-all hover:border-[#3d4f6e] focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/15 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isSavingPreferences}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-normal bg-[#1e2535] border border-[#2a3347] outline-none transition-all hover:border-[#3d4f6e] focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/15 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isSavingPreferences}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  }}
                >
                  {isSavingPreferences ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
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

      {/* ── Responsive overrides for mobile (max-width: 640px) ── */}
      <style>{`
        @media (max-width: 640px) {
          /* Container spacing */
          .space-y-6 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
          }
          .space-y-5 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
          }
          .space-y-4 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
          }
          .space-y-2 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.25rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.25rem * var(--tw-space-y-reverse));
          }
          .space-y-1\\.5 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.125rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.125rem * var(--tw-space-y-reverse));
          }
          .gap-6 {
            gap: 0.75rem;
          }
          .gap-5 {
            gap: 0.5rem;
          }
          .gap-4 {
            gap: 0.5rem;
          }
          .gap-3 {
            gap: 0.375rem;
          }
          .gap-2\\.5 {
            gap: 0.25rem;
          }
          .gap-2 {
            gap: 0.25rem;
          }
          
          /* Padding adjustments */
          .p-6 {
            padding: 0.75rem;
          }
          .px-5 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .px-4 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .py-4 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .py-3\\.5 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .py-3 {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
          .py-2\\.5 {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
          .py-2 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          .pt-1 {
            padding-top: 0.125rem;
          }
          .pb-2 {
            padding-bottom: 0.25rem;
          }
          .pb-1 {
            padding-bottom: 0.125rem;
          }
          
          /* Margin adjustments */
          .mb-6 {
            margin-bottom: 0.5rem;
          }
          .mb-4 {
            margin-bottom: 0.5rem;
          }
          .mt-1 {
            margin-top: 0.125rem;
          }
          .mt-0\\.5 {
            margin-top: 0.0625rem;
          }
          
          /* Typography scaling */
          .text-4xl {
            font-size: 1.875rem;
            line-height: 2.25rem;
          }
          .text-\\[17px\\] {
            font-size: 0.875rem;
          }
          .text-xl {
            font-size: 1.125rem;
            line-height: 1.5rem;
          }
          .text-sm {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          .text-xs {
            font-size: 0.625rem;
            line-height: 0.875rem;
          }
          .text-\\[11px\\] {
            font-size: 0.5625rem;
          }
          
          /* Icon sizing */
          .w-16 {
            width: 3rem;
          }
          .h-16 {
            height: 3rem;
          }
          .w-11 {
            width: 1.75rem;
          }
          .h-6 {
            height: 1.25rem;
          }
          .w-9 {
            width: 1.5rem;
          }
          .h-9 {
            height: 1.5rem;
          }
          .w-6 {
            width: 1rem;
          }
          .h-6 {
            height: 1rem;
          }
          .w-5 {
            width: 0.875rem;
          }
          .h-5 {
            height: 0.875rem;
          }
          .w-4 {
            width: 0.75rem;
          }
          .h-4 {
            height: 0.75rem;
          }
          .w-3 {
            width: 0.625rem;
          }
          .h-3 {
            height: 0.625rem;
          }
          
          /* Toggle sizing */
          .w-11 {
            width: 1.75rem;
          }
          .h-6 {
            height: 1.25rem;
          }
          .left-\\[22px\\] {
            left: 0.875rem;
          }
          .w-5 {
            width: 0.875rem;
          }
          .h-5 {
            height: 0.875rem;
          }
          
          /* Border radius */
          .rounded-2xl {
            border-radius: 0.75rem;
          }
          .rounded-xl {
            border-radius: 0.5rem;
          }
          .rounded-full {
            border-radius: 9999px;
          }
        }
      `}</style>
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
  const TRACK_W = 40; // px
  const TRACK_H = 22;
  const KNOB = 16;
  const GAP = 3;

  const translateX = TRACK_W - KNOB - GAP * 2;

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative shrink-0 rounded-full transition-all duration-300 focus:outline-none"
      style={{
        width: TRACK_W,
        height: TRACK_H,
        background: checked
          ? "linear-gradient(135deg, #7c3aed, #06b6d4)"
          : "linear-gradient(135deg, #1e2535, #2a3347)",
        border: checked
          ? "1px solid rgba(124,58,237,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Knob */}
      <span
        className="absolute rounded-full bg-white flex items-center justify-center transition-transform duration-300"
        style={{
          width: KNOB,
          height: KNOB,
          top: "50%",
          left: GAP,
          transform: `translateY(-50%) translateX(${checked ? translateX : 0}px)`,
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
    </button>
  );
}