import React, { useState } from "react";
import { LogIn, UserPlus, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { User } from "../types";

interface LoginViewProps {
  onAuthSuccess: (user: User, token: string) => void;
}

export default function LoginView({ onAuthSuccess }: LoginViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload = isSignUp 
      ? { username, email, password }
      : { email, password };

    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred. Please try again.");
      }

      setSuccess(isSignUp ? "Account registered successfully!" : "Login successful! Entering workspace...");
      
      // Seed slightly delay to enjoy the animation feel
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
      }, 700);

    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-linear-to-b from-[var(--card1)] to-[var(--card2)] rounded-3xl border border-[var(--line-clr-blue)] p-5 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Futuristic glowing ambient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme)]/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--theme2)]/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-6 sm:mb-8 text-center relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--hover-clr)] border border-[var(--line-clr-blue)] flex items-center justify-center mb-3 sm:mb-4 shadow-inner">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--theme)] animate-pulse" />
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[var(--textColor)] mb-2">
            {isSignUp ? "Join Toolment" : "Welcome Back"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--textMuted)] max-w-[280px]">
            {isSignUp 
              ? "Create a secure account to save your dashboard configurations and saved tools."
              : "Sign in to access secure tools, visualizers, and preferences."}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono leading-relaxed">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
                Username / Display Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Name..."
                required
                className="w-full bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] placeholder-[var(--textMuted)]/50 rounded-xl py-2.5 sm:py-3 px-4 outline-hidden focus:border-[var(--theme)] focus:ring-1 focus:ring-[var(--theme)] transition-all font-sans text-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
              {isSignUp ? "Email Address" : "Username or Email Address"}
            </label>
            <input
              type={isSignUp ? "email" : "text"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter username/email..."
              required
              className="w-full bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] placeholder-[var(--textMuted)]/50 rounded-xl py-2.5 sm:py-3 px-4 outline-hidden focus:border-[var(--theme)] focus:ring-1 focus:ring-[var(--theme)] transition-all font-sans text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password..."
                required
                className="w-full bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] placeholder-[var(--textMuted)]/50 rounded-xl py-2.5 sm:py-3 px-4 pr-11 outline-hidden focus:border-[var(--theme)] focus:ring-1 focus:ring-[var(--theme)] transition-all font-sans text-sm"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-[var(--theme)] to-[var(--theme2)] hover:opacity-90 disabled:opacity-55 text-white font-bold py-3 sm:py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" /> Create Workspace
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Authenticate & Enter
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-[var(--line-clr)] flex flex-col items-center gap-4 relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccess("");
            }}
            className="text-xs text-[var(--textMuted)] hover:text-[var(--theme)] transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "New to Toolment? Create an Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
