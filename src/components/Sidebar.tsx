import React, { useState } from "react";
import { Home, Palette, MessageSquare, Info, LogOut, User, Menu, X, ShieldAlert, LayoutGrid, Users, Shield, ChevronDown, Sliders } from "lucide-react";
import { User as UserType } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserType | null;
  onLogout: () => void;
  theme?: string;
  onThemeChange?: (theme: "dark" | "light" | "emerald" | "ruby" | "ocean" | "sunset" | "forest" | "lavender") => void;
}

const THEMES = [
  { id: "light", label: "Light Theme", desc: "Clean & High Contrast", color: "#3b82f6" },
  { id: "dark", label: "Cosmic Slate", desc: "Dimmed Midnight Dark", color: "#6366f1" },
  { id: "emerald", label: "Emerald Neon", desc: "Cyberpunk Green Focus", color: "#10b981" },
  { id: "ruby", label: "Ruby Sunset", desc: "Warm Magenta Dusk", color: "#ef4444" },
  { id: "ocean", label: "Ocean Indigo", desc: "Soothing Navy Depth", color: "#0ea5e9" },
  { id: "sunset", label: "Sunset Amber", desc: "Industrial Bronze Tint", color: "#f59e0b" },
  { id: "forest", label: "Organic Moss", desc: "Natural Sage & Spruce", color: "#15803d" },
  { id: "lavender", label: "Lavender Mauve", desc: "Soft Pastel Petals", color: "#8b5cf6" },
];

export default function Sidebar({ activeTab, onTabChange, user, onLogout, theme, onThemeChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  const userRole = user?.email?.toLowerCase() === "kuntal2010oct@gmail.com"
    ? "owner"
    : (user?.role || (user?.isAdmin ? "admin" : "user"));
  const isUserOwner = userRole === "owner";
  const isAdmin = userRole === "owner" || userRole === "admin" || user?.isAdmin;

  // Customize sidebar items based on whether user is logged in as an administrator
  const menuItems = isAdmin
    ? [
        { id: "home", label: "AVAILABLE TOOLS", icon: LayoutGrid },
        { id: "configure_tools", label: "CONFIGURE TOOLS", icon: Sliders },
        { id: "admin", label: "FEEDBACK PANEL", icon: ShieldAlert },
        { id: "user_info", label: "USER INFO", icon: Users },
        { id: "admins", label: isUserOwner ? "ADMIN AND OWNER" : "ADMINS", icon: Shield },
        { id: "profile", label: "PROFILE", icon: User }
      ]
    : [
        { id: "home", label: "HOME", icon: Home },
        { id: "feedback", label: "FEEDBACK", icon: MessageSquare },
        { id: "about", label: "ABOUT", icon: Info },
        { id: "profile", label: "PROFILE", icon: User }
      ];

  const selectedThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <>
      {/* MOBILE HEADER BAR */}
      <div className="md:hidden bg-[var(--sidebarBg)] border-b border-[var(--line-clr)] py-3 px-4 flex items-center justify-between sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 fill-[var(--theme)]" viewBox="0 0 500 500">
            <path d="M 250 20 L 20 450 L 480 450 L 400 300 L 350 300 L 400 400 L 100 400 L 250 100 L 300 200 L 350 200 L 250 20 Z M 150 300 L 225 400 L 275 400 L 170 260"/>
          </svg>
          <span className="font-display font-black text-lg tracking-wider text-[var(--textColor)]">TOOLMENT</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border border-[var(--line-clr)] rounded-xl bg-[var(--mainBg)] text-[var(--textColor)] cursor-pointer"
        >
          {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION GRID CONTAINER */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[var(--sidebarBg)] border-r border-[var(--line-clr)] flex flex-col justify-between py-6 px-4 z-45 transition-all duration-300 md:translate-x-0 w-[270px] md:w-[260px] lg:w-[280px] overflow-y-auto custom-scrollbar ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Logo brand label with stylized vector graph paths */}
          <div className="flex items-center gap-3 pb-5 border-b border-[var(--line-clr-blue)]">
            <svg className="w-10 h-10 fill-[var(--theme)] animate-pulse" viewBox="0 0 500 500">
              <path d="M 250 20 L 20 450 L 480 450 L 400 300 L 350 300 L 400 400 L 100 400 L 250 100 L 300 200 L 350 200 L 250 20 Z M 150 300 L 225 400 L 275 400 L 170 260"/>
            </svg>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-wider text-[var(--textColor)]">TOOLMENT</span>
              <span className="text-[8px] font-mono text-[var(--textMuted)] leading-tight mt-0.5 max-w-[150px] break-words uppercase">
                admin secure engine to Tools that you actually need
              </span>
            </div>
          </div>

          <nav>
            <ul className="space-y-1.5 list-none m-0 p-0">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <li key={item.id} className="block w-full">
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3.5 transition-all text-xs font-bold tracking-wider cursor-pointer group relative ${
                        active
                          ? "text-[var(--textColor)]"
                          : "text-[var(--textMuted)] hover:text-[var(--textColor)]"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeTabBackground"
                          className="absolute inset-0 bg-[var(--active-clr)] border border-[var(--line-clr-blue)] rounded-xl -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className={`w-4.5 h-4.5 group-hover:scale-105 transition-transform ${active ? "text-[var(--theme)] animate-pulse" : "text-[var(--textMuted)]"}`} />
                      <span className="relative z-10">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* PROFILE CARD & SECURE SHUTDOWN */}
        <div className="space-y-3.5 mt-auto">
          {user ? (
            <div className="bg-[var(--mainBg)] border border-[var(--line-clr)]/80 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[var(--theme)] to-[var(--theme2)] text-white font-display font-black flex items-center justify-center flex-shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-xs text-[var(--textColor)] truncate leading-none">
                    {user.username}
                  </div>
                  <div className="text-[10px] text-[var(--textMuted)] truncate mt-1">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="w-full">
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full py-2 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-rose-500/10"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            </div>
          ) : null}

          {/* CUSTOM PREMIUM ANIMATED THEME SELECTION DROPDOWN */}
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--textMuted)] px-1 mb-1.5">
              <Palette className="w-3.5 h-3.5 text-[var(--theme)] animate-spin-slow" style={{ animationDuration: "14s" }} />
              <span>Theme Preference</span>
            </div>
            
            <button
              type="button"
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="w-full bg-[var(--mainBg)] text-[var(--textColor)] border border-[var(--line-clr)] hover:border-[var(--theme)]/40 rounded-xl py-2 px-3 text-xs outline-none transition-all font-sans font-bold cursor-pointer flex items-center justify-between hover:bg-[var(--hover-clr)] shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: selectedThemeObj.color }} />
                <span>{selectedThemeObj.label}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--textMuted)] transition-transform duration-300 ${isThemeOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isThemeOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden mt-2 bg-[var(--mainBg)] border border-[var(--line-clr)] rounded-2xl p-1.5 space-y-0.5"
                >
                  <div className="px-2 py-1 text-[9px] uppercase font-mono font-bold tracking-wider text-[var(--textMuted)] border-b border-[var(--line-clr)]/20 mb-1">
                    Choose Theme Preference
                  </div>
                  <div className="max-h-[170px] overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
                    {THEMES.map((t) => {
                      const isSelected = t.id === theme;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            onThemeChange?.(t.id as any);
                          }}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[var(--active-clr)] text-[var(--textColor)] border border-[var(--theme)]/20"
                              : "hover:bg-[var(--hover-clr)] text-[var(--textMuted)] hover:text-[var(--textColor)]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold font-sans">{t.label}</span>
                              <span className="text-[8.5px] text-[var(--textMuted)]/70">{t.desc}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* MOBILE DIMMER DROPBACK overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}
    </>
  );
}
