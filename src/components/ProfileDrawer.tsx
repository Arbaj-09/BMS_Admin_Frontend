"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Define the structure of the MasterAdmin object based on your backend response
interface MasterAdmin {
  id: number;
  fullName: string;
  email: string;
  profileImg: string | null;
  role: string;
}

export default function ProfileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [admin, setAdmin] = useState<MasterAdmin | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // State for the edit form
  const [editData, setEditData] = useState({ fullName: '', email: '', password: '' });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Effect to load user data from localStorage when the drawer opens
  useEffect(() => {
    if (open) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setAdmin(userData);
        setEditData({ fullName: userData.fullName, email: userData.email, password: '' });
        if (userData.profileImg) {
          setImagePreview(`http://localhost:8081${userData.profileImg}`);
        } else {
          setImagePreview(null);
        }
      } else {
         // Handle case where user is not found in localStorage
        onClose();
        router.push('/login');
      }
    }
  }, [open, router, onClose]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (!admin) return;

    const formData = new FormData();
    formData.append('fullName', editData.fullName);
    formData.append('email', editData.email);
    if (editData.password) {
      formData.append('password', editData.password);
    }
    if (profileImageFile) {
      formData.append('profileImg', profileImageFile);
    }

    const toastId = toast.loading("Updating profile...");

    try {
      const response = await fetch(`http://localhost:8081/api/masteradmins/${admin.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update profile');
      }

      const updatedAdmin = await response.json();

      // Update localStorage with the new data
      localStorage.setItem('user', JSON.stringify(updatedAdmin));

      // Dispatch a custom event to notify other components that the user has been updated
      window.dispatchEvent(new Event('userUpdated'));

      // Update component state to reflect changes
      setAdmin(updatedAdmin);
      setEditMode(false);
      setProfileImageFile(null);
      if (updatedAdmin.profileImg) {
        setImagePreview(`http://localhost:8081${updatedAdmin.profileImg}`);
      }
      
      toast.update(toastId, { render: "Profile updated successfully!", type: 'success', isLoading: false, autoClose: 3000 });

    } catch (error: any) {
      toast.update(toastId, { render: error.message || "An unexpected error occurred.", type: 'error', isLoading: false, autoClose: 5000 });
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Assuming a token is stored
    toast.success("Logged out successfully!");
    router.push('/login');
    onClose();
  };

  if (!open || !admin) return null;

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 shadow-lg z-50 flex flex-col p-6 transition-transform duration-300 transform translate-x-0 border-l border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white text-sm">Close</button>
        </div>

        <div className="flex flex-col items-center flex-grow">
          {/* Profile View */}
          <div className="flex flex-col items-center gap-2 mb-4">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-20 h-20 object-cover rounded-full border-2 border-blue-500" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center font-bold text-3xl text-blue-700 border border-blue-200">
                {admin.fullName?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
            {!editMode && (
              <button
                className="mt-2 px-4 py-1 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
                onClick={() => setEditMode(true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13h3l7-7a2 2 0 00-2.828-2.828l-7 7v3z" /></svg>
                Edit
              </button>
            )}
          </div>

          {/* Edit Mode Form */}
          {editMode ? (
            <div className="w-full">
              <div className="flex-grow">
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input type="text" name="fullName" value={editData.fullName} onChange={handleInputChange} className="mb-3 px-3 py-2 w-full border rounded dark:bg-slate-800 dark:border-slate-700" />
                
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input type="email" name="email" value={editData.email} onChange={handleInputChange} className="mb-3 px-3 py-2 w-full border rounded dark:bg-slate-800 dark:border-slate-700" />

                <label className="block text-sm font-semibold mb-1">New Password</label>
                <input type="password" name="password" value={editData.password} onChange={handleInputChange} placeholder="Leave blank to keep current" className="mb-3 px-3 py-2 w-full border rounded dark:bg-slate-800 dark:border-slate-700" />

                <label className="block text-sm font-semibold mb-1">Profile Image</label>
                <input type="file" name="image" accept="image/*" onChange={handleFileChange} className="mb-4 text-sm" />
              </div>
              <div className="flex gap-2 mt-4">
                  <button onClick={() => setEditMode(false)} className="w-full py-2 rounded bg-gray-500 text-white font-bold hover:bg-gray-600">Cancel</button>
                  <button onClick={handleUpdate} className="w-full py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700 flex items-center justify-center gap-2"> <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Update</button>
              </div>
            </div>
          ) : (
            <div className="w-full mt-4 text-center">
              <div className="font-bold text-lg text-blue-700 dark:text-blue-300">{admin.fullName}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">{admin.email}</div>
              <button onClick={handleLogout} className="w-full py-2 rounded bg-red-500 text-white font-bold hover:bg-red-600 flex items-center justify-center gap-2 shadow-sm">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
                  Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
