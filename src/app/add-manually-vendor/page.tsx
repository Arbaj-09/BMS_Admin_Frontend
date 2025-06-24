"use client";
import { useState } from "react";
import { useTheme } from '../utils/ThemeContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper to get Master Admin ID from localStorage
const getMasterAdminId = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.id || parsed.masterAdminId || parsed._id;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        return null;
      }
    }
  }
  return null;
};

export default function AddManuallyVendorPage() {
  const [email, setEmail] = useState("");
  const { isDark } = useTheme();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const masterAdminId = getMasterAdminId();

    if (!masterAdminId) {
      toast.error("Master Admin not authenticated. Please log in again.");
      return;
    }

    if (!email) {
      toast.warn("Please enter a vendor email address.");
      return;
    }

    const toastId = toast.loading("Sending invitation...");

    try {
      const response = await fetch(
        `http://localhost:8081/api/masteradmins/vendors/send-manually?email=${encodeURIComponent(email)}&masterAdminId=${masterAdminId}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send invitation.");
      }

      const data = await response.json();

      toast.update(toastId, {
        render: data.message || "Invitation sent successfully!",
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      setEmail(""); // Clear email on success
    } catch (err: unknown) {
      toast.update(toastId, {
        render: (err as Error).message || "An unexpected error occurred.",
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  return (
    <div className={`min-h-screen py-6 px-2 md:px-8 transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />
      <div className="flex justify-between items-center mb-6 max-w-md mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold">Add Manually Vendor</h1>
      </div>
      <div className={`w-full max-w-md mx-auto rounded-xl shadow-lg p-8 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter vendor email"
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-black placeholder-gray-500'}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className={`w-full py-2 rounded font-semibold shadow-lg text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            Send Invite
          </button>
        </form>
      </div>
    </div>
  );
}
