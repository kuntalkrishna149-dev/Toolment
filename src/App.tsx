import React, { useState, useEffect } from "react";
import { User, UtilityTool } from "./types";
import LoginView from "./components/LoginView";
import Sidebar from "./components/Sidebar";
import HomeView from "./components/HomeView";
import ColorVisualizerView from "./components/ColorVisualizerView";
import FeedbackView from "./components/FeedbackView";
import AboutView from "./components/AboutView";
import ProfileView from "./components/ProfileView";
import AdminConsoleView from "./components/AdminConsoleView";
import UserInfoView from "./components/UserInfoView";
import AdminsView from "./components/AdminsView";
import ConfigureToolsView from "./components/ConfigureToolsView";
import { Sparkles, ArrowRightLeft, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Theme Configuration Manager
  const [theme, setTheme] = useState<"dark" | "light" | "emerald" | "ruby" | "ocean" | "sunset" | "forest" | "lavender">(() => {
    const saved = localStorage.getItem("toolment_theme") as "dark" | "light" | "emerald" | "ruby" | "ocean" | "sunset" | "forest" | "lavender" | null;
    return saved || "ocean"; // initial visit theme: ocean indigo
  });

  // Authentication & Profile States
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("toolment_token"));
  const [authLoading, setAuthLoading] = useState(true);

  // Favorites Bookmarks Tracker
  const [favoriteTools, setFavoriteTools] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [runningTool, setRunningTool] = useState<UtilityTool | null>(null);

  // Synchronise Theme attributes on DOM documentElement
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("toolment_theme", theme);
  }, [theme]);

  // Session Bootstrapper (Auto login on refresh)
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setTheme(data.user.preferences?.theme || theme);
          setFavoriteTools(data.user.preferences?.favoriteTools || []);
          
          // Preload localstorage with db stats as safe backup
          localStorage.setItem("toolment_favorites", JSON.stringify(data.user.preferences?.favoriteTools || []));
        } else {
          // Bad token or session expired
          handleLogout();
        }
      } catch (err) {
        console.error("Session restoration error:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    verifySession();
  }, [token]);

  // Read favorite bookmarks local states as fallback
  useEffect(() => {
    if (!user) {
      const savedFavs = localStorage.getItem("toolment_favorites");
      if (savedFavs) {
        try {
          setFavoriteTools(JSON.parse(savedFavs));
        } catch {
          setFavoriteTools([]);
        }
      }
    }
  }, [user]);

  const handleAuthSuccess = (authUser: User, sessionToken: string) => {
    localStorage.setItem("toolment_token", sessionToken);
    setToken(sessionToken);
    setUser(authUser);
    setTheme(authUser.preferences?.theme || theme);
    setFavoriteTools(authUser.preferences?.favoriteTools || []);
    localStorage.setItem("toolment_favorites", JSON.stringify(authUser.preferences?.favoriteTools || []));
    setActiveTab("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("toolment_token");
    setToken(null);
    setUser(null);
    setFavoriteTools([]);
    setActiveTab("home");
  };

  const handleThemeChange = async (targetTheme: "dark" | "light" | "emerald" | "ruby" | "ocean" | "sunset" | "forest" | "lavender") => {
    setTheme(targetTheme);
    
    // Attempt backend save sync if user is active
    if (token) {
      try {
        const response = await fetch("/api/user/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            theme: targetTheme,
            favoriteTools
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) setUser(data.user);
        }
      } catch (err) {
        console.error("Preferences theme sync error", err);
      }
    }
  };

  const handleToggleFavorite = async (toolId: string) => {
    let updated: string[];
    if (favoriteTools.includes(toolId)) {
      updated = favoriteTools.filter(id => id !== toolId);
    } else {
      updated = [...favoriteTools, toolId];
    }

    setFavoriteTools(updated);
    localStorage.setItem("toolment_favorites", JSON.stringify(updated));

    // Send save state updates directly to backend database
    if (token) {
      try {
        const response = await fetch("/api/user/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            theme,
            favoriteTools: updated
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) setUser(data.user);
        }
      } catch (err) {
        console.error("Favorites bookmarks preferences saving failure", err);
      }
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLaunchWorkspace = (tabId: string, tool?: UtilityTool) => {
    if (tool) {
      setRunningTool(tool);
    }
    setActiveTab(tabId);
  };

  // Switch display render children tabs
  const renderDisplayTab = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeView
            favoriteTools={favoriteTools}
            onToggleFavorite={handleToggleFavorite}
            onLaunchWorkspace={handleLaunchWorkspace}
          />
        );
      case "color_visualizer":
        return <ColorVisualizerView />;
      case "internal_tool_runner":
        if (runningTool) {
          // If it matches the built-in Color Visualizer, render the high-fidelity native React view!
          if (runningTool.id === "color visualize" || runningTool.name?.toLowerCase().includes("color visualizer")) {
            return (
              <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-10">
                <div className="flex items-center justify-between gap-4 border-b border-[var(--line-clr)] pb-4">
                  <div className="flex flex-col text-left">
                    <h2 className="font-display font-extrabold text-2xl tracking-tight text-[var(--textColor)]">
                      {runningTool.name}
                    </h2>
                    <p className="text-xs text-[var(--textMuted)]">{runningTool.desc}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("home")}
                    className="py-1.5 px-3 bg-[var(--hover-clr)] hover:bg-[var(--active-clr)] text-[var(--textColor)] hover:text-rose-400 border border-[var(--line-clr)] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Close Runner
                  </button>
                </div>
                <ColorVisualizerView />
              </div>
            );
          }

          // Render any uploaded custom local workspace tool or external URL tool elegantly via sandboxed iframe
          const toolToken = localStorage.getItem("toolment_token") || "";
          const isFile = runningTool.accessType === "file" && runningTool.uploadedFilename;
          const finalLink = isFile
            ? `/api/tools/files/${encodeURIComponent(runningTool.uploadedFilename!)}?token=${encodeURIComponent(toolToken)}`
            : runningTool.link;

          return (
            <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-40px)] animate-fadeIn max-w-7xl mx-auto w-full">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--line-clr)] pb-3 mb-3 flex-shrink-0">
                <div className="flex flex-col text-left min-w-0">
                  <h2 className="font-display font-extrabold text-lg md:text-xl tracking-tight text-[var(--textColor)] truncate">
                    ⚙️ {runningTool.name}
                  </h2>
                  <p className="text-[10px] md:text-xs text-[var(--textMuted)] truncate max-w-md">{runningTool.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={finalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-[var(--hover-clr)] hover:bg-[var(--active-clr)] text-[var(--textColor)] border border-[var(--line-clr)] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Standalone View
                  </a>
                  <button 
                    onClick={() => setActiveTab("home")}
                    className="py-1.5 px-3 bg-rose-500/15 hover:bg-rose-500 hover:text-white text-rose-455 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-500/20 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Close
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-[var(--sidebarBg)] border border-[var(--line-clr)] rounded-3xl overflow-hidden shadow-2xl relative min-h-[400px]">
                <iframe
                  src={finalLink}
                  title={runningTool.name}
                  id="internal-tool-frame"
                  className="w-full h-full border-0 rounded-3xl"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          );
        }
        return <div className="text-center py-20 text-[var(--textMuted)]">No running workspace tool specified.</div>;
      case "feedback":
        return (
          <FeedbackView
            userEmail={user?.email}
            userName={user?.username}
            onNavigateToAdmin={() => setActiveTab("admin")}
          />
        );
      case "about":
        return <AboutView />;
      case "profile":
        return (
          <ProfileView
            user={user}
            currentTheme={theme}
            onThemeChange={handleThemeChange}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "admin":
        return <AdminConsoleView currentUser={user} />;
      case "configure_tools":
        return <ConfigureToolsView />;
      case "user_info":
        return <UserInfoView />;
      case "admins":
        return <AdminsView currentUser={user} />;
      default:
        return (
          <HomeView
            favoriteTools={favoriteTools}
            onToggleFavorite={handleToggleFavorite}
            onLaunchWorkspace={handleLaunchWorkspace}
          />
        );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 border-4 border-[var(--line-clr-blue)] border-t-[var(--theme)] rounded-full animate-spin"></div>
        <p className="font-mono text-xs text-[var(--textColor)] tracking-widest animate-pulse">Initializing Toolment Calibration Suite...</p>
      </div>
    );
  }

  // FORCE SECURE AUTHENTICATION LOGIN FIRST
  if (!token || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <LoginView onAuthSuccess={handleAuthSuccess} />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--mainBg)]">
      {/* GLOBAL SYSTEM APP SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* CORE WORKSPACE CONTENT SCROLLABLE FRAME */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 md:p-10 lg:p-12 relative">
        {/* Dynamic decorative backdrop radial flare */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[var(--theme)]/4 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, filter: "blur(4.5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4.5px)" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {renderDisplayTab()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Cinematic Workspace bottom branding bar */}
        <footer className="mt-16 pt-8 border-t border-[var(--line-clr)]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--textMuted)] font-mono">
          <div>© 2026 TOOLMENT CORE. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-1.5 uppercase font-medium">
            <span>FLOAT PRECISION ENGINES: OK</span>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
          </div>
        </footer>
      </main>
    </div>
  );
}
