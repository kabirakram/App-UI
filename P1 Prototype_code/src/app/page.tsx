"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CheckSquare,
  MessageSquare,
  FolderOpen,
  Users,
  Building2,
  Clock,
  TrendingUp,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import type { Stats, Meeting, Task, TeamUpdate } from "@/lib/types";
import { format } from "date-fns";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updates, setUpdates] = useState<TeamUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/meetings").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/team-updates").then((r) => r.json()),
    ]).then(([s, m, t, u]) => {
      setStats(s);
      setMeetings(Array.isArray(m) ? m.slice(0, 3) : []);
      setTasks(Array.isArray(t) ? t.filter((x: Task) => x.status !== "completed").slice(0, 5) : []);
      setUpdates(Array.isArray(u) ? u.slice(0, 3) : []);
      setLoading(false);
    });
  }, []);

  const statusColor: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-slate-100 text-slate-700",
    blocked: "bg-red-100 text-red-700",
  };

  const priorityColor: Record<string, string> = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
  };

  const updateTypeColor: Record<string, string> = {
    daily: "bg-blue-100 text-blue-700",
    weekly: "bg-purple-100 text-purple-700",
    blocker: "bg-red-100 text-red-700",
    achievement: "bg-emerald-100 text-emerald-700",
  };

  const completionRate =
    stats && stats.tasks > 0
      ? Math.round((stats.completedTasks / stats.tasks) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Activity className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        </div>
        <p className="text-slate-500 text-sm ml-9">
          Welcome back! Here&apos;s what&apos;s happening across your organization.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Teams"
          value={stats?.teams ?? 0}
          icon={Building2}
          color="bg-indigo-500"
        />
        <StatCard
          label="Members"
          value={stats?.members ?? 0}
          icon={Users}
          color="bg-violet-500"
        />
        <StatCard
          label="Meetings"
          value={stats?.scheduledMeetings ?? 0}
          icon={CalendarCheck}
          color="bg-blue-500"
          sub={`${stats?.meetings ?? 0} total`}
        />
        <StatCard
          label="Tasks"
          value={stats?.tasks ?? 0}
          icon={CheckSquare}
          color="bg-emerald-500"
          sub={`${completionRate}% complete`}
        />
        <StatCard
          label="Team Updates"
          value={stats?.updates ?? 0}
          icon={MessageSquare}
          color="bg-amber-500"
        />
        <StatCard
          label="Documents"
          value={stats?.documents ?? 0}
          icon={FolderOpen}
          color="bg-rose-500"
        />
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700">Task Completion</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {stats?.completedTasks ?? 0} of {stats?.tasks ?? 0} tasks done
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: "/meetings", label: "Schedule Meeting", icon: CalendarCheck, color: "from-blue-500 to-blue-600" },
          { href: "/tasks", label: "Add Task", icon: CheckSquare, color: "from-emerald-500 to-emerald-600" },
          { href: "/updates", label: "Post Update", icon: MessageSquare, color: "from-amber-500 to-amber-600" },
          { href: "/documents", label: "Upload Doc", icon: FolderOpen, color: "from-rose-500 to-rose-600" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r ${color} text-white text-sm font-medium shadow-sm hover:shadow-md transition-all hover:scale-[1.02]`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-700">Upcoming Meetings</h2>
            </div>
            <Link href="/meetings" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {meetings.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No meetings yet</p>
          ) : (
            <div className="space-y-3">
              {meetings.map((m) => (
                <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{m.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(m.scheduledAt), "MMM d, yyyy · h:mm a")}
                    </p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[m.status]}`}>
                      {m.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Tasks */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-700">Active Tasks</h2>
            </div>
            <Link href="/tasks" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No active tasks</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    t.status === "in_progress" ? "bg-amber-400" :
                    t.status === "blocked" ? "bg-red-400" : "bg-slate-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate font-medium">{t.title}</p>
                    {t.assigneeName && (
                      <p className="text-xs text-slate-400">{t.assigneeName}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityColor[t.priority]}`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Updates */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-700">Recent Updates</h2>
            </div>
            <Link href="/updates" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {updates.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No updates yet</p>
          ) : (
            <div className="space-y-3">
              {updates.map((u) => (
                <div key={u.id} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${updateTypeColor[u.type]}`}>
                      {u.type}
                    </span>
                    {u.isPinned && (
                      <span className="text-xs text-slate-400">📌</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{u.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{u.content}</p>
                  {u.memberName && (
                    <p className="text-xs text-slate-400 mt-1">— {u.memberName}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
