"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Plus,
  Clock,
  MapPin,
  Link2,
  Trash2,
  Edit2,
  Users,
  FileText,
  ChevronDown,
  Search,
} from "lucide-react";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import type { Meeting, Member, Team, MeetingStatus } from "@/lib/types";
import { format } from "date-fns";

const statusVariant: Record<MeetingStatus, "info" | "warning" | "success" | "danger"> = {
  scheduled: "info",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
  const [notesModal, setNotesModal] = useState<Meeting | null>(null);
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    agenda: "",
    scheduledAt: "",
    durationMinutes: 60,
    location: "",
    meetingLink: "",
    teamId: "",
    organizerId: "",
    attendeeIds: [] as number[],
  });

  const fetchData = async () => {
    const [m, mem, t] = await Promise.all([
      fetch("/api/meetings").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]);
    setMeetings(Array.isArray(m) ? m : []);
    setMembers(Array.isArray(mem) ? mem : []);
    setTeams(Array.isArray(t) ? t : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({
      title: "", description: "", agenda: "",
      scheduledAt: "", durationMinutes: 60,
      location: "", meetingLink: "", teamId: "", organizerId: "",
      attendeeIds: [],
    });
    setEditMeeting(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };
  const openEdit = (m: Meeting) => {
    setEditMeeting(m);
    setForm({
      title: m.title,
      description: m.description || "",
      agenda: m.agenda || "",
      scheduledAt: format(new Date(m.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
      durationMinutes: m.durationMinutes,
      location: m.location || "",
      meetingLink: m.meetingLink || "",
      teamId: m.teamId?.toString() || "",
      organizerId: m.organizerId?.toString() || "",
      attendeeIds: [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      teamId: form.teamId ? parseInt(form.teamId) : null,
      organizerId: form.organizerId ? parseInt(form.organizerId) : null,
      durationMinutes: Number(form.durationMinutes),
    };
    if (editMeeting) {
      await fetch("/api/meetings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editMeeting.id, ...payload }),
      });
    } else {
      await fetch("/api/meetings", {
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
    if (!confirm("Delete this meeting?")) return;
    await fetch(`/api/meetings?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await fetch("/api/meetings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;
    await fetch("/api/meetings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: notesModal.id, notes }),
    });
    setNotesModal(null);
    fetchData();
  };

  const filtered = meetings.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.organizerName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleAttendee = (id: number) => {
    setForm((f) => ({
      ...f,
      attendeeIds: f.attendeeIds.includes(id)
        ? f.attendeeIds.filter((a) => a !== id)
        : [...f.attendeeIds, id],
    }));
  };

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
            <CalendarCheck className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-slate-800">Meetings</h1>
          </div>
          <p className="text-slate-500 text-sm ml-8 mt-0.5">Schedule and manage team meetings</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Meetings Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No meetings found</p>
          <p className="text-slate-400 text-sm mt-1">Schedule your first team meeting</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-slate-800 text-sm leading-snug">{meeting.title}</h3>
                  <Badge label={meeting.status.replace("_", " ")} variant={statusVariant[meeting.status]} />
                </div>

                {meeting.description && (
                  <p className="text-slate-500 text-xs mb-3 line-clamp-2">{meeting.description}</p>
                )}

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{format(new Date(meeting.scheduledAt), "MMM d, yyyy · h:mm a")}</span>
                    <span className="text-slate-400">· {meeting.durationMinutes}min</span>
                  </div>
                  {meeting.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{meeting.location}</span>
                    </div>
                  )}
                  {meeting.meetingLink && (
                    <div className="flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                        Join Link
                      </a>
                    </div>
                  )}
                  {meeting.organizerName && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{meeting.organizerName}</span>
                    </div>
                  )}
                </div>

                {meeting.agenda && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400 font-medium mb-1">Agenda</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{meeting.agenda}</p>
                  </div>
                )}
              </div>

              <div className="px-5 pb-4 flex items-center gap-2">
                <select
                  value={meeting.status}
                  onChange={(e) => handleStatusChange(meeting.id, e.target.value)}
                  className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => { setNotesModal(meeting); setNotes(meeting.notes || ""); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  title="Add Notes"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(meeting)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(meeting.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editMeeting ? "Edit Meeting" : "Schedule New Meeting"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Meeting title"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Duration (minutes)</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
                min={15}
                step={15}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Room / Office"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Meeting Link</label>
              <input
                type="url"
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Team</label>
              <select
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select team</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Organizer</label>
              <select
                value={form.organizerId}
                onChange={(e) => setForm({ ...form, organizerId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select organizer</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Meeting description..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Agenda</label>
            <textarea
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="Meeting agenda..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          {!editMeeting && members.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Attendees</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {members.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={form.attendeeIds.includes(m.id)}
                      onChange={() => toggleAttendee(m.id)}
                      className="rounded"
                    />
                    <span className="text-slate-700 truncate">{m.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
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
              {editMeeting ? "Save Changes" : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Notes Modal */}
      <Modal
        isOpen={!!notesModal}
        onClose={() => setNotesModal(null)}
        title="Meeting Notes"
        size="md"
      >
        <div className="space-y-4">
          {notesModal && (
            <p className="text-sm text-slate-500">Notes for: <span className="font-medium text-slate-700">{notesModal.title}</span></p>
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            placeholder="Add meeting notes, action items, decisions made..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setNotesModal(null)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Save Notes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
