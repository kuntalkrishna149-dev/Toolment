import React, { useState, useEffect } from "react";
import { Search, Star, Sparkles, ExternalLink, Play, Sliders, Dna, Rocket, RefreshCw, AlertCircle } from "lucide-react";
import { UtilityTool } from "../types";

interface HomeViewProps {
  favoriteTools: string[];
  onToggleFavorite: (toolId: string) => void;
  onLaunchWorkspace: (tab: string, tool?: UtilityTool) => void;
}

export default function HomeView({ favoriteTools, onToggleFavorite, onLaunchWorkspace }: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [toolsList, setToolsList] = useState<UtilityTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTools = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("toolment_token");
    try {
      const response = await fetch("/api/tools", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to acquire tools list.");
      }
      setToolsList(data.tools || []);
    } catch (err: any) {
      console.error("Error loading tools:", err);
      setError(err.message || "Could not retrieve dynamic tools index.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // Filtering Logic
  const filteredTools = toolsList.filter((tool) => {
    const term = searchQuery.toLowerCase().trim();
    if (term === "favourite" || term === "favorites" || term === "starred") {
      return favoriteTools.includes(tool.id);
    }
    return (
      tool.name.toLowerCase().includes(term) ||
      tool.desc.toLowerCase().includes(term) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* LANDING STAT BANNER CARD */}
      <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr-blue)] rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden text-center md:text-left">
        {/* Glow dots decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme)]/8 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--hover-clr)] border border-[var(--line-clr-blue)] text-[10px] font-mono text-[var(--textColor)] uppercase font-semibold">
              <Rocket className="w-3.5 h-3.5 text-[var(--theme4)] animate-pulse" /> Workspace Dashboard
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight text-[var(--textColor)]">
              Toolment Utilities
            </h2>
            <p className="text-xs md:text-sm text-[var(--textMuted)] leading-relaxed">
              Equip yourself with specialized developer, kinetic, and mathematical instruments. Clean, robust, and responsive on all screens.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 font-mono text-xs justify-center">
            <div className="py-2.5 px-4 rounded-xl bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-[var(--textMuted)] uppercase">Active Engine Tools</span>
              <strong className="text-lg text-[var(--theme)] font-black">
                {loading ? "..." : toolsList.length}
              </strong>
            </div>

            <div className="py-2.5 px-4 rounded-xl bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-[var(--textMuted)] uppercase">Saved Bookmarks</span>
              <strong className="text-lg text-rose-500 font-black">{favoriteTools.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-center text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-450" />
          <span>⚠️ {error}</span>
          <button onClick={fetchTools} className="px-2 py-0.5 bg-rose-500 text-white rounded font-bold hover:bg-rose-600 transition-colors cursor-pointer">
            Retry
          </button>
        </div>
      ) : null}

      {/* SEARCH OR FILTER INPUT MODULE */}
      <div className="relative">
        <label className="sr-only">Search Tools</label>
        <div className="flex items-center bg-[var(--card1)] border border-[var(--line-clr)] rounded-2xl px-4 py-3 shadow-md focus-within:border-[var(--theme)] transition-all">
          <Search className="w-5 h-5 text-[var(--textMuted)]/60 mr-3 flex-shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by tag, title, description or type 'favourite'..."
            className="w-full bg-transparent border-none outline-hidden text-[var(--textColor)] placeholder-[var(--textMuted)]/50 text-sm font-sans"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--textMuted)] hover:text-[var(--textColor)]"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* TOOLS GRID */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[var(--line-clr-blue)] border-t-[var(--theme)] rounded-full animate-spin mx-auto"></div>
          <p className="font-mono text-[10px] text-[var(--textMuted)] tracking-wider">Syncing workspace tools registry...</p>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center p-16 border-2 border-dashed border-[var(--line-clr)] rounded-3xl space-y-4">
          <Dna className="w-12 h-12 text-[var(--textMuted)] mx-auto animate-pulse" />
          <p className="text-sm text-[var(--textMuted)] font-sans">
            No productivity utilities match evaluation. Try searching for "color", "geometric", or "physics".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          {filteredTools.map((tool) => {
            const isFav = favoriteTools.includes(tool.id);
            const token = localStorage.getItem("toolment_token") || "";
            const isFile = tool.accessType === "file" && tool.uploadedFilename;
            const finalLink = isFile
              ? `/api/tools/files/${encodeURIComponent(tool.uploadedFilename!)}?token=${encodeURIComponent(token)}`
              : tool.link;

            return (
              <div
                key={tool.id}
                className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-6 flex flex-col justify-between gap-5 relative overflow-hidden transition-all hover:border-[var(--theme)] hover:shadow-xl hover:-translate-y-1.5 shadow-sm group"
              >
                {/* Visual grid decorative mask */}
                <div className="absolute inset-0 bg-radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.015),transparent_40%) pointer-events-none"></div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display font-extrabold text-lg md:text-xl text-[var(--textColor)] tracking-tight group-hover:text-[var(--theme)] transition-colors select-none">
                      {tool.name}
                    </h3>

                    {/* Bookmark state */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tool.id);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                        isFav 
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-500" 
                          : "bg-[var(--mainBg)] border-[var(--line-clr)] text-[var(--textMuted)] hover:text-rose-500 hover:border-rose-500/20"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <p className="text-xs md:text-sm text-[var(--textMuted)] leading-relaxed font-sans font-light">
                    {tool.desc}
                  </p>
                </div>

                <div className="space-y-4 mt-auto">
                  {/* Visual classification tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textMuted)] capitalize group-hover:text-[var(--textColor)] transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-1 border-t border-[var(--line-clr)]/50 pt-3">
                    {tool.isInternalWorkspace ? (
                      <button
                        onClick={() => onLaunchWorkspace("internal_tool_runner", tool)}
                        className="flex-1 bg-linear-to-r from-[var(--theme)] to-[var(--theme2)] hover:opacity-95 text-white py-2 px-4 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md group-hover:shadow-[var(--theme)]/15"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> EXPLORE ⚡
                      </button>
                    ) : (
                      <a
                        href={finalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-linear-to-r from-[var(--theme)] to-[var(--theme2)] hover:opacity-95 text-white py-2 px-4 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> EXPLORE <span className="opacity-60 font-medium">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
