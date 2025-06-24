"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '../utils/ThemeContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type VendorForm = {
  vendorFullName: string;
  vendorCompanyName: string;
  contactNo: string;
  alternateMobileNo: string;
  city: string;
  vendorEmail: string;
  bankName: string;
  bankAccountNo: string;
  ifscCode: string;
  aadharNo: string;
  panNo: string;
  gstNo: string;
  gstNoImage: File | null;
  udyogAadharNo: string;
  govtApprovalCertificate: File | null;
  vendorDocs: File | null;
  vendorImage: File | null;
  aadharPhoto: File | null;
  panPhoto: File | null;
  vendorOtherDetails: string;
  status: string;
};

const OnboardingFormComponent = () => {
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState<VendorForm>({
    vendorFullName: "",
    vendorCompanyName: "",
    contactNo: "",
    alternateMobileNo: "",
    city: "",
    vendorEmail: "",
    bankName: "",
    bankAccountNo: "",
    ifscCode: "",
    aadharNo: "",
    panNo: "",
    gstNo: "",
    gstNoImage: null,
    udyogAadharNo: "",
    govtApprovalCertificate: null,
    vendorDocs: null,
    vendorImage: null,
    aadharPhoto: null,
    panPhoto: null,
    vendorOtherDetails: "",
    status: "Inactive" // Vendors onboarded this way start as Inactive
  });

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setForm((prev) => ({ ...prev, vendorEmail: email }));
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof VendorForm) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const masterAdminId = searchParams.get('masterAdminId');

    if (!masterAdminId) {
      toast.error("Invalid onboarding link. Master Admin ID is missing.");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string | Blob);
      }
    });
    // The masterAdminId is part of the VendorForm DTO on the backend
    formData.append('masterAdminId', masterAdminId);

    const toastId = toast.loading("Submitting your details...");

    try {
      // This endpoint updates the vendor record created during the invitation step.
      const response = await fetch('http://localhost:8081/api/masteradmins/vendors/complete-onboarding', {
        method: 'PUT', // Use PUT to update the existing vendor record
        body: formData,
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText || "Failed to submit details.");
      }

      toast.update(toastId, { render: "Submission successful!", type: 'success', isLoading: false, autoClose: 3000 });
      setIsSubmitted(true);
    } catch (err: unknown) {
      toast.update(toastId, { render: (err as Error).message || "An error occurred.", type: 'error', isLoading: false, autoClose: 5000 });
    }
  };

  if (isSubmitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center py-6 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className={`w-full max-w-2xl mx-auto rounded-xl shadow-lg p-8 text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h1 className="text-3xl font-bold text-green-500 mb-4">Thank You!</h1>
          <p className="text-lg">Your details have been submitted successfully.</p>
          <p className="mt-2">We will send your login credentials to you shortly.</p>
        </div>
      </div>
    );
  }
  
  const inputClass = `w-full p-2 border rounded ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-300'}`;
  const fileInputClass = `${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDark ? 'file:bg-blue-600 file:text-white hover:file:bg-blue-700' : 'file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200'}`;
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <div className={`min-h-screen py-12 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
       <ToastContainer position="top-right" theme={isDark ? 'dark' : 'light'} />
      <div className={`w-full max-w-4xl mx-auto rounded-xl shadow-lg p-8 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h1 className="text-3xl font-bold text-center mb-8">Vendor Onboarding Form</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          
          {/* Personal Details */}
          <div><label className={labelClass}>Full Name</label><input type="text" value={form.vendorFullName} onChange={(e) => setForm({...form, vendorFullName: e.target.value})} className={inputClass} required /></div>
          <div><label className={labelClass}>Company Name</label><input type="text" value={form.vendorCompanyName} onChange={(e) => setForm({...form, vendorCompanyName: e.target.value})} className={inputClass} required /></div>
          <div><label className={labelClass}>Contact Number</label><input type="text" value={form.contactNo} onChange={(e) => setForm({...form, contactNo: e.target.value})} className={inputClass} required /></div>
          <div><label className={labelClass}>Alternate Mobile</label><input type="text" value={form.alternateMobileNo} onChange={(e) => setForm({...form, alternateMobileNo: e.target.value})} className={inputClass} /></div>
          <div><label className={labelClass}>City</label><input type="text" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className={inputClass} required /></div>
          <div><label className={labelClass}>Email</label><input type="email" value={form.vendorEmail} className={`w-full p-2 border rounded ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`} readOnly /></div>

          {/* Bank Details */}
          <div className="md:col-span-2 mt-4 border-t pt-4"><h2 className="text-xl font-semibold">Bank Details</h2></div>
          <div><label className={labelClass}>Bank Name</label><input type="text" value={form.bankName} onChange={(e) => setForm({...form, bankName: e.target.value})} className={inputClass} /></div>
          <div><label className={labelClass}>Bank Account No.</label><input type="text" value={form.bankAccountNo} onChange={(e) => setForm({...form, bankAccountNo: e.target.value})} className={inputClass} /></div>
          <div><label className={labelClass}>IFSC Code</label><input type="text" value={form.ifscCode} onChange={(e) => setForm({...form, ifscCode: e.target.value})} className={inputClass} /></div>

          {/* ID & Tax Details */}
          <div className="md:col-span-2 mt-4 border-t pt-4"><h2 className="text-xl font-semibold">Identification & Tax</h2></div>
          <div><label className={labelClass}>Aadhar No.</label><input type="text" value={form.aadharNo} onChange={(e) => setForm({...form, aadharNo: e.target.value})} className={inputClass} /></div>
          <div><label className={labelClass}>PAN No.</label><input type="text" value={form.panNo} onChange={(e) => setForm({...form, panNo: e.target.value})} className={inputClass} /></div>
          <div><label className={labelClass}>GST No.</label><input type="text" value={form.gstNo} onChange={(e) => setForm({...form, gstNo: e.target.value})} className={inputClass} /></div>
          <div><label className={labelClass}>Udyog Aadhar No.</label><input type="text" value={form.udyogAadharNo} onChange={(e) => setForm({...form, udyogAadharNo: e.target.value})} className={inputClass} /></div>

          {/* File Uploads */}
          <div className="md:col-span-2 mt-4 border-t pt-4"><h2 className="text-xl font-semibold">Document Uploads</h2></div>
          <div><label className={labelClass}>Vendor Image</label><input type="file" onChange={(e) => handleFileChange(e, 'vendorImage')} className={fileInputClass} /></div>
          <div><label className={labelClass}>Aadhar Photo</label><input type="file" onChange={(e) => handleFileChange(e, 'aadharPhoto')} className={fileInputClass} /></div>
          <div><label className={labelClass}>PAN Photo</label><input type="file" onChange={(e) => handleFileChange(e, 'panPhoto')} className={fileInputClass} /></div>
          <div><label className={labelClass}>GST Certificate</label><input type="file" onChange={(e) => handleFileChange(e, 'gstNoImage')} className={fileInputClass} /></div>
          <div><label className={labelClass}>Govt. Approval</label><input type="file" onChange={(e) => handleFileChange(e, 'govtApprovalCertificate')} className={fileInputClass} /></div>
          <div><label className={labelClass}>Other Documents</label><input type="file" onChange={(e) => handleFileChange(e, 'vendorDocs')} className={fileInputClass} /></div>

          {/* Other Details */}
          <div className="md:col-span-2 mt-4 border-t pt-4"><label className={labelClass}>Other Details</label><textarea value={form.vendorOtherDetails} onChange={(e) => setForm({...form, vendorOtherDetails: e.target.value})} className={inputClass} rows={3}></textarea></div>

          <div className="md:col-span-2 text-right mt-6">
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">Submit Details</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Wrap the component in Suspense to handle the initial render before searchParams are available
export default function VendorOnboardFormPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center'>Loading...</div>}>
      <OnboardingFormComponent />
    </Suspense>
  );
}
