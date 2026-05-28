import React, { useState, useEffect } from "react";
import { Sliders, Check, Copy, Palette, Eye, Sun, Cpu, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function ColorVisualizerView() {
  const [hue, setHue] = useState(200);
  const [saturation, setSaturation] = useState(70);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(100);
  const [format, setFormat] = useState<"hsl" | "hsla" | "rgb" | "rgba">("hsl");
  const [copied, setCopied] = useState(false);

  // Math Transformations
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
  };

  const calculateLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return parseFloat((0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]).toFixed(2));
  };

  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  const hexCode = rgbToHex(r, g, b);

  // Harmony calculations
  const complementaryHue = (hue + 180) % 360;
  const [compR, compG, compB] = hslToRgb(complementaryHue, saturation, lightness);
  const complementaryHex = rgbToHex(compR, compG, compB);
  const luminance = calculateLuminance(r, g, b);

  const getFormatValue = () => {
    const aDec = parseFloat((alpha / 100).toFixed(2));
    if (format === "hsl") return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    if (format === "hsla") return `hsla(${hue}, ${saturation}%, ${lightness}%, ${aDec})`;
    if (format === "rgb") return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${aDec})`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormatValue());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe numerical bounding helper
  const handleNumChange = (valStr: string, setFn: (v: number) => void, max: number) => {
    const val = parseInt(valStr);
    if (!isNaN(val)) {
      setFn(Math.max(0, Math.min(max, val)));
    } else if (valStr === "") {
      setFn(0);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="text-center md:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--hover-clr)] border border-[var(--line-clr-blue)] text-xs text-[var(--textColor)] font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[var(--theme4)] animate-pulse" /> PRECISE CALIBRATION WORKSPACE
        </div>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight text-[var(--textColor)]">
          Color Labs Explorer
        </h2>
        <p className="text-sm md:text-base text-[var(--textMuted)] max-w-2xl leading-relaxed">
          Interact with additive color models to map visual hues into human-readable and machine-renderable standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT COLUMN: LIVE CANVAS VIEWPORT */}
        <div className="lg:col-span-5 bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--line-clr)] pb-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--textColor)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--theme)]"></span> Live Preview Canvas
              </h3>
              <span className="font-mono text-xs text-[var(--textMuted)]">
                ACTIVE FORMAT: <span className="text-[var(--theme)] font-bold">{format.toUpperCase()}</span>
              </span>
            </div>

            {/* Simulated Canvas with Chess checker background for alpha transparency */}
            <div className="h-72 rounded-2xl relative border border-[var(--line-clr)] overflow-hidden bg-[radial-gradient(#181d2f_20%,transparent_20%)] bg-[size:16px_16px] flex flex-col items-center justify-center p-6 text-center shadow-inner">
              {/* Dynamic filling layers mapping color directly */}
              <div 
                className="absolute inset-0 transition-all duration-150"
                style={{ 
                  backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha / 100})`,
                  boxShadow: `0 20px 50px -10px hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`
                }}
              />

              <div className="relative z-10 bg-black/45 backdrop-blur-md rounded-2xl py-3.5 px-6 border border-white/10 max-w-full">
                <div 
                  className="font-mono text-base md:text-lg font-bold select-all break-all tracking-tight"
                  style={{ color: lightness > 75 && alpha > 40 ? "#0c1020" : "#ffffff" }}
                >
                  {getFormatValue()}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="relative z-10 mt-6 bg-black/55 hover:bg-black/85 text-white py-2.5 px-5 rounded-xl border border-white/15 transition-all text-xs font-bold font-sans flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> Copied Notation!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[var(--textMuted)]" /> Copy Layout Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Secondary mathematics relationships */}
          <div className="space-y-3 pt-4 border-t border-[var(--line-clr)] mt-auto">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--textMuted)]">Harmonies & Photometrics</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[var(--mainBg)] rounded-xl p-3 border border-[var(--line-clr)] flex items-center justify-between">
                <div>
                  <span className="block text-[9px] text-[var(--textMuted)] uppercase font-semibold">Complementary</span>
                  <span className="font-mono font-bold text-[var(--textColor)]">{complementaryHex}</span>
                </div>
                <div 
                  className="w-7 h-7 rounded-md border border-[var(--line-clr)]"
                  style={{ backgroundColor: complementaryHex }}
                />
              </div>

              <div className="bg-[var(--mainBg)] rounded-xl p-3 border border-[var(--line-clr)] flex items-center justify-between">
                <div>
                  <span className="block text-[9px] text-[var(--textMuted)] uppercase font-semibold">Relative Luminance</span>
                  <span className="font-mono font-bold text-[var(--textColor)]">{luminance} Y</span>
                </div>
                <div className="w-7 h-7 rounded-sm border border-[var(--line-clr)] flex items-center justify-center bg-[var(--card2)] text-[10px] text-[var(--theme)] font-black">
                  C
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CALIBRATION SLIDERS */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl flex-grow">
            <div className="flex justify-between items-center border-b border-[var(--line-clr)] pb-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--textColor)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--theme)]" /> Calibration Calibration Matrix
              </h3>
              <span className="text-[10px] text-[var(--textMuted)] uppercase font-mono">Drag sliders or input exact coordinates</span>
            </div>

            <div className="space-y-6">
              {/* Hue Controls */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--textMuted)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Hue (spectral rotation)
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <input
                      type="number"
                      min={0}
                      max={360}
                      value={hue}
                      onChange={(e) => handleNumChange(e.target.value, setHue, 360)}
                      className="w-16 text-center bg-[var(--mainBg)] py-1 px-1.5 border border-[var(--line-clr)] text-[var(--textColor)] rounded-md font-bold text-xs"
                    />
                    <span className="text-[var(--textMuted)]">deg</span>
                  </div>
                </div>
                <div className="relative">
                  {/* Real-time spectrum range background gradient */}
                  <div className="absolute inset-y-1.5 inset-x-0 h-1.5 rounded-full border border-white/5 bg-linear-to-r from-[#ff0000] via-[#ffff00] via-[#00ff00] via-[#00ffff] via-[#0000ff] via-[#ff00ff] to-[#ff0000]" />
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={hue}
                    onChange={(e) => setHue(parseInt(e.target.value))}
                    className="w-full relative z-10 accent-blue-500 cursor-pointer h-5"
                  />
                </div>
              </div>

              {/* Saturation Controls */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--textMuted)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Saturation (chroma depth)
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={saturation}
                      onChange={(e) => handleNumChange(e.target.value, setSaturation, 100)}
                      className="w-16 text-center bg-[var(--mainBg)] py-1 px-1.5 border border-[var(--line-clr)] text-[var(--textColor)] rounded-md font-bold text-xs"
                    />
                    <span className="text-[var(--textMuted)]">%</span>
                  </div>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-y-1.5 inset-x-0 h-1.5 rounded-full border border-white/5 transition-all"
                    style={{ background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full relative z-10 accent-emerald-500 cursor-pointer h-5"
                  />
                </div>
              </div>

              {/* Lightness Controls */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--textMuted)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Lightness (illumination)
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={lightness}
                      onChange={(e) => handleNumChange(e.target.value, setLightness, 100)}
                      className="w-16 text-center bg-[var(--mainBg)] py-1 px-1.5 border border-[var(--line-clr)] text-[var(--textColor)] rounded-md font-bold text-xs"
                    />
                    <span className="text-[var(--textMuted)]">%</span>
                  </div>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-y-1.5 inset-x-0 h-1.5 rounded-full border border-white/5 transition-all"
                    style={{ background: `linear-gradient(to right, #000, hsl(${hue}, ${saturation}%, 50%), #fff)` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={lightness}
                    onChange={(e) => setLightness(parseInt(e.target.value))}
                    className="w-full relative z-10 accent-yellow-500 cursor-pointer h-5"
                  />
                </div>
              </div>

              {/* Alpha Opacity Controls */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--textMuted)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-400"></span> Alpha (channel transparency)
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={alpha}
                      onChange={(e) => handleNumChange(e.target.value, setAlpha, 100)}
                      className="w-16 text-center bg-[var(--mainBg)] py-1 px-1.5 border border-[var(--line-clr)] text-[var(--textColor)] rounded-md font-bold text-xs"
                    />
                    <span className="text-[var(--textMuted)]">%</span>
                  </div>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-y-1.5 inset-x-0 h-1.5 rounded-full border border-white/5 transition-all"
                    style={{ background: `linear-gradient(to right, transparent, hsl(${hue}, ${saturation}%, ${lightness}%))` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={alpha}
                    onChange={(e) => setAlpha(parseInt(e.target.value))}
                    className="w-full relative z-10 accent-pink-500 cursor-pointer h-5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Formats Selector Bar */}
          <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-2xl p-4 shadow-md">
            <h4 className="text-[10px] uppercase font-bold text-[var(--textMuted)] tracking-widest mb-2.5">OUTPUT VECTOR SPACE MATRIX</h4>
            <div className="grid grid-cols-4 gap-2">
              {(["hsl", "hsla", "rgb", "rgba"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${
                    format === fmt
                      ? "bg-linear-to-r from-[var(--theme)] to-[var(--theme2)] text-white shadow-md shadow-[var(--theme)]/15"
                      : "bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textColor)] hover:border-[var(--theme)]"
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER THEORY LOGIC WORKSPACE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] border-l-4 border-l-[var(--theme)] rounded-3xl p-6 md:p-8 shadow-md">
          <h3 className="font-display font-bold text-lg text-[var(--textColor)] flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-[var(--theme)]" /> System Color Logic (HSL Space)
          </h3>
          <p className="text-xs text-[var(--textMuted)] leading-relaxed mb-4">
            HSL structures visual data relative to human cognitive perception channels rather than pure hardware monitor light tubes:
          </p>
          <ul className="space-y-3 font-sans text-xs text-[var(--textColor)]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span><strong>H (Hue):</strong> Spectral rotation angle coordinates positioned on the 0-360° chromatic ring.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span><strong>S (Saturation):</strong> Chroma richness. 100% indicates maximal purity; 0% degrades and neutralizes to slate gray.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              <span><strong>L (Lightness):</strong> Reflected brightness value. Clamped boundaries: 0% maps to pure black, 100% to white bounds.</span>
            </li>
          </ul>
        </div>

        <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] bg-gradient-to-br from-indigo-950/5 to-pink-950/5 border-r-4 border-r-[var(--theme3)] rounded-3xl p-6 md:p-8 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-[var(--theme3)] flex items-center gap-1.5">
              <Sun className="w-4 h-4" /> CALIBRATION TIP
            </h4>
            <p className="text-xs text-[var(--textColor)] leading-relaxed italic">
              "HSL is preferred among developers constructing dynamic design systems. By maintaining stable Hue angles (H) and Saturation (S), you can systematically scale Lightness (L) upwards or downwards to produce perfectly balanced responsive palette tints instantly."
            </p>
          </div>
          <div className="pt-4 border-t border-[var(--line-clr)] mt-4 text-[10px] text-[var(--textMuted)] font-mono">
            Calculated within WebGL sub-pixels using Float32 IEEE bounds.
          </div>
        </div>
      </div>
    </div>
  );
}
