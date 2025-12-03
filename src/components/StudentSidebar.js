"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Heart, Settings, LogOut } from "lucide-react";

export default function StudentSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "My Learning", href: "/dashboard/student/courses", icon: BookOpen },
    { name: "Saved", href: "/dashboard/student/saved", icon: Heart },
    { name: "Settings", href: "/dashboard/student/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-red-400 rounded-lg flex items-center justify-center text-white text-sm">S</span>
          Student
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-red-50 text-red-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
