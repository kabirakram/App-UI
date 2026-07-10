"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Pin,
  Search,
  ChevronDown,
  Megaphone,
  Trophy,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import Modal from "@/components/Modal";
import type { TeamUpdate, Member, Team, UpdateType } from "@/lib/types";
import { format } from "date-fns";

const typeConfig: Record<UpdateType, { label: string; color: string; icon: React.ElementType; bg: string }> = {
  daily: { label: "Daily", color: "text-blue-700", bg: "bg-blue-100", icon: CalendarDays },
  weekly: { label: "Weekly", color: "text-purple-700", bg: "bg-purple-100", icon: Megaphone },
  blocker: { label: "Blocker", color: "text-red-700", bg: "bg-red-100", icon: AlertTriangle },
  achievement: { label: "Achievement", color: "text-emerald-700", bg: "bg-emerald-100", icon: Trophy },
};

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<TeamUpdate[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "daily" as UpdateType,
    memberId: "",
    teamId: "",
    isPinned: false,
  });

  const fetchData = async () => {
    const [u, m, t] = await Promise.all([
      fetch("/api/team-updates").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]);
    setUpdates(Array.isArray(u) ? u : []);
    setMembers(Array.isArray(m) ? m : []);
    setTeams(Array.isArray(t) ? t : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/team-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        memberId: form.memberId ? parseInt(form.memberId) : null,
        teamId: form.teamId ? parseInt(form.teamId) : null,
      }),
    });
    setShowModal(false);
    setForm({ title: "", content: "", type: "daily", memberId: "", teamId: "", isPinned: false });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this update?")) return;
    await fetch(`/api/team-updates?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleTogglePin = async (id: number, current: boolean | null) => {
    await fetch("/api/team-updates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPinned: !current }),
    });
    fetchData();
  };

  const filtered = updates.filter((u) => {
    const matchSearch =
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.content.toLowerCase().includes(search.toLowerCase()) ||
      (u.memberName || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || u.type === filterType;
    return matchSearch && matchType;
  });

  const pinned = filtered.filter((u) => u.isPinned);
  const unpinned = filtered.filter((u) => !u.isPinned);
  const ordered = [...pinned, ...unpinned];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-slate-800">Team Updates</h1>
          </div>
          <p className="text-slate-500 text-sm ml-8 mt-0.5">Share daily updates, blockers, and achievements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post Update
        </button>
      </div>

      {/* Type breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(Object.keys(typeConfig) as UpdateType[]).map((type) => {
          const { label, bg, color, icon: Icon } = typeConfig[type];
          const count = updates.filter((u) => u.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? "all" : type)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all ${
                filterType === type
                  ? `${bg} border-current ${color} shadow-sm`
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${filterType === type ? color : "text-slate-400"}`} />
              <div className="text-left">
                <p className={`text-xs font-semibold ${filterType === type ? color : "text-slate-600"}`}>{label}</p>
                <p className="text-lg font-bold text-slate-800">{count}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search updates..."
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
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="blocker">Blocker</option>
            <option value="achievement">Achievement</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Updates Feed */}
      {ordered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No updates yet</p>
          <p className="text-slate-400 text-sm mt-1">Post your first team update</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordered.map((update) => {
            const { label, bg, color, icon: TypeIcon } = typeConfig[update.type];
            return (
              <div
                key={update.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                  update.isPinned ? "border-indigo-200" : "border-slate-100"
                }`}
              >
                {update.isPinned && (
                  <div className="bg-indigo-600 px-4 py-1.5 flex items-center gap-1.5">
                    <Pin className="w-3.5 h-3.5 text-indigo-200" />
                    <span className="text-xs text-indigo-100 font-medium">Pinned Update</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon className={`w-4.5 h-4.5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${color}`}>{label}</span>
                          {update.memberName && (
                            <span className="text-xs text-slate-500">by {update.memberName}</span>
                          )}
                          <span className="text-xs text-slate-400">
                            {format(new Date(update.createdAt), "MMM d, yyyy · h:mm a")}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">{update.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleTogglePin(update.id, update.isPinned)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          update.isPinned
                            ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50"
                        }`}
                        title={update.isPinned ? "Unpin" : "Pin"}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(update.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{update.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Post Team Update"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Update Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(typeConfig) as UpdateType[]).map((type) => {
                const { label, bg, color, icon: Icon } = typeConfig[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      form.type === type
                        ? `${bg} ${color} border-current`
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Update title"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Content *</label>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Share your update, progress, or blockers..."
              rows={5}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Posted by</label>
              <select
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
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
                <option value="">All teams</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-300"
            />
            <span className="text-sm text-slate-600 font-medium">Pin this update</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Post Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
