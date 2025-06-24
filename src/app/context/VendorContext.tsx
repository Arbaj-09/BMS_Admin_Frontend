"use client";

import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';

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

interface Vendor {
  id: number;
  status: 'Active' | 'Inactive';
  [key: string]: unknown;
}

interface VendorContextType {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  fetchVendors: () => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider = ({ children }: { children: ReactNode }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    const masterAdminId = getMasterAdminId();
    if (!masterAdminId) {
      const authError = "Master Admin not authenticated.";
      setError(authError);
      setLoading(false);
      toast.error(authError);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/masteradmins/${masterAdminId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <VendorContext.Provider value={{ vendors, loading, error, fetchVendors }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
};
