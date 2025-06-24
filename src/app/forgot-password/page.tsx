"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Sending OTP...");

    try {
      const response = await fetch(`http://localhost:8081/api/masteradmins/password-reset/request-otp?email=${email}`, {
        method: 'POST',
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "Failed to send OTP.");
      }

      toast.update(toastId, { render: "OTP sent successfully!", type: 'success', isLoading: false, autoClose: 3000 });
      setStep(2); // Move to the next step to enter OTP and new password
    } catch (error: unknown) {
      toast.update(toastId, { render: (error as Error).message, type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const toastId = toast.loading("Resetting password...");

    try {
      const response = await fetch(`http://localhost:8081/api/masteradmins/password-reset/verify-otp?email=${email}&otp=${otp}&newPassword=${newPassword}`, {
        method: 'POST',
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "Failed to reset password.");
      }

      toast.update(toastId, { render: "Password updated successfully!", type: 'success', isLoading: false, autoClose: 3000 });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: unknown) {
      toast.update(toastId, { render: (error as Error).message, type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Forgot Password</h2>
        
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              className="w-full p-3 mb-4 border rounded-lg bg-gray-100 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">An OTP has been sent to <strong>{email}</strong>.</p>
            
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">OTP</label>
            <input
              type="text"
              className="w-full p-3 mb-4 border rounded-lg bg-gray-100 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <input
              type="password"
              className="w-full p-3 mb-4 border rounded-lg bg-gray-100 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 mb-4 border rounded-lg bg-gray-100 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Reset Password
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
