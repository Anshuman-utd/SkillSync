"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, PlusCircle, Settings, FileText } from "lucide-react";

export default function MentorSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/mentor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/mentor/courses", label: "My Courses", icon: BookOpen },
    { href: "/dashboard/mentor/courses/create", label: "Add Course", icon: PlusCircle },
    { href: "/dashboard/mentor/resources", label: "Resources", icon: FileText },
    { href: "/dashboard/mentor/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 hidden md:block bg-white shadow-sm border-r border-gray-100 min-h-screen p-6">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Menu</h2>
      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-red-50 text-red-500 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
