"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../app/utils/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import { useState, useEffect } from "react";
import ProfileDrawer from "./ProfileDrawer";

// Define the structure for the user object
interface User {
  fullName: string;
  profileImg: string | null;
}

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Onboard Vendor", href: "/onboard-vendor" },
  { label: "Add Manually Vendor", href: "/add-manually-vendor" },
  { label: "Custom Booking", href: "/custom-booking" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Function to load user data from localStorage
  const loadUserData = () => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  };

  // Load user data on initial mount and listen for updates
  useEffect(() => {
    loadUserData();

    const handleUserUpdate = () => loadUserData();
    window.addEventListener('userUpdated', handleUserUpdate);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Reload data on close to reflect any profile updates
    loadUserData();
  };
  
  // Hide Navbar on public routes
  if (['/login', '/forgot-password', '/vendor-onboard-form'].includes(pathname)) {
    return null;
  }

  return (
    <nav className={`w-full z-40 sticky top-0 shadow-md transition-colors duration-200 ${isDark ? 'bg-slate-900 border-b border-slate-800 mb-[1px]' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-blue-600 dark:text-blue-400 select-none">
            <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Admin Panel
          </div>
          <div className="hidden md:flex gap-2 lg:gap-4 items-center">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${pathname === link.href ? 'bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-400 font-bold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-slate-800 dark:hover:text-blue-300'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors duration-150 shadow-sm ${isDark ? 'bg-slate-800 border-slate-600 text-yellow-400' : 'bg-white border-gray-300 text-blue-500'}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>
            {/* Profile Avatar */}
            {user && (
              <button
                className="ml-2 flex items-center focus:outline-none"
                onClick={() => setDrawerOpen(true)}
                title="Profile"
              >
                {user.profileImg ? (
                  <img src={`http://localhost:8081${user.profileImg}`} alt="Profile" className="w-8 h-8 rounded-full border-2 border-blue-400 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-base text-blue-700 border border-blue-200">
                    {user.fullName?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
              </button>
            )}
            <ProfileDrawer
              open={drawerOpen}
              onClose={handleDrawerClose}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
