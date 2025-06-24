"use client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTrash, FaEye } from "react-icons/fa";
import { useTheme } from "../utils/ThemeContext";

// Types
interface CustomBooking {
  id: number;
  bookingDate: string;
  bookingTime: string;
  bookingStatus: string;
  bookingType: string;
  bookingDetails: string;
  bookingAmount: string;
  customerName: string;
  customerMobileNo: string;
  pickupLocation: string;
  dropLocation: string;
  pickUpDate: string;
  pickUpTime: string;
  carType: string;
  returnDate: string;
  tripType: string;
  collection: number;
  fullName: string;
  customerEmail: string;
  assignedVendorId?: number;
  assignedVendorName?: string;
}

interface Vendor {
  id: number;
  vendorFullName?: string;
  vendorCompanyName?: string;
  contactNo?: string;
  alternateMobileNo?: string;
  city?: string;
  vendorEmail?: string;
  bankName?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  aadharNo?: string;
  panNo?: string;
  gstNo?: string;
  gstNoImage?: string | null;
  udyogAadharNo?: string;
  govtApprovalCertificate?: string | null;
  vendorDocs?: string | null;
  vendorImage?: string | null;
  aadharPhoto?: string | null;
  panPhoto?: string | null;
  vendorOtherDetails?: string;
  govtApprovalCertificateUrl?: string;
  vendorDocsUrl?: string;
  vendorImageUrl?: string;
  aadharPhotoUrl?: string;
  panPhotoUrl?: string;
  gstNoImageUrl?: string;
  status?: 'Active' | 'Inactive' | string;
}

const initialForm: Omit<CustomBooking, "id"> = {
  bookingDate: "",
  bookingTime: "",
  bookingStatus: "",
  bookingType: "",
  bookingDetails: "",
  bookingAmount: "",
  customerName: "",
  customerMobileNo: "",
  pickupLocation: "",
  dropLocation: "",
  pickUpDate: "",
  pickUpTime: "",
  carType: "",
  returnDate: "",
  tripType: "",
  collection: 0,
  fullName: "",
  customerEmail: ""
};

const API_BASE = "http://localhost:8081";

export default function CustomBookingPage() {
  const [bookings, setBookings] = useState<CustomBooking[]>([]);
  const [form, setForm] = useState<Omit<CustomBooking, "id">>(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBookingId, setEditBookingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { isDark } = useTheme();

  // Add editForm state for edit modal
  const [editForm, setEditForm] = useState<Omit<CustomBooking, "id">>(initialForm);

  // Add vendor assignment state
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [assignedVendor, setAssignedVendor] = useState<{ id: number; name: string } | null>(null);

  // Fetch bookings from backend
  const fetchBookings = async (masterAdminId: string) => {
    console.log('masterAdminId:', masterAdminId);
    if (!masterAdminId) return;
    try {
      // Fetch full booking details
      const resFull = await fetch(`${API_BASE}/api/masteradmins/${masterAdminId}/custom-bookings`);
      if (!resFull.ok) throw new Error("Failed to fetch full bookings");
      const fullBookings = await resFull.json();

      // Fetch vendor assignment info (DTO)
      const resVendor = await fetch(`${API_BASE}/api/bookings/masteradmins/${masterAdminId}/custom-bookings`);
      if (!resVendor.ok) throw new Error("Failed to fetch vendor assignments");
      const vendorAssignments = await resVendor.json();

      // Merge vendor assignment info into full bookings by bookingId
      const mapped = fullBookings.map((b: Record<string, unknown>) => {
        const vendorInfo = vendorAssignments.find((v: { bookingId: number; assignedVendorId?: number; assignedVendorName?: string }) => v.bookingId === b['bookingId']);
        return {
          id: b['bookingId'] as number,
          bookingDate: (b['bookingDate'] as string) ?? "",
          bookingTime: (b['bookingTime'] as string) ?? "",
          bookingStatus: (b['bookingStatus'] as string) ?? "",
          bookingType: (b['bookingType'] as string) ?? "",
          bookingDetails: (b['bookingDetails'] as string) ?? "",
          bookingAmount: (b['bookingAmount'] as string) ?? "",
          customerName: (b['customerName'] as string) ?? "",
          customerMobileNo: (b['customerMobileNo'] as string) ?? "",
          pickupLocation: (b['pickupLocation'] as string) ?? "",
          dropLocation: (b['dropLocation'] as string) ?? "",
          pickUpDate: (b['pickUpDate'] as string) ?? "",
          pickUpTime: (b['pickUpTime'] as string) ?? "",
          carType: (b['carType'] as string) ?? "",
          returnDate: (b['returnDate'] as string) ?? "",
          tripType: (b['tripType'] as string) ?? "",
          collection: (b['collection'] as number) ?? 0,
          fullName: (b['fullName'] as string) ?? "",
          customerEmail: (b['customerEmail'] as string) ?? "",
          assignedVendorId: vendorInfo?.assignedVendorId ?? null,
          assignedVendorName: vendorInfo?.assignedVendorName ?? ""
        };
      });
      console.log('Mapped bookings:', mapped);
      setBookings(mapped);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Failed to load bookings");
    }
  };

  // On mount, check for masterAdminId and fetch bookings if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const masterAdminId = localStorage.getItem("masterAdminId");
      if (!masterAdminId) {
        toast.error("No master admin ID found. Please login or select a master admin.");
        // Optionally, redirect to login or selection page here
        // window.location.href = "/login";
        return;
      }
      fetchBookings(masterAdminId);
    }
  }, []);

  // Helper to get masterAdminId always from localStorage (client-side only)
  const getMasterAdminId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("masterAdminId");
    }
    return null;
  };

  // Add handler for edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Type guard for Vendor
  function isVendor(obj: unknown): obj is Vendor {
    if (typeof obj !== 'object' || obj === null) return false;
    const v = obj as Partial<Vendor>;
    return (
      typeof v.id === 'number' &&
      typeof v.vendorCompanyName === 'string' &&
      typeof v.vendorEmail === 'string'
    );
  }

  // Fetch vendors from backend (real list, not dummy)
  const fetchVendors = async () => {
    const masterAdminId = getMasterAdminId();
    if (!masterAdminId) return;
    try {
      const res = await fetch(`${API_BASE}/api/masteradmins/${masterAdminId}/vendors`);
      if (!res.ok) throw new Error("Failed to fetch vendors");
      const data = await res.json();
      // Ensure only valid Vendor objects are set
      setVendorList(Array.isArray(data) ? data.filter(isVendor) : []);
    } catch {
      toast.error("Failed to load vendors");
    }
  };

  // Assign vendor to booking (update backend and UI)
  const handleAssignVendor = async (vendor: Vendor) => {
    if (!editBookingId) return;
    const masterAdminId = getMasterAdminId();
    if (!masterAdminId) return toast.error("No master admin ID");
    try {
      // Use POST as per backend
      const res = await fetch(`${API_BASE}/api/bookings/masteradmins/${masterAdminId}/custom-bookings/${editBookingId}/assign-vendor/${vendor.id}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to assign vendor");
      setAssignedVendor({ id: vendor.id, name: vendor.vendorCompanyName || "" });
      setEditForm((f) => ({ ...f, assignedVendorId: vendor.id, assignedVendorName: vendor.vendorCompanyName || "" }));
      toast.success("Vendor assigned to booking successfully.");
      setShowVendorModal(false);
      fetchBookings(masterAdminId);
    } catch {
      toast.error("Failed to assign vendor");
    }
  };

  // Add booking
  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const masterAdminId = getMasterAdminId();
    if (!masterAdminId) return toast.error("No master admin ID");
    try {
      const res = await fetch(`${API_BASE}/api/bookings/masteradmins/${masterAdminId}/custom-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to add booking");
      toast.success("Booking added successfully!");
      setShowModal(false);
      setForm(initialForm);
      fetchBookings(masterAdminId);
    } catch {
      toast.error("Failed to add booking");
    }
  };

  // Edit booking
  const handleEditBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBookingId) return;
    const masterAdminId = getMasterAdminId();
    if (!masterAdminId) return toast.error("No master admin ID");
    try {
      const res = await fetch(`${API_BASE}/api/bookings/masteradmins/${masterAdminId}/custom-bookings/${editBookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error("Failed to update booking");
      toast.success("Booking updated successfully!");
      setShowEditModal(false);
      setEditBookingId(null);
      fetchBookings(masterAdminId);
    } catch {
      toast.error("Failed to update booking");
    }
  };

  // Delete booking
  const handleDeleteBooking = async () => {
    if (!deleteId) return;
    const masterAdminId = getMasterAdminId();
    if (!masterAdminId) return toast.error("No master admin ID");
    try {
      const res = await fetch(`${API_BASE}/api/bookings/masteradmins/${masterAdminId}/custom-bookings/${deleteId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete booking");
      toast.success("Booking deleted successfully!");
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchBookings(masterAdminId);
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  // All hooks and handlers are defined above
  return (
    <div className={`min-h-screen py-6 px-2 md:px-8 transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Custom Bookings</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto justify-center"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Add Custom Booking
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className={`min-w-full rounded shadow border border-gray-300 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <thead>
            <tr>
              <th className="py-2 px-2 sm:px-4 border-b text-center whitespace-nowrap">ID</th>
              <th className="py-2 px-2 sm:px-4 border-b text-center whitespace-nowrap">Customer Name</th>
              <th className="py-2 px-2 sm:px-4 border-b text-center whitespace-nowrap">Amount</th>
              <th className="py-2 px-2 sm:px-4 border-b text-center whitespace-nowrap">Status</th>
              <th className="py-2 px-2 sm:px-4 border-b text-center whitespace-nowrap">Assign Vendor</th>
              <th className="py-2 px-2 sm:px-4 border-b text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-gray-300">
                <td className="py-2 px-2 sm:px-4 text-center align-middle">{booking.id}</td>
                <td className="py-2 px-2 sm:px-4 text-center align-middle">{booking.customerName}</td>
                <td className="py-2 px-2 sm:px-4 text-center align-middle">{booking.bookingAmount}</td>
                <td className="py-2 px-2 sm:px-4 text-center align-middle">{booking.bookingStatus}</td>
                <td className="py-2 px-2 sm:px-4 text-center align-middle">
                  {booking.assignedVendorId ? (
                    <span className="inline-block px-3 py-1 rounded bg-red-600 text-white font-semibold">
                      {booking.assignedVendorName || vendorList.find(v => v.id === booking.assignedVendorId)?.vendorCompanyName || 'Assigned'} (ID: {booking.assignedVendorId})
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded bg-gray-200 text-gray-700">Unassigned</span>
                  )}
                </td>
                <td className="py-2 px-2 sm:px-4 text-center align-middle min-w-[80px]">
                  <div className="flex justify-center items-center gap-3 flex-wrap">
                    <button className="text-red-500 hover:text-red-700 transition-colors text-lg" title="Delete" onClick={() => { setShowDeleteConfirm(true); setDeleteId(booking.id); }}><FaTrash /></button>
                    <button className="text-blue-500 hover:text-blue-700 transition-colors text-lg" title="Edit" onClick={() => { setEditBookingId(booking.id); setEditForm(booking); setShowEditModal(true); }}><FaEye /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="z-60 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl border border-gray-300 dark:border-slate-700 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Add Custom Booking</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddBooking}>
              <div>
                <label className="block text-sm font-semibold mb-1">Customer Name</label>
                <input className="input w-full" name="customerName" value={form.customerName} onChange={e => setForm((f) => ({ ...f, customerName: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input className="input w-full" name="fullName" value={form.fullName} onChange={e => setForm((f) => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Customer Email</label>
                <input className="input w-full" name="customerEmail" type="email" value={form.customerEmail} onChange={e => setForm((f) => ({ ...f, customerEmail: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Customer Mobile No</label>
                <input className="input w-full" name="customerMobileNo" value={form.customerMobileNo} onChange={e => setForm((f) => ({ ...f, customerMobileNo: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Amount</label>
                <input className="input w-full" name="bookingAmount" type="number" value={form.bookingAmount} onChange={e => setForm((f) => ({ ...f, bookingAmount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Collection</label>
                <input className="input w-full" name="collection" type="number" value={form.collection} onChange={e => setForm((f) => ({ ...f, collection: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Status</label>
                <input className="input w-full" name="bookingStatus" value={form.bookingStatus} onChange={e => setForm((f) => ({ ...f, bookingStatus: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Type</label>
                <input className="input w-full" name="bookingType" value={form.bookingType} onChange={e => setForm((f) => ({ ...f, bookingType: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Details</label>
                <input className="input w-full" name="bookingDetails" value={form.bookingDetails} onChange={e => setForm((f) => ({ ...f, bookingDetails: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Date</label>
                <input className="input w-full" name="bookingDate" type="date" value={form.bookingDate} onChange={e => setForm((f) => ({ ...f, bookingDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Time</label>
                <input className="input w-full" name="bookingTime" type="time" value={form.bookingTime} onChange={e => setForm((f) => ({ ...f, bookingTime: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Pickup Location</label>
                <input className="input w-full" name="pickupLocation" value={form.pickupLocation} onChange={e => setForm((f) => ({ ...f, pickupLocation: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Drop Location</label>
                <input className="input w-full" name="dropLocation" value={form.dropLocation} onChange={e => setForm((f) => ({ ...f, dropLocation: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Pickup Date</label>
                <input className="input w-full" name="pickUpDate" type="date" value={form.pickUpDate} onChange={e => setForm((f) => ({ ...f, pickUpDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Pickup Time</label>
                <input className="input w-full" name="pickUpTime" type="time" value={form.pickUpTime} onChange={e => setForm((f) => ({ ...f, pickUpTime: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Car Type</label>
                <input className="input w-full" name="carType" value={form.carType} onChange={e => setForm((f) => ({ ...f, carType: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Return Date</label>
                <input className="input w-full" name="returnDate" type="date" value={form.returnDate} onChange={e => setForm((f) => ({ ...f, returnDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Trip Type</label>
                <input className="input w-full" name="tripType" value={form.tripType} onChange={e => setForm((f) => ({ ...f, tripType: e.target.value }))} />
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Add Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Booking Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="z-60 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl border border-gray-300 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Custom Booking</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleEditBooking}>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Booking ID</label>
                <div className="input w-full bg-gray-100 cursor-not-allowed py-2 px-3 rounded-md border border-gray-300 dark:border-slate-700 text-gray-500">
                  {editBookingId}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Customer Name</label>
                <input className="input w-full" name="customerName" value={editForm.customerName} onChange={handleEditInputChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input className="input w-full" name="fullName" value={editForm.fullName} onChange={handleEditInputChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Customer Email</label>
                <input className="input w-full" name="customerEmail" value={editForm.customerEmail} onChange={handleEditInputChange} type="email" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Customer Mobile No</label>
                <input className="input w-full" name="customerMobileNo" value={editForm.customerMobileNo} onChange={handleEditInputChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Amount</label>
                <input className="input w-full" name="bookingAmount" value={editForm.bookingAmount} onChange={handleEditInputChange} type="number" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Collection</label>
                <input className="input w-full" name="collection" value={editForm.collection} onChange={handleEditInputChange} type="number" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Status</label>
                <input className="input w-full" name="bookingStatus" value={editForm.bookingStatus} onChange={handleEditInputChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Type</label>
                <input className="input w-full" name="bookingType" value={editForm.bookingType} onChange={handleEditInputChange} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Booking Details</label>
                <input className="input w-full" name="bookingDetails" value={editForm.bookingDetails} onChange={handleEditInputChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Date</label>
                <input className="input w-full" name="bookingDate" value={editForm.bookingDate} onChange={handleEditInputChange} type="date" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Booking Time</label>
                <input className="input w-full" name="bookingTime" value={editForm.bookingTime} onChange={handleEditInputChange} type="time" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Pickup Location</label>
                <input className="input w-full" name="pickupLocation" value={editForm.pickupLocation} onChange={handleEditInputChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Drop Location</label>
                <input className="input w-full" name="dropLocation" value={editForm.dropLocation} onChange={handleEditInputChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Pickup Date</label>
                <input className="input w-full" name="pickUpDate" value={editForm.pickUpDate} onChange={handleEditInputChange} type="date" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Pickup Time</label>
                <input className="input w-full" name="pickUpTime" value={editForm.pickUpTime} onChange={handleEditInputChange} type="time" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Car Type</label>
                <input className="input w-full" name="carType" value={editForm.carType} onChange={handleEditInputChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Return Date</label>
                <input className="input w-full" name="returnDate" value={editForm.returnDate} onChange={handleEditInputChange} type="date" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Trip Type</label>
                <input className="input w-full" name="tripType" value={editForm.tripType} onChange={handleEditInputChange} />
              </div>
              <div className="col-span-2 flex justify-between items-center mt-4">
                <div>
                  <span className="font-semibold">Assigned Vendor:</span>
                  {(editForm.assignedVendorId && editForm.assignedVendorName) ? (
                    <span className="ml-2 px-3 py-1 rounded bg-red-600 text-white font-semibold">
                      {editForm.assignedVendorName} (ID: {editForm.assignedVendorId})
                    </span>
                  ) : (
                    <span className="ml-2 px-3 py-1 rounded bg-gray-200 text-gray-700">Unassigned</span>
                  )}
                </div>
                <button type="button" className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600" onClick={() => { fetchVendors(); setShowVendorModal(true); }}>
                  Assign Vendor
                </button>
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium" onClick={() => { setShowEditModal(false); }}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl border border-gray-300 dark:border-slate-700 flex flex-col items-center">
            <p className="mb-6 text-lg text-gray-900 dark:text-white">Are you sure you want to delete this booking?</p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                onClick={handleDeleteBooking}
              >
                Yes, Delete
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-slate-600"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Vendor list modal */}
      {showVendorModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowVendorModal(false)}></div>
          <div className="z-70 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl border border-gray-300 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Assign Vendor</h2>
            <input type="text" className="input w-full mb-4" placeholder="Search vendors..." value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} />
            <table className="min-w-full rounded shadow border border-gray-300 dark:border-slate-700">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-center">Vendor Id</th>
                  <th className="py-2 px-4 border-b text-center">Vendor Company Name</th>
                  <th className="py-2 px-4 border-b text-center">Contact No</th>
                  <th className="py-2 px-4 border-b text-center">Email</th>
                  <th className="py-2 px-4 border-b text-center">Address</th>
                  <th className="py-2 px-4 border-b text-center">Assign</th>
                </tr>
              </thead>
              <tbody>
                {vendorList
                  .filter(isVendor)
                  .filter(
                    v =>
                      (v.vendorCompanyName && v.vendorCompanyName.toLowerCase().includes(vendorSearch.toLowerCase())) ||
                      (v.vendorEmail && v.vendorEmail.toLowerCase().includes(vendorSearch.toLowerCase()))
                  )
                  .map(vendor => (
                    <tr key={vendor.id}>
                      <td className="py-2 px-4 text-center">{vendor.id}</td>
                      <td className="py-2 px-4 text-center">{vendor.vendorCompanyName}</td>
                      <td className="py-2 px-4 text-center">{vendor.contactNo}</td>
                      <td className="py-2 px-4 text-center">{vendor.vendorEmail}</td>
                      <td className="py-2 px-4 text-center">{vendor.city}</td>
                      <td className="py-2 px-4 text-center">
                        {assignedVendor && assignedVendor.id === vendor.id || editForm.assignedVendorId === vendor.id ? (
                          <button className="px-4 py-1 rounded bg-red-600 text-white font-semibold cursor-default">Assigned</button>
                        ) : (
                          <button className="px-4 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-blue-500 hover:text-white" onClick={() => handleAssignVendor(vendor)}>Assign</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 rounded bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-slate-600" onClick={() => setShowVendorModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

