"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:8081/api/masteradmins/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email, password }).toString(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || "Invalid credentials");
        return;
      }
      const data = await response.json();
      // Optionally store role or user info
      localStorage.setItem("role", data.role || "Master Admin");
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("masterAdminId", data.id || data.masterAdminId || data._id || "");
      router.push("/dashboard");
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl animate-fade-in">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-black dark:text-white tracking-tight"> Login Page</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition text-black dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="relative">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition pr-12 text-black dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500 dark:text-gray-300 focus:outline-none">
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4.03-9-9 0-1.26.25-2.46.7-3.55M6.07 6.07A8.963 8.963 0 0112 5c5 0 9 4.03 9 9 0 1.26-.25 2.46-.7 3.55M15.54 15.54A8.963 8.963 0 0112 19c-5 0-9-4.03-9-9 0-1.26.25-2.46.7-3.55" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 1112 0 6 6 0 01-12 0z" /></svg>
              )}
            </button>
          </div>
          {error && <div className="text-red-500 mb-2 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
          >
            Login
          </button>
          <div className="mt-2 text-center">
            <Link href="/forgot-password" className="text-blue-500 hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
