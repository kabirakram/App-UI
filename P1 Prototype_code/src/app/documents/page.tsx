"use client";

import { useEffect, useState, useRef } from "react";
import {
  FolderOpen,
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  File,
  FileText,
  Image,
  Film,
  Archive,
  ChevronDown,
} from "lucide-react";
import Modal from "@/components/Modal";
import type { Document, Member, Team } from "@/lib/types";
import { format } from "date-fns";

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  if (fileType.startsWith("video/")) return Film;
  if (fileType === "application/pdf" || fileType.includes("text")) return FileText;
  if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar")) return Archive;
  return File;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const fileTypeColors: Record<string, string> = {
  "image/": "bg-pink-100 text-pink-600",
  "video/": "bg-purple-100 text-purple-600",
  "application/pdf": "bg-red-100 text-red-600",
  "text/": "bg-blue-100 text-blue-600",
  default: "bg-slate-100 text-slate-600",
};

function getFileColor(fileType: string) {
  for (const [key, val] of Object.entries(fileTypeColors)) {
    if (key !== "default" && fileType.startsWith(key)) return val;
    if (key === fileType) return val;
  }
  return fileTypeColors.default;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    uploadedById: "",
    teamId: "",
    file: null as File | null,
  });

  const fetchData = async () => {
    const [d, m, t] = await Promise.all([
      fetch("/api/documents").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]);
    setDocuments(Array.isArray(d) ? d : []);
    setMembers(Array.isArray(m) ? m : []);
    setTeams(Array.isArray(t) ? t : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileSelect = (file: File) => {
    setForm((f) => ({ ...f, file, name: f.name || file.name }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", form.file);
    fd.append("name", form.name || form.file.name);
    if (form.description) fd.append("description", form.description);
    if (form.uploadedById) fd.append("uploadedById", form.uploadedById);
    if (form.teamId) fd.append("teamId", form.teamId);
    await fetch("/api/documents", { method: "POST", body: fd });
    setUploading(false);
    setShowModal(false);
    setForm({ name: "", description: "", uploadedById: "", teamId: "", file: null });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const filtered = documents.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.originalName.toLowerCase().includes(search.toLowerCase()) ||
      (d.uploaderName || "").toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === "all" ||
      (filterType === "image" && d.fileType.startsWith("image/")) ||
      (filterType === "document" && (d.fileType.includes("pdf") || d.fileType.includes("text") || d.fileType.includes("word"))) ||
      (filterType === "video" && d.fileType.startsWith("video/")) ||
      (filterType === "other" && !d.fileType.startsWith("image/") && !d.fileType.startsWith("video/") && !d.fileType.includes("pdf") && !d.fileType.includes("text"));
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl font-bold text-slate-800">Documents</h1>
          </div>
          <p className="text-slate-500 text-sm ml-8 mt-0.5">Upload and manage team documents</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", count: documents.length, color: "text-slate-600 bg-slate-100" },
          { label: "Images", count: documents.filter((d) => d.fileType.startsWith("image/")).length, color: "text-pink-600 bg-pink-100" },
          { label: "Docs", count: documents.filter((d) => d.fileType.includes("pdf") || d.fileType.includes("text")).length, color: "text-blue-600 bg-blue-100" },
          { label: "Videos", count: documents.filter((d) => d.fileType.startsWith("video/")).length, color: "text-purple-600 bg-purple-100" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white rounded-xl p-3 border border-slate-100 text-center">
            <p className={`text-lg font-bold ${color.split(" ")[0]}`}>{count}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="other">Other</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No documents found</p>
          <p className="text-slate-400 text-sm mt-1">Upload your first document</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => {
            const FileIcon = getFileIcon(doc.fileType);
            const colorClass = getFileColor(doc.fileType);
            return (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className={`h-28 flex items-center justify-center ${colorClass.split(" ")[0].replace("text-", "bg-").replace("600", "50").replace("pink", "pink")}`} style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                  <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center`}>
                    <FileIcon className="w-7 h-7" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 text-sm truncate mb-1" title={doc.name}>
                    {doc.name}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-slate-400 line-clamp-1 mb-2">{doc.description}</p>
                  )}
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>{formatBytes(doc.fileSize)}</p>
                    {doc.uploaderName && <p>by {doc.uploaderName}</p>}
                    <p>{format(new Date(doc.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <a
                      href={doc.storagePath}
                      download={doc.originalName}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setForm({ name: "", description: "", uploadedById: "", teamId: "", file: null }); }}
        title="Upload Document"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-indigo-400 bg-indigo-50"
                : form.file
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
            {form.file ? (
              <>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <File className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-emerald-700">{form.file.name}</p>
                <p className="text-xs text-emerald-600 mt-1">{formatBytes(form.file.size)} — Click to change</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">Drop file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">Any file type supported</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Document Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Leave blank to use filename"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Uploaded by</label>
              <select
                value={form.uploadedById}
                onChange={(e) => setForm({ ...form, uploadedById: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select member</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Team</label>
              <select
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">No team</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowModal(false); setForm({ name: "", description: "", uploadedById: "", teamId: "", file: null }); }}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.file || uploading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
