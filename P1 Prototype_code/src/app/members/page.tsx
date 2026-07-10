"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  Mail,
  Shield,
  Building2,
} from "lucide-react";
import Modal from "@/components/Modal";
import type { Member, Team } from "@/lib/types";

const roleColors: Record<string, string> = {
  admin: "bg-indigo-100 text-indigo-700",
  manager: "bg-purple-100 text-purple-700",
  lead: "bg-blue-100 text-blue-700",
  member: "bg-slate-100 text-slate-700",
  intern: "bg-amber-100 text-amber-700",
};

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-rose-500", "bg-amber-500", "bg-cyan-500", "bg-pink-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "member",
    teamId: "",
  });

  const fetchData = async () => {
    const [m, t] = await Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]);
    setMembers(Array.isArray(m) ? m : []);
    setTeams(Array.isArray(t) ? t : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ name: "", email: "", role: "member", teamId: "" });
    setEditMember(null);
  };

  const openEdit = (m: Member) => {
    setEditMember(m);
    setForm({
      name: m.name,
      email: m.email,
      role: m.role,
      teamId: m.teamId?.toString() || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      teamId: form.teamId ? parseInt(form.teamId) : null,
    };
    if (editMember) {
      // For now we'll re-create (simple approach without a PATCH for members)
      await fetch(`/api/members?id=${editMember.id}`, { method: "DELETE" });
      await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/members?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t.name]));

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
            <Users className="w-6 h-6 text-violet-500" />
            <h1 className="text-2xl font-bold text-slate-800">Members</h1>
          </div>
          <p className="text-slate-500 text-sm ml-8 mt-0.5">Manage your organization members</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white max-w-md"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-bold text-slate-800">{members.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Members</p>
        </div>
        {["admin", "manager", "lead"].map((role) => (
          <div key={role} className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <p className="text-2xl font-bold text-slate-800">
              {members.filter((m) => m.role === role).length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{role}s</p>
          </div>
        ))}
      </div>

      {/* Members Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No members found</p>
          <p className="text-slate-400 text-sm mt-1">Add your first team member</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${getAvatarColor(member.name)} flex items-center justify-center text-white font-bold text-sm`}>
                  {getInitials(member.name)}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(member)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 text-sm mb-1">{member.name}</h3>

              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[member.role] || roleColors.member}`}>
                    {member.role}
                  </span>
                </div>
                {member.teamId && teamMap[member.teamId] && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teamMap[member.teamId]}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editMember ? "Edit Member" : "Add Member"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@company.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="member">Member</option>
              <option value="intern">Intern</option>
              <option value="lead">Lead</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
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
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {editMember ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
