"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setMounted(true);
    if (
      storedRole !== "Master Admin" &&
      !["/login", "/forgot-password", "/vendor-onboard-form"].includes(pathname)
    ) {
      router.replace("/login");
    }
  }, [pathname, router]);

  const isAuthPage = ["/login", "/forgot-password", "/vendor-onboard-form"].includes(pathname);

  if (!mounted) return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (role !== "Master Admin") {
    return null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white min-h-screen">
      {children}
    </div>
  );
}
