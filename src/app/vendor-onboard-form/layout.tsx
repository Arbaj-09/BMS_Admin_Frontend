import "../globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Vendor Onboarding",
  description: "Onboarding form for new vendors",
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
