"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../app/utils/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import { useEffect, useState } from "react";
import ProfileDrawer from "./ProfileDrawer";
import Image from "next/image";

const NAV_LINKS = [
	{ label: "Dashboard", href: "/dashboard" },
	{ label: "Onboard Vendor", href: "/onboard-vendor" },
	{ label: "Add Manually Vendor", href: "/add-manually-vendor" },
	// { label: "Custom Booking", href: "/custom-booking" },
];

export default function Navbar() {
	const pathname = usePathname();
	const { isDark, toggleTheme } = useTheme();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [userImg, setUserImg] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const userDataString = localStorage.getItem("user");
			if (userDataString) {
				const userData = JSON.parse(userDataString);
				if (userData.profileImg) {
					setUserImg(`http://localhost:8081${userData.profileImg}`);
				} else {
					setUserImg(null);
				}
			}
		}
	}, []);

	// Hide Navbar on all routes (including custom-booking) on mobile, show only on md+ screens
	if (typeof window !== "undefined") {
		const isMobile = window.innerWidth < 768;
		if (isMobile) return null;
	}
	if (pathname === "/vendor-onboard-form") return null;
	return (
		<nav
			className={`w-full z-40 sticky top-0 shadow-md transition-colors duration-200 ${
				isDark
					? "bg-slate-900 border-b border-slate-800 mb-[1px]"
					: "bg-white border-b border-gray-100"
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-blue-600 dark:text-blue-400 select-none">
						<svg
							className="h-7 w-7 text-blue-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Admin Panel
					</div>
					<div className="hidden md:flex gap-2 lg:gap-4 items-center">
						{NAV_LINKS.map((link) => {
							const isActive = pathname === link.href;
							let linkClasses = "px-4 py-2 rounded-lg font-bold transition-colors duration-150 shadow-sm";
							let style = undefined;
							if (!isDark) {
								// Light mode: always black, bold, high-contrast
								linkClasses += isActive ? " bg-blue-100 text-black" : " text-black hover:bg-blue-50";
								style = { color: '#000', fontWeight: 700, letterSpacing: '0.02em', textShadow: '0 1px 2px #fff, 0 0 2px #cbd5e1' };
							} else {
								// Dark mode: revert to original styles
								linkClasses += isActive ? " bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-400 font-bold" : " text-gray-800 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-slate-800 dark:hover:text-blue-300";
								style = undefined;
							}
							return (
								<Link
									key={link.href}
									href={link.href}
									className={linkClasses}
									style={style}
								>
									{link.label}
								</Link>
							);
						})}
					</div>
					{/* Right side: Only theme toggle remains */}
					<div className="flex items-center gap-2">
						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors duration-150 shadow-sm ${
								isDark
									? "bg-slate-800 border-slate-600 text-yellow-400"
									: "bg-white border-gray-300 text-blue-500"
							}`}
							title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
						>
							{isDark ? (
								<FaSun className="text-lg" />
							) : (
								<FaMoon className="text-lg" />
							)}
						</button>
						{/* Profile Avatar (desktop only) */}
						<button
							className="ml-2 items-center focus:outline-none md:flex hidden"
							onClick={() => setDrawerOpen(true)}
							title="Profile"
						>
							{userImg ? (
								<Image
									src={userImg}
									alt="Profile"
									width={32}
									height={32}
									className="w-8 h-8 rounded-full border border-blue-200 object-cover"
								/>
							) : (
								<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-base text-blue-700 border border-blue-200">
									N
								</div>
							)}
						</button>
						<ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
					</div>
				</div>
			</div>
		</nav>
	);
}
