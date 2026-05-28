import React, { useState, useEffect } from "react";
import { ShieldCheck, Calendar, Star, Mail, LayoutGrid, BarChart2, Filter, Sparkles, MessageSquareDashed, Trash2 } from "lucide-react";
import { Feedback, User as UserType } from "../types";

export interface AdminConsoleViewProps {
  currentUser?: UserType | null;
}

export default function AdminConsoleView({ currentUser }: AdminConsoleViewProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const currentUserRole = currentUser?.email?.toLowerCase() === "kuntal2010oct@gmail.com"
    ? "owner"
    : (currentUser?.role || (currentUser?.isAdmin ? "admin" : "user"));
  const isOwner = currentUserRole === "owner";

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const token = localStorage.getItem("toolment_token");
    if (!token) {
      setError("Administrative authorization token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/feedbacks", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load database feedbacks.");
      }

      setFeedbacks(data.feedbacks || []);
    } catch (err: any) {
      setError(err.message || "An error occurred retrieving database entries.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    setError("");
    setSuccessMsg("");
    setActionLoading(prev => ({ ...prev, [feedbackId]: true }));

    const token = localStorage.getItem("toolment_token");
    if (!token) {
      setError("Administrative authorization token not found. Please log in.");
      setActionLoading(prev => ({ ...prev, [feedbackId]: false }));
      return;
    }

    try {
      const response = await fetch(`/api/admin/feedbacks/${feedbackId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to permanently delete feedback.");
      }

      setSuccessMsg("Feedback entry has been permanently deleted from database index.");
      setConfirmDeleteId(null);
      // Remove from list
      setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
    } catch (err: any) {
      setError(err.message || "An error occurred during feedback deletion.");
    } finally {
      setActionLoading(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Compute stats
  const totalSubmissions = feedbacks.length;
  const averageRating = totalSubmissions > 0
    ? parseFloat((feedbacks.reduce((acc, current) => acc + current.rating, 0) / totalSubmissions).toFixed(1))
    : 0;

  const bugsCount = feedbacks.filter(f => f.type === "Bug Report").length;
  const featureRequestsCount = feedbacks.filter(f => f.type === "Feature Request").length;
  const generalCount = feedbacks.filter(f => f.type === "General Feedback").length;
  const uiCount = feedbacks.filter(f => f.type === "UI Suggestion").length;

  const filteredFeedbacks = typeFilter === "All"
    ? feedbacks
    : feedbacks.filter(f => f.type === f.type); // Safe filter matching category key

  const finalFiltered = typeFilter === "All"
    ? feedbacks
    : feedbacks.filter(f => f.type === typeFilter);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* SECURE HEADER */}
      <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-amber-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-2 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-500 font-bold tracking-wider">
            🛡️ SECURED PRINCIPAL ADMIN WORKSPACE
          </div>
          <h2 className="font-display font-black text-2xl md:text-4xl tracking-tight text-[var(--textColor)]">
            Review Board Console
          </h2>
          <p className="text-xs md:text-sm text-[var(--textMuted)] leading-relaxed font-sans max-w-xl">
            Authorized admin panel for inspecting star-feedback submissions, tracking simulated SMTP dispatches, and reviewing user workspace reports.
          </p>
        </div>

        <button 
          onClick={fetchFeedbacks}
          className="relative z-10 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-[var(--bg)] font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer hover:translate-y-[-2px]"
        >
          🔄 Refresh DB Indices
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center gap-2">
          <span>✓ {successMsg}</span>
        </div>
      )}

      {error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-sm">
          ⚠️ Administrative Access Authorization Error: {error}
        </div>
      ) : loading ? (
        <div className="p-16 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[var(--textMuted)] font-mono">Parsing persistent telemetry matrices...</p>
        </div>
      ) : (
        <>
          {/* STATISTICS BOARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-2xl p-6 shadow-sm">
              <span className="block text-[10px] uppercase font-bold text-[var(--textMuted)] tracking-widest font-mono">Total Submissions</span>
              <div className="font-display font-extrabold text-3xl text-[var(--textColor)] mt-1.5 flex items-baseline gap-2">
                {totalSubmissions} <span className="text-xs font-sans text-emerald-400">stored</span>
              </div>
            </div>

            <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-2xl p-6 shadow-sm">
              <span className="block text-[10px] uppercase font-bold text-[var(--textMuted)] tracking-widest font-mono">Average Evaluation Score</span>
              <div className="font-display font-extrabold text-3xl text-[var(--textColor)] mt-1.5 flex items-center gap-2">
                {averageRating} <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>

            <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-2xl p-6 shadow-sm">
              <span className="block text-[10px] uppercase font-bold text-[var(--textMuted)] tracking-widest font-mono">Reported Bug Tickets</span>
              <div className="font-display font-extrabold text-3xl text-rose-400 mt-1.5">
                {bugsCount} <span className="text-xs font-sans text-[var(--textMuted)]">tickets</span>
              </div>
            </div>

            <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-2xl p-6 shadow-sm">
              <span className="block text-[10px] uppercase font-bold text-[var(--textMuted)] tracking-widest font-mono">Feature Request Proposals</span>
              <div className="font-display font-extrabold text-3xl text-[var(--theme)] mt-1.5">
                {featureRequestsCount} <span className="text-xs font-sans text-[var(--textMuted)]">lines</span>
              </div>
            </div>
          </div>

          {/* CLASSIFICATION FILTER */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line-clr)] pb-4 mt-2">
            <span className="text-xs font-bold text-[var(--textMuted)] uppercase tracking-wider flex items-center gap-1.5 mr-2">
              <Filter className="w-4 h-4 text-amber-500" /> CATEGORY SPLIT:
            </span>
            {["All", "General Feedback", "Bug Report", "Feature Request", "UI Suggestion"].map((category) => (
              <button
                key={category}
                onClick={() => setTypeFilter(category)}
                className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === category
                    ? "bg-amber-500 text-[var(--bg)] shadow-md"
                    : "bg-[var(--card1)] border border-[var(--line-clr)] text-[var(--textColor)] hover:border-amber-500"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FEEDBACK FEED GRID */}
          {finalFiltered.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-[var(--line-clr)] rounded-3xl space-y-4">
              <MessageSquareDashed className="w-12 h-12 text-[var(--textMuted)] mx-auto animate-pulse" />
              <p className="text-sm text-[var(--textMuted)] font-sans">No feedback entries match the filter selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {finalFiltered.map((feed) => (
                <div 
                  key={feed.id}
                  className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-2xl p-5 md:p-6 space-y-4 hover:border-amber-500 transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all"></div>
                  
                  {/* Mock Email Headers for secure mail representation */}
                  <div className="border-b border-[var(--line-clr)] pb-3 font-mono text-[10px] text-[var(--textMuted)] leading-relaxed space-y-0.5">
                    <div><span className="text-amber-500 font-bold">SMTP_HEADER:</span> Dispatched to admin@toolment.com</div>
                    <div><span className="text-[var(--textColor)]">FROM:</span> {feed.name} &lt;{feed.email}&gt;</div>
                    <div className="flex justify-between">
                      <div><span className="text-[var(--textColor)]">STAMP:</span> {new Date(feed.createdAt).toLocaleString()}</div>
                      <div className="text-emerald-400 font-semibold uppercase">{feed.type}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="font-display font-extrabold text-[var(--textColor)] text-sm">{feed.name}</div>
                      <div className="text-xs text-[var(--textMuted)]">{feed.email}</div>
                    </div>

                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star 
                          key={starIdx} 
                          className={`w-3.5 h-3.5 ${starIdx < feed.rating ? "fill-current text-amber-400" : "text-slate-600"}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--textColor)]/90 leading-relaxed font-sans block pt-1 italic">
                    "{feed.comment}"
                  </p>

                  <div className="pt-3 border-t border-[var(--line-clr)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] font-mono text-[var(--textMuted)]">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        ✓ PERSISTED IN FILE DB
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        ✓ SIMULATED EMAIL REVIEW SENT
                      </span>
                    </div>

                    {isOwner ? (
                      confirmDeleteId === feed.id ? (
                        <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/25 p-1 rounded-lg">
                          <span className="text-[9px] text-rose-400 font-bold px-1 select-none">CONFIRM DELETE?</span>
                          <button
                            disabled={actionLoading[feed.id]}
                            onClick={() => handleDeleteFeedback(feed.id)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-md text-[9px] uppercase transition-all cursor-pointer"
                          >
                            {actionLoading[feed.id] ? "..." : "YES"}
                          </button>
                          <button
                            disabled={actionLoading[feed.id]}
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white font-extrabold rounded-md text-[9px] uppercase transition-all cursor-pointer"
                          >
                            NO
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(feed.id)}
                          className="py-1 px-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg text-[10px] font-bold border border-rose-500/20 transition-all flex items-center gap-1 cursor-pointer sm:ml-auto"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Feedback
                        </button>
                      )
                    ) : (
                      <span className="text-[9px] font-mono text-rose-400/80 bg-rose-500/5 px-2 py-1 border border-rose-500/10 rounded-lg sm:ml-auto">
                        🔒 Deletion Restricted (Owners Only)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
