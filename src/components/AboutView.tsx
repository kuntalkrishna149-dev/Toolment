import React from "react";
import { Info, Award, Calendar, Zap, Layout, Terminal, Heart } from "lucide-react";

export default function AboutView() {
  const statsList = [
    { number: "3+", label: "ACTIVE UTILITIES" },
    { number: "v1.0.0", label: "CURRENT CODE LEVEL" },
    { number: "2026", label: "LAUNCH YEAR" }
  ];

  const valuePillars = [
    {
      title: "⚡ Lightning Fast",
      desc: "Architected around a responsive state framework. Instantly load components, select themes, and evaluate mathematics on any handheld or widescreen displays safely.",
      icon: Zap,
      color: "text-amber-400"
    },
    {
      title: "🎨 Cinematic Theme Engine",
      desc: "Structured with futuristic visual parameters, custom CSS variables, and seamless transition hooks. Adapt between Dark Space, Clean Light, Emerald, or Ruby on the fly.",
      icon: Layout,
      color: "text-blue-400"
    },
    {
      title: "🛠 Developer-focused Utility",
      desc: "Every component inside Toolment focuses on solving immediate pipeline issues — from prototyping geometric vector grids to exploring float colors precisely.",
      icon: Terminal,
      color: "text-fuchsia-400"
    }
  ];

  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto">
      {/* HERO BANNER SECTION */}
      <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr-blue)] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-48 h-48 bg-[var(--theme)]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[var(--theme2)]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--hover-clr)] border border-[var(--line-clr-blue)] text-xs text-[var(--textColor)] font-semibold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-[var(--theme)]" /> Workspace Manifesto
          </div>
          <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight text-[var(--textColor)]">
            About Toolment
          </h2>
          <p className="text-sm md:text-base text-[var(--textMuted)] leading-relaxed font-sans">
            TOOLMENT represents a unified digital laboratory for engineers, designers, creators, and students. By pulling practical web tools into a beautiful, cohesive, and themeable workspace, we strip out clutter and latency to prioritize what truly matters: your instant workflow.
          </p>
        </div>
      </div>

      {/* METRIC SPECS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statsList.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-[var(--tagBg)] border border-[var(--line-clr)] rounded-2xl p-6 text-center transform hover:translate-y-[-4px] transition-all hover:border-[var(--theme)] hover:shadow-lg shadow-sm"
          >
            <div className="font-display font-extrabold text-3xl md:text-4xl text-[var(--theme)] mb-1">
              {stat.number}
            </div>
            <div className="text-[10px] uppercase font-bold text-[var(--textMuted)] tracking-widest font-mono">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* THREE PILLAR HIGHLIGHTS */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xl text-[var(--textColor)] border-b border-[var(--line-clr)] pb-2 text-center md:text-left">
          Core Digital Pillars
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {valuePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx} 
                className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-2xl p-6 relative overflow-hidden transition-all hover:border-[var(--theme)] hover:shadow-lg group"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--theme)]/5 rounded-full blur-xl group-hover:bg-[var(--theme)]/15 transition-all"></div>
                <div className="w-10 h-10 rounded-xl bg-[var(--mainBg)] border border-[var(--line-clr)] flex items-center justify-center mb-4">
                  <Icon className={`w-5 h-5 ${pillar.color}`} />
                </div>
                <h4 className="font-display font-bold text-base text-[var(--textColor)] mb-2 whitespace-nowrap">
                  {pillar.title}
                </h4>
                <p className="text-xs text-[var(--textMuted)] leading-relaxed font-sans">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATIVE DESIGNER SPOTLIGHT */}
      <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-8 text-center space-y-4 relative overflow-hidden shadow-xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="w-16 h-16 rounded-full bg-linear-to-b from-rose-500 to-amber-500 flex items-center justify-center mx-auto shadow-md">
          <Award className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-1 relative z-10">
          <h3 className="font-display font-light text-xl text-[var(--textMuted)]">Creative Architect</h3>
          <div className="font-display font-extrabold text-3xl text-[var(--textColor)] tracking-tight">
            Vinay Kuntal
          </div>
          <div className="inline-block px-3 py-1 rounded-md bg-[var(--tagBg)] border border-[var(--line-clr)] text-[10px] text-[var(--theme3)] font-mono uppercase tracking-wider mt-2">
            Independent Software Engineer
          </div>
        </div>
        <p className="text-xs text-[var(--textMuted)] max-w-xl mx-auto leading-relaxed font-sans relative z-10">
          "Toolment was designed and hand-coded in order to craft an elegant utility suite that avoids telemetry tracking, third-party sales pixels, and unnecessary complexity. Built with real pride in engineering craft."
        </p>
      </div>
    </div>
  );
}
