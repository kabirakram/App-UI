"use client";

import { useEffect, useState } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  MessageSquare,
  ChevronDown,
  Search,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import type { Task, TaskUpdate, Member, Team, TaskStatus, TaskPriority } from "@/lib/types";
import { format } from "date-fns";

const statusVariant: Record<TaskStatus, "default" | "warning" | "success" | "danger"> = {
  pending: "default",
  in_progress: "warning",
  completed: "success",
  blocked: "danger",
};

const priorityVariant: Record<TaskPriority, "default" | "info" | "warning" | "danger"> = {
  low: "default",
  medium: "info",
  high: "warning",
  critical: "danger",
};

const statusColumns: TaskStatus[] = ["pending", "in_progress", "blocked", "completed"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [updateModal, setUpdateModal] = useState<Task | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<TaskUpdate[]>([]);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [updateForm, setUpdateForm] = useState({
    note: "",
    memberId: "",
    newStatus: "" as TaskStatus | "",
  });
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending" as TaskStatus,
    priority: "medium" as TaskPriority,
    assigneeId: "",
    teamId: "",
    dueDate: "",
  });

  const fetchData = async () => {
    const [t, m, tm] = await Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]);
    setTasks(Array.isArray(t) ? t : []);
    setMembers(Array.isArray(m) ? m : []);
    setTeams(Array.isArray(tm) ? tm : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", status: "pending", priority: "medium", assigneeId: "", teamId: "", dueDate: "" });
    setEditTask(null);
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setForm({
      title: t.title,
      description: t.description || "",
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId?.toString() || "",
      teamId: t.teamId?.toString() || "",
      dueDate: t.dueDate ? format(new Date(t.dueDate), "yyyy-MM-dd") : "",
    });
    setShowModal(true);
  };

  const openUpdateModal = async (t: Task) => {
    setUpdateModal(t);
    setUpdateForm({ note: "", memberId: "", newStatus: t.status });
    const updates = await fetch(`/api/task-updates?taskId=${t.id}`).then((r) => r.json());
    setTaskUpdates(Array.isArray(updates) ? updates : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null,
      teamId: form.teamId ? parseInt(form.teamId) : null,
      dueDate: form.dueDate || null,
    };
    if (editTask) {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editTask.id, ...payload }),
      });
    } else {
      await fetch("/api/tasks", {
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
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateModal) return;
    const payload = {
      taskId: updateModal.id,
      memberId: updateForm.memberId ? parseInt(updateForm.memberId) : null,
      note: updateForm.note,
      previousStatus: updateModal.status,
      newStatus: updateForm.newStatus || updateModal.status,
    };
    await fetch("/api/task-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (updateForm.newStatus && updateForm.newStatus !== updateModal.status) {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: updateModal.id, status: updateForm.newStatus }),
      });
    }
    setUpdateForm({ note: "", memberId: "", newStatus: updateModal.status });
    const updates = await fetch(`/api/task-updates?taskId=${updateModal.id}`).then((r) => r.json());
    setTaskUpdates(Array.isArray(updates) ? updates : []);
    fetchData();
  };

  const filtered = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.assigneeName || "").toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug flex-1">{task.title}</h3>
        <Badge label={task.priority} variant={priorityVariant[task.priority]} />
      </div>
      {task.description && (
        <p className="text-slate-500 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-1.5 mb-3 text-xs text-slate-500">
        {task.assigneeName && (
          <span className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5">
            <User className="w-3 h-3" />{task.assigneeName}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5">
            <Calendar className="w-3 h-3" />{format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
        {task.status === "blocked" && (
          <span className="flex items-center gap-1 bg-red-50 text-red-500 rounded-full px-2 py-0.5">
            <AlertCircle className="w-3 h-3" />Blocked
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>
        <button
          onClick={() => openUpdateModal(task)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          title="Daily Update"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <button
          onClick={() => openEdit(task)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(task.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

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
            <CheckSquare className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
          </div>
          <p className="text-slate-500 text-sm ml-8 mt-0.5">Track and update daily tasks</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === "board" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Board
          </button>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {statusColumns.map((s) => {
          const count = tasks.filter((t) => t.status === s).length;
          const colors: Record<string, string> = {
            pending: "bg-slate-500",
            in_progress: "bg-amber-500",
            completed: "bg-emerald-500",
            blocked: "bg-red-500",
          };
          return (
            <div key={s} className="bg-white rounded-xl p-3 border border-slate-100 text-center">
              <div className={`w-1.5 h-1.5 rounded-full ${colors[s]} mx-auto mb-1`} />
              <p className="text-lg font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500 capitalize">{s.replace("_", " ")}</p>
            </div>
          );
        })}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No tasks found</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col);
            const colColors: Record<string, string> = {
              pending: "bg-slate-100 text-slate-600 border-slate-300",
              in_progress: "bg-amber-100 text-amber-700 border-amber-300",
              completed: "bg-emerald-100 text-emerald-700 border-emerald-300",
              blocked: "bg-red-100 text-red-700 border-red-300",
            };
            return (
              <div key={col} className="bg-slate-50 rounded-2xl p-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 border ${colColors[col]}`}>
                  <span>{colTasks.length}</span>
                  <span className="capitalize">{col.replace("_", " ")}</span>
                </div>
                <div className="space-y-3">
                  {colTasks.map((t) => <TaskCard key={t.id} task={t} />)}
                  {colTasks.length === 0 && (
                    <p className="text-slate-400 text-xs text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editTask ? "Edit Task" : "New Task"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Task details..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Assignee</label>
              <select
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
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
              {editTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Daily Update Modal */}
      <Modal
        isOpen={!!updateModal}
        onClose={() => setUpdateModal(null)}
        title="Daily Task Update"
        size="lg"
      >
        {updateModal && (
          <div className="space-y-5">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">Task</p>
              <p className="font-semibold text-slate-800">{updateModal.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge label={updateModal.status.replace("_", " ")} variant={statusVariant[updateModal.status]} />
                <Badge label={updateModal.priority} variant={priorityVariant[updateModal.priority]} />
              </div>
            </div>

            <form onSubmit={handlePostUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Update Note *</label>
                <textarea
                  required
                  value={updateForm.note}
                  onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                  placeholder="What did you work on? Any blockers or progress?"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Posted by</label>
                  <select
                    value={updateForm.memberId}
                    onChange={(e) => setUpdateForm({ ...updateForm, memberId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">Select member</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Update Status to</label>
                  <select
                    value={updateForm.newStatus}
                    onChange={(e) => setUpdateForm({ ...updateForm, newStatus: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Post Update
              </button>
            </form>

            {/* Update History */}
            {taskUpdates.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Update History</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {taskUpdates.map((u) => (
                    <div key={u.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">{u.memberName || "Unknown"}</span>
                        <span className="text-xs text-slate-400">{format(new Date(u.createdAt), "MMM d, h:mm a")}</span>
                      </div>
                      <p className="text-sm text-slate-600">{u.note}</p>
                      {u.newStatus && u.previousStatus !== u.newStatus && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Badge label={u.previousStatus?.replace("_", " ") || ""} variant={statusVariant[u.previousStatus as TaskStatus] || "default"} />
                          <span className="text-xs text-slate-400">→</span>
                          <Badge label={u.newStatus.replace("_", " ")} variant={statusVariant[u.newStatus as TaskStatus]} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
