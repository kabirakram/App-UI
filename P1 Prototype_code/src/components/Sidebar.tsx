"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CheckSquare,
  MessageSquare,
  FolderOpen,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meetings", label: "Meetings", icon: CalendarCheck },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/updates", label: "Team Updates", icon: MessageSquare },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/members", label: "Members", icon: Users },
  { href: "/teams", label: "Teams", icon: Building2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-700/40">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">TeamSync</p>
          <p className="text-indigo-300 text-xs">Organization Hub</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-indigo-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-white" : "text-indigo-300"}`} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-indigo-700/40">
        <div className="bg-white/10 rounded-xl px-4 py-3">
          <p className="text-indigo-200 text-xs font-medium">Logged in as</p>
          <p className="text-white text-sm font-semibold mt-0.5">Admin User</p>
          <p className="text-indigo-300 text-xs">admin@company.com</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-indigo-900 to-indigo-700 flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-sm">TeamSync</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-1 rounded-lg hover:bg-white/10"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-35 h-full w-64 bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 flex flex-col shadow-2xl transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ zIndex: 35 }}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 min-h-screen fixed top-0 left-0 shadow-2xl">
        <NavContent />
      </aside>
    </>
  );
}
