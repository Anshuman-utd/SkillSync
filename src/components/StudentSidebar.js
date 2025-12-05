"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Heart, Settings, LogOut } from "lucide-react";

import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
        await logout();
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: null } }));
        }
        router.push("/login");
    } catch (error) {
        console.error("Sign out failed", error);
    }
  };

  const links = [
    { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "My Learning", href: "/dashboard/student/courses", icon: BookOpen },
    { name: "My Resources", href: "/dashboard/student/resources", icon: Heart }, // Updated to Resources
    { name: "Settings", href: "/dashboard/student/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 hidden md:block bg-white shadow-sm border-r border-gray-100 min-h-screen p-6 sticky top-0 h-screen">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Menu</h2>

      <nav className="space-y-2 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
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
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-gray-100">
        <button 
           onClick={handleSignOut}
           className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
