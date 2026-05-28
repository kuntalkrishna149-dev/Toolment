import React, { useState } from "react";
import { User, Eye, EyeOff, Save, Palette, ShieldAlert, KeyRound } from "lucide-react";
import { User as UserType } from "../types";

interface ProfileViewProps {
  user: UserType | null;
  currentTheme: "dark" | "light" | "emerald" | "ruby" | "ocean" | "sunset" | "forest" | "lavender";
  onThemeChange: (theme: "dark" | "light" | "emerald" | "ruby" | "ocean" | "sunset" | "forest" | "lavender") => void;
  onProfileUpdate: (updatedUser: UserType) => void;
}

export default function ProfileView({ user, currentTheme, onThemeChange, onProfileUpdate }: ProfileViewProps) {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("toolment_token");
    if (!token) {
      setError("Active session not found. Please log back in.");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {};
      if (username) payload.username = username;
      if (email) payload.email = email;
      if (password) payload.password = password;

      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Profile update failure.");
      }

      setSuccess("Profile settings updated successfully!");
      onProfileUpdate(data.user);
      setPassword(""); // Reset password input field after completion
    } catch (err: any) {
      setError(err.message || "Unable to save profile changes.");
    } finally {
      setLoading(false);
    }
  };

  const themesList: Array<{
    id: "dark" | "light" | "emerald" | "ruby" | "ocean" | "sunset" | "forest" | "lavender";
    name: string;
    desc: string;
    glowClass: string;
    dotColor: string;
    type: "light" | "dark";
  }> = [
    {
      id: "dark",
      name: "Dark Space",
      desc: "Futuristic slate neon space",
      glowClass: "border-blue-500/30 hover:shadow-blue-500/10",
      dotColor: "bg-blue-500",
      type: "dark"
    },
    {
      id: "light",
      name: "Minimal Light",
      desc: "Clean desktop editorial paper",
      glowClass: "border-slate-500/20 hover:shadow-slate-500/10",
      dotColor: "bg-slate-600",
      type: "light"
    },
    {
      id: "emerald",
      name: "Cyber Emerald",
      desc: "Vibrant high-contrast green",
      glowClass: "border-emerald-500/30 hover:shadow-emerald-500/10",
      dotColor: "bg-emerald-500",
      type: "dark"
    },
    {
      id: "ruby",
      name: "Deep Ruby",
      desc: "Cinematic sunset velvet crimson",
      glowClass: "border-rose-500/30 hover:shadow-rose-500/10",
      dotColor: "bg-rose-500",
      type: "dark"
    },
    {
      id: "ocean",
      name: "Midnight Ocean",
      desc: "Deep atmospheric maritime indigo",
      glowClass: "border-cyan-500/30 hover:shadow-cyan-500/10",
      dotColor: "bg-cyan-500",
      type: "dark"
    },
    {
      id: "sunset",
      name: "Golden Sunset",
      desc: "High-contrast neon solar amber",
      glowClass: "border-amber-500/30 hover:shadow-amber-500/10",
      dotColor: "bg-amber-500",
      type: "dark"
    },
    {
      id: "forest",
      name: "Sage Forest",
      desc: "Calm organic nature moss tones",
      glowClass: "border-green-800/20 hover:shadow-green-800/10",
      dotColor: "bg-green-700",
      type: "light"
    },
    {
      id: "lavender",
      name: "Royal Lavender",
      desc: "Elegant pastel purple & mauve",
      glowClass: "border-purple-500/20 hover:shadow-purple-500/10",
      dotColor: "bg-purple-600",
      type: "light"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--theme)]/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-[var(--theme)] to-[var(--theme2)] flex items-center justify-center shadow-lg">
            <span className="text-3xl font-display font-black text-white">
              {username ? username.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          <div className="text-center md:text-left space-y-1.5">
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-[var(--textColor)]">
              {username || "User Account"}
            </h2>
            <p className="text-sm text-[var(--textMuted)]">{email || "No email assigned"}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--tagBg)] border border-[var(--line-clr)] text-xs text-[var(--textColor)] font-mono">
                👤 ROLE: {email.toLowerCase() === "kuntal2010oct@gmail.com" ? "Principal Admin" : "Standard User"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--tagBg)] border border-[var(--line-clr)] text-xs text-[var(--textColor)] font-mono">
                🎨 ACTIVE THEME: {currentTheme.toUpperCase()} ({["light", "forest", "lavender"].includes(currentTheme) ? "LIGHT MODE" : "DARK MODE"})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: VISUAL THEME CONTROLS */}
        <div className="md:col-span-5 bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
          <div className="space-y-1.5 border-b border-[var(--line-clr)] pb-4">
            <h3 className="font-display font-bold text-lg text-[var(--textColor)] flex items-center gap-2">
              <Palette className="w-5 h-5 text-[var(--theme)]" /> Theme Calibration
            </h3>
            <p className="text-xs text-[var(--textMuted)]">
              Select an option below. The color palette updates immediately across all screens of the dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {themesList.map((item) => (
              <button
                key={item.id}
                onClick={() => onThemeChange(item.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 hover:translate-y-[-2px] hover:shadow-lg ${item.glowClass} ${
                  currentTheme === item.id
                    ? "border-[var(--theme)] bg-[var(--active-clr)] shadow-md"
                    : "border-[var(--line-clr)] bg-[var(--mainBg)]/50"
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${item.dotColor} flex-shrink-0 relative`}>
                  {currentTheme === item.id && (
                    <span className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-75"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-bold text-sm text-[var(--textColor)] truncate">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-black tracking-wider leading-none border flex-shrink-0 ${
                      item.type === "dark" 
                        ? "bg-slate-950/25 border-slate-700/40 text-slate-400" 
                        : "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400"
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--textMuted)] truncate">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT SECURITY CONFIGS */}
        <div className="md:col-span-7 bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
          <div className="space-y-1.5 border-b border-[var(--line-clr)] pb-4">
            <h3 className="font-display font-bold text-lg text-[var(--textColor)] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[var(--theme)]" /> Profile Security Settings
            </h3>
            <p className="text-xs text-[var(--textMuted)]">
              Update your account credentials. Secure database encryption is triggered automatically upon changes.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
                Username / Display Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Alter username"
                required
                className="w-full bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] rounded-xl py-2.5 px-4 outline-hidden focus:border-[var(--theme)] focus:ring-1 focus:ring-[var(--theme)] transition-all text-sm font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alter email address"
                required
                className="w-full bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] rounded-xl py-2.5 px-4 outline-hidden focus:border-[var(--theme)] focus:ring-1 focus:ring-[var(--theme)] transition-all text-sm font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
                Update Password <span className="text-[10px] lowercase text-[var(--textMuted)]/60">(leave blank to keep current)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] rounded-xl py-2.5 px-4 pr-11 outline-hidden focus:border-[var(--theme)] focus:ring-1 focus:ring-[var(--theme)] transition-all text-sm font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--textMuted)] hover:text-[var(--textColor)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-linear-to-r from-[var(--theme)] to-[var(--theme2)] hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <span className="w-4.5 h-4.5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Security Settings
                  </>
                )}
              </button>
            </div>
          </form>

          {email.toLowerCase() === "kuntal2010oct@gmail.com" && (
            <div className="mt-6 p-4 rounded-xl bg-[var(--tagBg)] border border-amber-500/20 text-amber-500 text-xs font-mono space-y-1 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Administrator Credentials Active:</span> As the developer, you have complete visibility over feedback logs, database tables, and user reports. Access the dashboard Sidebar menu to inspect details.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
