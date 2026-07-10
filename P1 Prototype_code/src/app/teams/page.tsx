"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Trash2,
  Search,
  Users,
  CalendarCheck,
  CheckSquare,
} from "lucide-react";
import Modal from "@/components/Modal";
import type { Team, Member } from "@/lib/types";
import { format } from "date-fns";

const TEAM_COLORS = [
  "from-indigo-400 to-indigo-600",
  "from-violet-400 to-violet-600",
  "from-blue-400 to-blue-600",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
  "from-amber-400 to-amber-600",
  "from-cyan-400 to-cyan-600",
  "from-pink-400 to-pink-600",
];

function getTeamColor(id: number) {
  return TEAM_COLORS[id % TEAM_COLORS.length];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });

  const fetchData = async () => {
    const [t, m] = await Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
    ]);
    setTeams(Array.isArray(t) ? t : []);
    setMembers(Array.isArray(m) ? m : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ name: "", description: "" });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this team? All associated data will be removed.")) return;
    await fetch(`/api/teams?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const filtered = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const getMemberCount = (teamId: number) =>
    members.filter((m) => m.teamId === teamId).length;

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
            <Building2 className="w-6 h-6 text-indigo-500" />
            <h1 className="text-2xl font-bold text-slate-800">Teams</h1>
          </div>
          <p className="text-slate-500 text-sm ml-8 mt-0.5">Organize your organization into teams</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Team
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white max-w-md"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6 max-w-xs">
        <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-bold text-slate-800">{teams.length}</p>
          <p className="text-xs text-slate-500">Teams</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-bold text-slate-800">{members.length}</p>
          <p className="text-xs text-slate-500">Members</p>
        </div>
      </div>

      {/* Teams Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No teams yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first team to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((team) => {
            const memberCount = getMemberCount(team.id);
            const teamMembers = members.filter((m) => m.teamId === team.id).slice(0, 4);
            const colorGradient = getTeamColor(team.id);

            return (
              <div
                key={team.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className={`h-20 bg-gradient-to-br ${colorGradient} flex items-center justify-center relative`}>
                  <Building2 className="w-8 h-8 text-white/80" />
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 mb-1">{team.name}</h3>
                  {team.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{team.description}</p>
                  )}

                  {/* Member avatars */}
                  {teamMembers.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex -space-x-2">
                        {teamMembers.map((m) => {
                          const initials = m.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                          const colors = [
                            "bg-indigo-500", "bg-violet-500", "bg-blue-500", "bg-emerald-500",
                          ];
                          const c = colors[m.id % colors.length];
                          return (
                            <div
                              key={m.id}
                              className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}
                              title={m.name}
                            >
                              {initials}
                            </div>
                          );
                        })}
                      </div>
                      {memberCount > 4 && (
                        <span className="text-xs text-slate-400">+{memberCount - 4} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-slate-400">
                      {format(new Date(team.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Meetings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Tasks</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setForm({ name: "", description: "" }); }}
        title="Create New Team"
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Team Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Engineering, Marketing, Design..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What does this team do?"
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowModal(false); setForm({ name: "", description: "" }); }}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Create Team
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
