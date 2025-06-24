"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../app/utils/ThemeContext";
import { FaMoon, FaSun } from 'react-icons/fa';
import ProfileDrawer from "./ProfileDrawer";
import Image from "next/image";

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Onboard Vendor", href: "/onboard-vendor" },
  { label: "Add Manually Vendor", href: "/add-manually-vendor" },
  // { label: "Custom Booking", href: "/custom-booking" },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false); // ProfileDrawer state
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRole(typeof window !== "undefined" ? localStorage.getItem("role") : null);
  }, []);

  // Add handleLogout function back
  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  // Helper to close sidebar on link click
  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  // Hide sidebar on login/forgot-password or if not Master Admin
  if (!mounted || !role || role !== "Master Admin" || ["/login", "/forgot-password"].includes(pathname)) {
    if (pathname === "/vendor-onboard-form") {
      return <>{children}</>;
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for mobile only */}
      <aside className={`fixed z-30 top-0 left-0 h-screen w-64 shadow flex flex-col justify-between border-r transform duration-200 ease-in-out transition-colors md:hidden
        ${isDark ? 'bg-black text-white border-slate-800' : 'bg-white text-gray-900 border-gray-200'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative flex items-center justify-center p-6 text-2xl font-extrabold tracking-tight border-b transition-colors text-gray-900 border-gray-200 dark:text-white dark:border-slate-800">
          {/* Icon absolutely left */}
          <span className="absolute left-4 flex items-center h-full">
            <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </span>
          {/* Centered text */}
          <span className="w-full text-center">Admin Panel</span>
          {/* Theme toggle absolutely right */}
          <button
            onClick={toggleTheme}
            className="absolute right-4 top-1 w-8 h-8 rounded-full shadow flex items-center justify-center border transition-colors bg-white border-gray-200 dark:bg-black dark:border-slate-700"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <FaSun className="text-yellow-400 text-sm" /> : <FaMoon className="text-gray-700 text-sm" />}
          </button>
        </div>
        <nav className={`flex-1 overflow-y-auto transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
          {SIDEBAR_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className={`px-6 py-3 flex items-center gap-3 font-bold rounded-lg transition-colors
                ${isDark ? `text-white hover:bg-slate-800 ${pathname === link.href ? 'bg-slate-800' : ''}` : `text-black hover:bg-gray-100 ${pathname === link.href ? 'bg-gray-100' : ''}`}`}
              style={!isDark ? { color: '#000', fontWeight: 700, letterSpacing: '0.02em' } : {}}
            >
              {link.label === "Dashboard" && <span><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm0-4h2V3H3v2zm4 0h2V3H7v2zm4 0h2V3h-2v2zm4 0h2V3h-2v2zM3 21h2v-2H3v2zm4 0h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2z" /></svg></span>}
              {link.label === "Onboard Vendor" && <span><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></span>}
              {link.label === "Add Manually Vendor" && <span><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg></span>}
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Profile section in sidebar (mobile only) */}
        <div className="flex flex-col items-center gap-2 py-4 md:hidden">
          <button onClick={() => setDrawerOpen(true)} className="focus:outline-none">
            <Image
              src={typeof window !== 'undefined' && localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')!).profileImg ? `http://localhost:8081${JSON.parse(localStorage.getItem('user')!).profileImg}` : '/default-profile.png'}
              alt="Profile"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border-2 border-blue-400 object-cover"
            />
          </button>
        </div>
        <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        {/* Sidebar bottom section */}
        <div className={`flex flex-col gap-4 p-6 border-t transition-colors ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
          {/* Theme toggle moved to top right, nothing here now */}
          {/* Logout Icon Button */}
          <div className="flex items-center justify-between mt-4">
            <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Logout</span>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-black hover:bg-red-700' : 'bg-white hover:bg-red-200'}`}
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-500" />
            </button>
          </div>
        </div>
      </aside>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-3 rounded-full shadow-lg border-2 border-blue-500 bg-blue-600 text-white"
        onClick={() => setSidebarOpen(open => !open)}
        aria-label="Toggle sidebar"
        style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)' }}
      >
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
      {/* Main content always rendered */}
      <main className="flex-1 p-4 md:ml-[2px] overflow-y-auto transition-colors bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white">
        {children}
      </main>
    </div>
  );
}
