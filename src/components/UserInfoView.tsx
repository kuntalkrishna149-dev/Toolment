import React, { useState, useEffect } from "react";
import { Users, Mail, User, Shield, Calendar, RefreshCw } from "lucide-react";
import { User as UserType } from "../types";
import { motion } from "motion/react";

export default function UserInfoView() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("toolment_token");
    if (!token) {
      setError("Administrative authorization token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load registered accounts database.");
      }

      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "An error occurred retrieving database user entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="user-info-section">
      {/* SECURE HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr-blue)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--theme)]/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-2 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--active-clr)] border border-[var(--line-clr-blue)] text-xs font-mono text-[var(--theme)] font-bold tracking-wider">
            <Users className="w-4 h-4" /> SECURE REGISTERED USERS SYSTEM
          </div>
          <h2 className="font-display font-black text-2xl md:text-4xl tracking-tight text-[var(--textColor)]">
            User Info Directory
          </h2>
          <p className="text-xs md:text-sm text-[var(--textMuted)] leading-relaxed font-sans max-w-xl">
            Inspect all active credentials, usernames, and designated profiles within the Toolment suite ecosystem. Passwords remain securely omitted except under Owner request logs.
          </p>
        </div>

        <button 
          onClick={fetchUsers}
          className="relative z-10 px-5 py-2.5 bg-linear-to-r from-[var(--theme)] to-[var(--theme2)] hover:opacity-95 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:translate-y-[-2px]"
          id="refresh-users-btn"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </motion.div>

      {error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-sm">
          ⚠️ Administrative Access Authorization Error: {error}
        </div>
      ) : loading ? (
        <div className="p-16 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[var(--line-clr-blue)] border-t-[var(--theme)] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[var(--textMuted)] font-mono">Parsing persistent account databases...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line-clr)] pb-3">
            <h3 className="font-display font-bold text-sm text-[var(--textMuted)] uppercase tracking-wider">
              Total Accounts Count: <span className="text-[var(--textColor)] font-black">{users.length}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="userinfo-scrollable-container">
            {users.map((account) => {
              const urole = account.role || (account.email.toLowerCase() === "kuntal2010oct@gmail.com" ? "owner" : "user");
              const isLead = urole === "owner" || urole === "admin";
              
              return (
                <motion.div 
                  key={account.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10px" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border rounded-2xl p-5 md:p-6 space-y-4 hover:shadow-lg transition-all group relative overflow-hidden ${
                    urole === "owner" 
                      ? "border-amber-500/40 hover:border-amber-500" 
                      : urole === "admin"
                      ? "border-[var(--line-clr-blue)] hover:border-[var(--theme)]"
                      : "border-[var(--line-clr)] hover:border-[var(--theme)]/60"
                  }`}
                  id={`user-card-${account.id}`}
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-xl pointer-events-none transition-all ${
                    isLead ? "bg-amber-500/5 group-hover:bg-amber-500/10" : "bg-[var(--theme)]/5 group-hover:bg-[var(--theme)]/10"
                  }`}></div>

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl text-white font-display font-black flex items-center justify-center flex-shrink-0 text-lg shadow-sm ${
                      urole === "owner" 
                        ? "bg-linear-to-tr from-amber-500 to-amber-600 animate-pulse" 
                        : urole === "admin"
                        ? "bg-linear-to-tr from-[var(--theme)] to-[var(--theme2)]"
                        : "bg-linear-to-tr from-slate-500 to-slate-600"
                    }`}>
                      {account.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-extrabold text-base text-[var(--textColor)] truncate">
                          {account.username}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-mono uppercase font-black tracking-wide ${
                          urole === "owner" 
                            ? "bg-amber-500/15 border border-amber-500/30 text-amber-500" 
                            : urole === "admin" 
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400" 
                            : "bg-[var(--tagBg)] text-[var(--textMuted)] border border-[var(--line-clr)]"
                        }`}>
                          {urole}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[var(--textMuted)] min-w-0">
                        <Mail className={`w-3.5 h-3.5 flex-shrink-0 ${isLead ? "text-amber-500" : "text-[var(--theme)]"}`} />
                        <span className="truncate select-all">{account.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--line-clr)]/50 flex flex-wrap items-center justify-between text-[10px] font-mono text-[var(--textMuted)] gap-2">
                    <div>
                      <span>ACC_ID: </span>
                      <span className="text-[var(--textColor)] font-semibold">{account.id}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-[var(--tagBg)] border border-[var(--line-clr)] text-[var(--textColor)]">
                        Theme Pref: {account.preferences?.theme || "Light"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
