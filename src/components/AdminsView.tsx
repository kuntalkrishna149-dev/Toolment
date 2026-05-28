import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, ShieldCheck, Mail, User, RefreshCw, Key, ToggleLeft, ToggleRight, Search, CheckCircle, Eye, EyeOff, Lock, UserCheck, Trash2 } from "lucide-react";
import { User as UserType } from "../types";
import { motion } from "motion/react";

interface AdminsViewProps {
  currentUser: UserType | null;
}

export default function AdminsView({ currentUser }: AdminsViewProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionsLoading, setActionsLoading] = useState<Record<string, boolean>>({});
  const [revealPassword, setRevealPassword] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const currentUserRole = currentUser?.email?.toLowerCase() === "kuntal2010oct@gmail.com"
    ? "owner"
    : (currentUser?.role || (currentUser?.isAdmin ? "admin" : "user"));
  const isOwner = currentUserRole === "owner";

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("toolment_token");
    if (!token) {
      setError("Administrative authorization token not found.");
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
        throw new Error(data.error || "Unable to load users list from database.");
      }
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "An error occurred retrieving database user entries.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (targetUserId: string, newRole: "user" | "admin" | "owner", targetUserEmail: string) => {
    setError("");
    setSuccess("");
    setActionsLoading(prev => ({ ...prev, [targetUserId]: true }));

    const token = localStorage.getItem("toolment_token");
    if (!token) {
      setError("Administrative authorization token not found.");
      setActionsLoading(prev => ({ ...prev, [targetUserId]: false }));
      return;
    }

    try {
      const response = await fetch("/api/admin/change-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, newRole })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update user security categorization roles.");
      }

      setSuccess(`Updated security categorization for ${targetUserEmail} to ${newRole.toUpperCase()} privilege tier!`);
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole, isAdmin: newRole !== "user" } : u));
    } catch (err: any) {
      setError(err.message || "An error occurred updating privileges.");
    } finally {
      setActionsLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleDeleteAccount = async (targetUserId: string, targetUserEmail: string) => {
    setError("");
    setSuccess("");
    setActionsLoading(prev => ({ ...prev, [targetUserId]: true }));

    const token = localStorage.getItem("toolment_token");
    if (!token) {
      setError("Administrative authorization token not found.");
      setActionsLoading(prev => ({ ...prev, [targetUserId]: false }));
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${targetUserId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to permanently terminate the requested account.");
      }

      setSuccess(`Account for ${targetUserEmail} successfully deleted from the database.`);
      setConfirmDeleteId(null);
      
      // Update local state by removing the user from list
      setUsers(prev => prev.filter(u => u.id !== targetUserId));
    } catch (err: any) {
      setError(err.message || "An error occurred during account deletion.");
    } finally {
      setActionsLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const term = searchQuery.toLowerCase().trim();
    return (
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="admins-management-section">
      {/* SECURE HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr-blue)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--theme)]/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-2 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--active-clr)] border border-[var(--line-clr-blue)] text-xs font-mono text-[var(--theme)] font-bold tracking-wider uppercase">
            <Shield className="w-4 h-4" /> PRIVILEGED ADMINTRACTION CONSOLE
          </div>
          <h2 className="font-display font-black text-2xl md:text-4xl tracking-tight text-[var(--textColor)]">
            Account Privileges & Roles
          </h2>
          <p className="text-xs md:text-sm text-[var(--textMuted)] leading-relaxed font-sans max-w-xl">
            Promote standard credentials into Administrators or Co-Owners. Ensure compliance settings are strictly audited. Only owners can edit roles or view plain-text user credentials.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-500 uppercase font-black">
              System Creator: kuntal2010oct@gmail.com
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-[var(--active-clr)] border border-[var(--line-clr-blue)] text-[9px] font-mono text-[var(--theme)] uppercase font-black">
              Your Current Status: {currentUserRole.toUpperCase()}
            </span>
          </div>
        </div>

        <button 
          onClick={fetchUsers}
          className="relative z-10 px-5 py-2.5 bg-linear-to-r from-[var(--theme)] to-[var(--theme2)] hover:opacity-95 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:translate-y-[-2px]"
          id="refresh-admins-list-btn"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Accounts Database
        </button>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs"
        >
          ⚠️ Privilege Control Error: {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {success}
        </motion.div>
      )}

      {/* SEARCH CAPABILITY */}
      <div className="relative">
        <div className="flex items-center bg-[var(--card1)] border border-[var(--line-clr)] rounded-2xl px-4 py-3 shadow-md focus-within:border-[var(--theme)] transition-all">
          <Search className="w-5 h-5 text-[var(--textMuted)]/60 mr-3 flex-shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts catalog..."
            className="w-full bg-transparent border-none outline-hidden text-[var(--textColor)] placeholder-[var(--textMuted)]/50 text-sm font-sans"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[var(--line-clr-blue)] border-t-[var(--theme)] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[var(--textMuted)] font-mono">Parsing persistent account databases...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line-clr)] pb-3">
            <h3 className="font-display font-bold text-xs text-[var(--textMuted)] uppercase tracking-wider">
              Filter match: <span className="text-[var(--textColor)] font-black">{filteredUsers.length}</span> / <span className="font-semibold">{users.length}</span> Registered Accounts
            </h3>
          </div>

          {/* SCROLL ANIMATION WRAPPED CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="admins-scrolling-container">
            {filteredUsers.map((account) => {
              const isPrincipal = account.email.toLowerCase() === "kuntal2010oct@gmail.com";
              const currentTier = isPrincipal ? "owner" : (account.role || (account.isAdmin ? "admin" : "user"));
              const isWorking = actionsLoading[account.id];

              return (
                <motion.div 
                  key={account.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10px" }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className={`bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border rounded-2xl p-5 md:p-6 space-y-4 hover:shadow-lg transition-all group relative overflow-hidden ${
                    currentTier === "owner" 
                      ? "border-amber-500/40 hover:border-amber-500" 
                      : currentTier === "admin" 
                      ? "border-[var(--line-clr-blue)] hover:border-[var(--theme)]" 
                      : "border-[var(--line-clr)] hover:border-[var(--theme)]/60"
                  }`}
                  id={`admin-toggle-card-${account.id}`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl pointer-events-none transition-all ${
                    currentTier === "owner" 
                      ? "bg-amber-500/5 group-hover:bg-amber-500/10" 
                      : "bg-[var(--theme)]/5 group-hover:bg-[var(--theme)]/10"
                  }`}></div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl text-white font-display font-black flex items-center justify-center flex-shrink-0 text-lg shadow-sm ${
                        currentTier === "owner" 
                          ? "bg-linear-to-tr from-amber-500 to-yellow-500" 
                          : currentTier === "admin" 
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
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[var(--textMuted)] min-w-0">
                          <Mail className={`w-3.5 h-3.5 flex-shrink-0 ${currentTier === "owner" ? "text-amber-500" : "text-[var(--theme)]"}`} />
                          <span className="truncate select-all">{account.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      {isPrincipal ? (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-[9px] font-mono text-amber-500 uppercase font-black tracking-wide leading-none">
                          FOUNDER OWNER
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-mono uppercase font-black tracking-wide leading-none ${
                          currentTier === "owner" 
                            ? "bg-amber-500/15 border border-amber-500/30 text-amber-500" 
                            : currentTier === "admin" 
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400" 
                            : "bg-[var(--tagBg)] border border-[var(--line-clr)] text-[var(--textMuted)]"
                        }`}>
                          {currentTier.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CREDENTIAL PASSWORD VIEW SECTION (Owner only vs admin restricted protection) */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--textMuted)] font-bold block">
                      Secure Password Token:
                    </span>
                    {isOwner ? (
                      <div className="flex items-center justify-between gap-3 bg-[var(--hover-clr)] border border-[var(--line-clr-blue)]/30 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {revealPassword[account.id] ? (
                            <EyeOff className="w-3.5 h-3.5 text-[var(--theme)] flex-shrink-0 animate-pulse" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          )}
                          <span className="font-mono text-xs text-[var(--textColor)] select-all truncate">
                            {revealPassword[account.id] ? account.password || "(Undefined Field)" : "••••••••••••"}
                          </span>
                        </div>
                        <button
                          onClick={() => setRevealPassword(prev => ({ ...prev, [account.id]: !prev[account.id] }))}
                          className="text-[10px] text-[var(--theme)] font-black uppercase hover:opacity-85 select-none hover:underline cursor-pointer flex-shrink-0"
                        >
                          {revealPassword[account.id] ? "Hide Plaintext" : "View Password"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-rose-500/5 border border-rose-500/10 rounded-xl px-3 py-2 text-rose-400 font-mono text-[9.5px]">
                        <Lock className="w-3.5 h-3.5 text-rose-400/70 flex-shrink-0" />
                        <span>Password Restricted (Only Workspace Owners can review raw passwords)</span>
                      </div>
                    )}
                  </div>

                  {/* PRIVILEGED MANAGEMENT ACTION INTERFACE */}
                  <div className="pt-3 border-t border-[var(--line-clr)]/50 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[var(--textMuted)]">
                      <span>SYSTEM_ID: <span className="text-[var(--textColor)] font-semibold">{account.id}</span></span>
                      <span>THEME: <span className="text-[var(--textColor)] capitalize">{account.preferences?.theme || "Light"}</span></span>
                    </div>

                    {isPrincipal ? (
                      <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-center text-[10px] font-mono text-amber-500 uppercase font-semibold">
                        ⚙ Core creator credential cannot be modified.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--textMuted)] text-left block">
                          Assign Access Tier:
                        </span>
                        
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["user", "admin", "owner"] as const).map((tier) => {
                            const isCurrent = currentTier === tier;
                            
                            return (
                              <button
                                key={tier}
                                disabled={isWorking || !isOwner}
                                onClick={() => handleChangeRole(account.id, tier, account.email)}
                                className={`py-1.5 px-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  !isOwner 
                                    ? "opacity-60 cursor-not-allowed bg-slate-500/5 text-slate-400 border border-transparent"
                                    : isCurrent
                                    ? tier === "owner"
                                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                                      : tier === "admin"
                                      ? "bg-[var(--theme)] hover:bg-[var(--theme2)] text-white shadow-xs"
                                      : "bg-slate-500 hover:bg-slate-600 text-white shadow-xs"
                                    : "bg-[var(--hover-clr)] hover:bg-[var(--active-clr)] text-[var(--textMuted)] hover:text-[var(--textColor)] border border-[var(--line-clr)]"
                                }`}
                                title={!isOwner ? "Only workspace owners can alter account tier privileges" : `Assign ${tier.toUpperCase()}`}
                              >
                                {isWorking && isCurrent ? (
                                  <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                  tier
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {!isOwner && (
                          <div className="text-[9px] font-mono text-rose-400/80 leading-tight text-center">
                            * Access restricted: ONLY active owners are authorized to elevate admin accounts.
                          </div>
                        )}

                        {isOwner && !isPrincipal && account.email.toLowerCase() !== currentUser?.email?.toLowerCase() && (
                          <div className="pt-2.5 border-t border-[var(--line-clr)]/30 mt-2">
                            {confirmDeleteId === account.id ? (
                              <div className="space-y-2 p-2.5 bg-rose-500/5 rounded-xl border border-rose-500/20 text-center animate-pulse">
                                <span className="text-[10px] font-mono text-rose-400 font-bold block leading-relaxed">
                                  ⚠️ ACTION PERMANENT & IRREVERSIBLE!
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    disabled={isWorking}
                                    onClick={() => handleDeleteAccount(account.id, account.email)}
                                    className="py-1.5 px-2 bg-rose-600 hover:bg-rose-750 text-white rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer"
                                  >
                                    YES, DELETE
                                  </button>
                                  <button
                                    disabled={isWorking}
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="py-1.5 px-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer"
                                  >
                                    CANCEL
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                disabled={isWorking}
                                onClick={() => setConfirmDeleteId(account.id)}
                                className="w-full py-1.5 px-3 rounded-lg text-[10px] bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-rose-500/25"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Account Permanently
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
