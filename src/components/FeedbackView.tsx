import React, { useState } from "react";
import { MessageSquare, Star, Send, CheckCircle2, ShieldCheck, Mail, Sparkles } from "lucide-react";

interface FeedbackViewProps {
  userEmail?: string;
  userName?: string;
  onNavigateToAdmin?: () => void;
}

export default function FeedbackView({ userEmail = "", userName = "", onNavigateToAdmin }: FeedbackViewProps) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [feedbackType, setFeedbackType] = useState("General Feedback");
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !comment || !rating) {
      setError("Please complete all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          type: feedbackType,
          rating,
          comment
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to process feedback submission.");
      }

      // Trigger success dialog anim
      setShowSuccess(true);
      setComment("");
      // Suppress success dialog automatically after 3.2s
      setTimeout(() => {
        setShowSuccess(false);
      }, 3200);

    } catch (err: any) {
      setError(err.message || "Unable to send feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentSelection = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn relative">
      <div className="text-center md:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--hover-clr)] border border-[var(--line-clr-blue)] text-xs text-[var(--textColor)] font-mono">
          <MessageSquare className="w-3.5 h-3.5 text-[var(--theme)]" /> CONTINUOUS IMPROVEMENT ENGINE
        </div>
        <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight text-[var(--textColor)]">
          Submit Quality Feedback
        </h2>
        <p className="text-sm md:text-base text-[var(--textMuted)] leading-relaxed">
          We aggregate ratings and trace comments server-side to systematically perfect our performance and interface.
        </p>
      </div>

      <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-6 md:p-8 relative shadow-2xl overflow-hidden">
        {/* Decorative glass panels */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme)]/5 rounded-full blur-2xl pointer-events-none"></div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
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
                placeholder="Enter your email"
                required
                className="w-full bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] rounded-xl py-2.5 px-4 outline-hidden focus:border-[var(--theme)] focus:ring-1 focus:ring-[var(--theme)] transition-all text-sm font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
              Feedback Categorization
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] rounded-xl py-2.5 px-4 outline-hidden focus:border-[var(--theme)] focus:ring-1 focus:ring-[var(--theme)] transition-all text-sm font-sans"
            >
              <option>General Feedback</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>UI Suggestion</option>
            </select>
          </div>

          {/* Interactive Glowing Stars Selection Block */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
              Rate Your Experience ({currentSelection} Stars out of 5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer border hover:scale-105 active:scale-95 shadow-xs ${
                    star <= currentSelection
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/5"
                      : "bg-[var(--mainBg)] border-[var(--line-clr)] text-[var(--textMuted)]"
                  }`}
                >
                  <Star 
                    className="w-5 h-5 fill-current" 
                    style={{
                      fill: star <= currentSelection ? "currentColor" : "none"
                    }}
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--textMuted)]">
              Your rating determines high-priority items inside our developer queue automatically.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--textMuted)] block">
              Detailed Comments / Suggestions
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide context, links, or describe any visual and layout issues we should perfect..."
              required
              rows={5}
              className="w-full bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] rounded-xl py-3 px-4 outline-hidden focus:border-[var(--theme)] focus:ring-1 focus:ring-[var(--theme)] transition-all text-sm font-sans resize-y"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-linear-to-r from-[var(--theme)] to-[var(--theme2)] hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Dispatch Feedback Package
                </>
              )}
            </button>

            {/* Simulated instant SMTP router indicator */}
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--textMuted)] font-mono">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> SIMULATED SMTP DISPATCH ENABLED
            </div>
          </div>
        </form>
      </div>

      {/* ADMIN CONSOLE BANNER AT FEET */}
      {email.toLowerCase() === "kuntal2010oct@gmail.com" && onNavigateToAdmin && (
        <div className="bg-linear-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="font-display font-bold text-sm text-[var(--textColor)] flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Administrative Access Confirmed
            </h4>
            <p className="text-xs text-[var(--textMuted)] font-sans">
              As kuntal2010oct@gmail.com, you are authorized to inspect all feedbacks, SMTP simulated states, and star analytics.
            </p>
          </div>
          <button
            onClick={onNavigateToAdmin}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-[var(--bg)] font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            Review Admin Panel ⚙️
          </button>
        </div>
      )}

      {/* SYSTEM FEEDBACK MATRIX CHECKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-4 rounded-xl border border-[var(--line-clr)] bg-[var(--mainBg)] space-y-1">
          <div className="text-xs font-bold text-[var(--textColor)]">⚡ Direct DB Ingestion</div>
          <p className="text-[11px] text-[var(--textMuted)] font-sans max-w-[210px]">
            Values are placed directly into our secure sqlite-free local file database to assure extreme persistence.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--line-clr)] bg-[var(--mainBg)] space-y-1">
          <div className="text-xs font-bold text-[var(--textColor)]">🎨 Layout Tweaks Inbound</div>
          <p className="text-[11px] text-[var(--textMuted)] font-sans max-w-[210px]">
            Your rating points system directly alerts UI grids to update spacing, density constraints, or responsiveness errors.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--line-clr)] bg-[var(--mainBg)] space-y-1">
          <div className="text-xs font-bold text-[var(--textColor)]">🔓 Multi-Account Audit</div>
          <p className="text-[11px] text-[var(--textMuted)] font-sans max-w-[210px]">
            Admins monitor submissions seamlessly through active session verification checks mapped in Float arrays.
          </p>
        </div>
      </div>

      {/* DYNAMIC SUCCESS OVERLAY MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="w-full max-w-sm bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-emerald-500/35 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative animate-scaleUp">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h3 className="font-display font-extrabold text-2xl text-[var(--textColor)] tracking-tight">
              Feedback Saved!
            </h3>
            
            <p className="text-xs text-[var(--textMuted)] font-sans leading-relaxed">
              We have stored your rating securely on the backend. A simulated review email alert was dispatched to our admin inbox at <strong className="text-emerald-400">kuntal2010oct@gmail.com</strong>.
            </p>

            <div className="pt-2 text-[10px] text-[var(--textMuted)] font-mono bg-[var(--mainBg)] border border-[var(--line-clr)] p-2 rounded-lg">
              SIMULATED STATUS: SENT DISPATCH (202 SUCCESS)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
