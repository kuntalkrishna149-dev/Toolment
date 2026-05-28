import React, { useState, useEffect } from "react";
import { Sliders, Plus, Edit2, Trash2, ExternalLink, RefreshCw, AlertCircle, Save, CheckCircle2, Hammer, X } from "lucide-react";
import { UtilityTool } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function ConfigureToolsView() {
  const [tools, setTools] = useState<UtilityTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Form states (Add or Edit Mode)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formIsInternal, setFormIsInternal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Advanced File Upload states
  const [formAccessType, setFormAccessType] = useState<"url" | "file">("url");
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [collisionError, setCollisionError] = useState("");
  const [showCollisionModal, setShowCollisionModal] = useState(false);

  const fetchTools = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("toolment_token");
    if (!token) {
      setError("Administrative authorization token not found.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/tools", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to load tools list from workspace.");
      }
      setTools(data.tools || []);
    } catch (err: any) {
      setError(err.message || "An error occurred retrieving workspace tools list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormName("");
    setFormDesc("");
    setFormLink("");
    setFormTags("");
    setFormIsInternal(false);
    setFormAccessType("url");
    setFormFiles([]);
  };

  const handleEditClick = (tool: UtilityTool) => {
    setEditingId(tool.id);
    setFormName(tool.name);
    setFormDesc(tool.desc);
    setFormLink(tool.accessType === "file" ? "" : tool.link);
    setFormTags(tool.tags.join(", "));
    setFormIsInternal(!!tool.isInternalWorkspace);
    setFormAccessType(tool.accessType || "url");
    setFormFiles([]); // Reset select files
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);

    // Front-end popup check: Filename collision verify for every selected file
    for (const file of fileList) {
      const isDuplicate = tools.some(t => {
        if (t.id === editingId || t.accessType !== "file") return false;
        const allNames = t.uploadedFilenames || (t.uploadedFilename ? [t.uploadedFilename] : []);
        return allNames.some(fn => fn.toLowerCase() === file.name.toLowerCase());
      });

      if (isDuplicate) {
        setCollisionError(`Duplicate database entry detected! The filename "${file.name}" is already associated with another workspace tool. Please rename the file locally or use a unique file to continue.`);
        setShowCollisionModal(true);
        
        // Reset file input element
        e.target.value = "";
        return;
      }
    }

    setFormFiles(prev => {
      const filtered = [...prev];
      for (const newF of fileList) {
        if (!filtered.some(f => f.name.toLowerCase() === newF.name.toLowerCase())) {
          filtered.push(newF);
        }
      }
      return filtered;
    });

    e.target.value = "";
  };

  const handleRemoveFileFromSelection = (index: number) => {
    setFormFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDesc.trim()) {
      setError("Tool name and description are mandatory fields.");
      return;
    }

    if (formAccessType === "url" && !formLink.trim()) {
      setError("Redirection link is required for URL based tools.");
      return;
    }

    if (formAccessType === "file" && formFiles.length === 0 && !editingId) {
      setError("At least one HTML or asset file must be selected for upload.");
      return;
    }

    setError("");
    setSuccess("");
    setActionLoading(true);

    const token = localStorage.getItem("toolment_token");
    const tagsArray = formTags
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    // Dynamic multipart FormData construction
    const formData = new FormData();
    formData.append("name", formName.trim());
    formData.append("desc", formDesc.trim());
    formData.append("accessType", formAccessType);
    formData.append("tags", JSON.stringify(tagsArray));
    formData.append("isInternalWorkspace", String(formIsInternal));

    if (formAccessType === "url") {
      formData.append("link", formLink.trim());
    } else if (formAccessType === "file") {
      for (const file of formFiles) {
        formData.append("files", file);
      }
    }

    try {
      let response;
      if (editingId) {
        response = await fetch(`/api/admin/tools/${editingId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
      } else {
        response = await fetch("/api/admin/tools", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save tool entry.");
      }

      setSuccess(
        editingId
          ? `Successfully saved modifications to '${formName}' tool entry!`
          : `Successfully published new interactive tool '${formName}' into workspace index!`
      );
      resetForm();
      fetchTools();
    } catch (err: any) {
      setError(err.message || "An error occurred writing changes to database.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("toolment_token");

    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to remove tool entry.");
      }

      setSuccess("Tool and related server files successfully deleted from system.");
      setConfirmDeleteId(null);
      fetchTools();
    } catch (err: any) {
      setError(err.message || "An error occurred during deletion.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme)]/8 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-2 max-w-2xl text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--hover-clr)] border border-[var(--line-clr-blue)] text-[10px] font-mono text-[var(--textColor)] uppercase font-semibold">
            <Sliders className="w-3.5 h-3.5 text-[var(--theme)]" /> Dynamic Tool Registry
          </span>
          <h2 className="font-display font-black text-2xl md:text-4xl tracking-tight text-[var(--textColor)]">
            Configure Workspace Tools
          </h2>
          <p className="text-xs md:text-sm text-[var(--textMuted)] leading-relaxed">
            Register and publish custom micro-utilities, interactive layouts, or external redirects directly to the team workspace dashboard.
          </p>
        </div>

        <button
          onClick={fetchTools}
          disabled={loading}
          className="p-3 bg-[var(--hover-clr)] hover:bg-[var(--active-clr)] text-[var(--textColor)] rounded-2xl border border-[var(--line-clr)] transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Tools"}
        </button>
      </div>

      {/* FEEDBACK STATUS AND NOTIFICATION BLOCK */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>✓ {success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 font-mono text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>⚠️ System Error: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ADD OR EDIT TOOL FORM */}
        <div className="lg:col-span-5 bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-3xl p-6 self-start shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--line-clr)] pb-3 mb-5">
            <h3 className="font-display font-black text-sm text-[var(--textColor)] uppercase tracking-wider flex items-center gap-2">
              <Hammer className="w-4 h-4 text-[var(--theme)]" />
              {editingId ? "Edit Tool Meta" : "Add New Utility"}
            </h3>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-[10px] font-mono text-rose-400 font-bold hover:underline cursor-pointer flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded-md"
              >
                <X className="w-3 h-3" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveTool} className="space-y-4 font-sans">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--textMuted)]">
                Tool Name
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Markdown Blueprint Pro"
                className="w-full bg-[var(--mainBg)] text-[var(--textColor)] border border-[var(--line-clr)] rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-[var(--theme)] transition-all font-sans font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--textMuted)]">
                Short Description
              </label>
              <textarea
                required
                rows={4}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Briefly summarize key mathematical, visualization, or code payload outcomes."
                className="w-full bg-[var(--mainBg)] text-[var(--textColor)] border border-[var(--line-clr)] rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-[var(--theme)] transition-all font-sans resize-none leading-relaxed"
              />
            </div>

            {/* ROUTING ACCESS TYPE CHOOSER */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--textMuted)]">
                Launch Mechanism
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[var(--mainBg)] border border-[var(--line-clr)] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setFormAccessType("url")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formAccessType === "url"
                      ? "bg-[var(--theme)] text-white shadow-xs"
                      : "text-[var(--textMuted)] hover:text-[var(--textColor)]"
                  }`}
                >
                  Redirect Website URL
                </button>
                <button
                  type="button"
                  onClick={() => setFormAccessType("file")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formAccessType === "file"
                      ? "bg-[var(--theme)] text-white shadow-xs"
                      : "text-[var(--textMuted)] hover:text-[var(--textColor)]"
                  }`}
                >
                  Upload Utility HTML File
                </button>
              </div>
            </div>

            {formAccessType === "url" ? (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--textMuted)]">
                  Redirection Link / URL
                </label>
                <input
                  type="url"
                  required={formAccessType === "url"}
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-[var(--mainBg)] text-[var(--textColor)] border border-[var(--line-clr)] rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-[var(--theme)] transition-all font-mono"
                />
              </div>
            ) : (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--textMuted)]">
                  Upload HTML / Static Asset Files
                </label>
                <div className="border border-[var(--line-clr)] bg-[var(--mainBg)] rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept=".html,.htm,.txt,.json,.pdf,.png,.jpg,.jpeg,.css,.js"
                    onChange={handleFileChange}
                    className="hidden"
                    id="tool-file-upload"
                  />
                  <label
                    htmlFor="tool-file-upload"
                    className="cursor-pointer py-1.5 px-3.5 bg-[var(--hover-clr)] hover:bg-[var(--active-clr)] text-[var(--textColor)] border border-[var(--line-clr)] rounded-lg text-xs font-bold tracking-wider uppercase transition-all"
                  >
                    Select Files
                  </label>
                  {formFiles.length > 0 ? (
                    <div className="w-full mt-3 space-y-2 text-left max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--textMuted)] border-b border-[var(--line-clr)]/30 pb-1">
                        Selected for Upload ({formFiles.length}):
                      </p>
                      {formFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 bg-[var(--hover-clr)] p-2 rounded-lg border border-[var(--line-clr)]/40 text-xs">
                          <div className="truncate flex-1 min-w-0">
                            <p className="font-mono font-bold text-[var(--textColor)] truncate">
                              📄 {file.name}
                            </p>
                            <p className="text-[9px] text-[var(--textMuted)]">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFileFromSelection(idx)}
                            className="p-1 text-rose-400 hover:text-rose-650 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : editingId && tools.find(t => t.id === editingId)?.uploadedFilenames ? (
                    <div className="w-full mt-3 space-y-1 text-left">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--textMuted)] border-b border-[var(--line-clr)]/30 pb-1">
                        Active Files on Server:
                      </p>
                      <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                        {(tools.find(t => t.id === editingId)?.uploadedFilenames || [tools.find(t => t.id === editingId)?.uploadedFilename].filter(Boolean) as string[]).map((fn, idx) => (
                          <p key={idx} className="text-xs font-mono text-emerald-400 truncate">
                            📁 {fn}
                          </p>
                        ))}
                      </div>
                      <p className="text-[9px] text-[var(--textMuted)] italic pt-1 text-center">
                        (Select new files to replace the existing ones)
                      </p>
                    </div>
                  ) : editingId && tools.find(t => t.id === editingId)?.uploadedFilename ? (
                    <div className="space-y-1 mt-1 text-center">
                      <p className="text-xs font-mono font-semibold text-[var(--textColor)] truncate max-w-[200px] mx-auto">
                        📂 {tools.find(t => t.id === editingId)?.uploadedFilename}
                      </p>
                      <p className="text-[10px] text-emerald-400">
                        (Active on server, select new files to replace)
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[var(--textMuted)] mt-1">
                      No files selected. Supported: .html, .css, .js, .json, etc.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center bg-[var(--mainBg)] border border-[var(--line-clr)] rounded-xl p-3">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-[var(--textColor)]">Internal Component Mode</span>
                  <span className="text-[9px] text-[var(--textMuted)] mt-0.5">Render inside Toolment rather than opening externally</span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsInternal}
                  onChange={(e) => setFormIsInternal(e.target.checked)}
                  className="w-4 h-4 text-[var(--theme)] focus:ring-[var(--theme)] accent-[var(--theme)] outline-none rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--textMuted)]">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g. text, parser, formatting, helper"
                className="w-full bg-[var(--mainBg)] text-[var(--textColor)] border border-[var(--line-clr)] rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-[var(--theme)] transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 bg-linear-to-r from-[var(--theme)] to-[var(--theme2)] hover:opacity-95 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md mt-4"
            >
              {actionLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingId ? "Save Modifications" : "Publish Utility to Workspace"}
            </button>
          </form>
        </div>

        {/* ACTIVE WORKSPACE TOOLS LIST */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line-clr)] pb-3">
            <h3 className="font-display font-black text-xs text-[var(--textMuted)] uppercase tracking-wider">
              Published Workspace indexes: <span className="text-[var(--textColor)]">{tools.length} Tools</span>
            </h3>
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[var(--line-clr-blue)] border-t-[var(--theme)] rounded-full animate-spin mx-auto"></div>
              <p className="font-mono text-[10px] text-[var(--textMuted)] tracking-wider">Fetching live registry details...</p>
            </div>
          ) : tools.length === 0 ? (
            <div className="p-16 border-2 border-dashed border-[var(--line-clr)] rounded-3xl text-center space-y-3">
              <p className="text-sm text-[var(--textMuted)] font-sans">
                No tools initialized in the workspace index. Click edit schema to add.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-linear-to-b from-[var(--card1)] to-[var(--card2)] border border-[var(--line-clr)] rounded-2xl p-4 flex flex-col justify-between gap-4 hover:border-[var(--theme)]/40 transition-all relative group shadow-xs"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-black text-sm text-[var(--textColor)] truncate">
                          {tool.name}
                        </h4>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textMuted)] truncate">
                          ID: {tool.id}
                        </span>
                        {tool.accessType === "file" ? (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase">
                            DOC/HTML FILE
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold uppercase">
                            WEBSITE REDIRECT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--textMuted)] leading-relaxed font-sans font-light line-clamp-3">
                        {tool.desc}
                      </p>
                      
                      <div className="flex flex-col gap-1 text-[9px] font-mono text-[var(--textMuted)] select-all">
                        <div className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 inline text-[var(--theme)] flex-shrink-0" />
                          <span className="truncate">
                            {tool.accessType === "file" ? `[Launch File] /uploads/${tool.uploadedFilename}` : tool.link}
                          </span>
                        </div>
                        {tool.accessType === "file" && tool.uploadedFilenames && tool.uploadedFilenames.length > 1 && (
                          <div className="pl-4 text-[8px] text-[var(--textMuted)]/75 space-y-1">
                            <span className="font-sans font-bold">Uploaded file bundle ({tool.uploadedFilenames.length}):</span>
                            <div className="flex flex-wrap gap-1">
                              {tool.uploadedFilenames.map((fn, i) => (
                                <span key={i} className="bg-[var(--hover-clr)] px-1.5 py-0.5 rounded-sm border border-[var(--line-clr)]/30 text-[8px]">
                                  {fn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEditClick(tool)}
                        className="p-2 bg-[var(--hover-clr)] hover:bg-[var(--active-clr)] text-[var(--textColor)] hover:text-[var(--theme)] rounded-xl border border-[var(--line-clr)] transition-all cursor-pointer"
                        title="Edit tool data"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteId === tool.id ? (
                        <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 p-1 rounded-xl">
                          <button
                            onClick={() => handleDeleteTool(tool.id)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-md text-[9px] uppercase transition-all cursor-pointer"
                          >
                            YES
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 bg-slate-600 hover:bg-slate-700 text-white font-extrabold rounded-md text-[9px] uppercase transition-all cursor-pointer"
                          >
                            NO
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(tool.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-450 hover:text-white rounded-xl border border-rose-500/20 transition-all cursor-pointer"
                          title="Remove tool from database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 border-t border-[var(--line-clr)]/30 pt-3.5">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-sm bg-[var(--mainBg)] border border-[var(--line-clr)] text-[var(--textMuted)] capitalize font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DUP WARNING OVERLAY MODAL */}
      <AnimatePresence>
        {showCollisionModal && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--card1)] border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 font-sans"
            >
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-bounce mt-1">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-base text-[var(--textColor)]">
                Duplicate Asset Denied
              </h3>
              <p className="text-xs text-[var(--textMuted)] leading-relaxed">
                {collisionError}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowCollisionModal(false);
                  setCollisionError("");
                }}
                className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold tracking-wider uppercase cursor-pointer transition-all shadow-md font-sans"
              >
                Acknowledge Error & Re-select
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
