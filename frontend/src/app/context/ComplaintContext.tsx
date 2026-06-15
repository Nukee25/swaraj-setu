import { createContext, useContext, useState, ReactNode } from "react";
import { mockComplaints } from "../data/mockData";
import { Complaint, ComplaintStatus, Department } from "../types/complaint";

interface ComplaintContextType {
  complaints: Complaint[];
  updateStatus: (id: string, status: ComplaintStatus) => void;
  addComplaint: (complaint: Omit<Complaint, "id" | "ticketNumber" | "updatedAt">) => Complaint;
}

const ComplaintContext = createContext<ComplaintContextType | null>(null);

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);

  const updateStatus = (id: string, status: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status, updatedAt: new Date() } : c
      )
    );
  };

  const addComplaint = (data: Omit<Complaint, "id" | "ticketNumber" | "updatedAt">): Complaint => {
    const id = String(complaints.length + 1);
    const ticketNumber = `SS-2024-${String(complaints.length + 1).padStart(3, "0")}`;
    const newComplaint: Complaint = {
      ...data,
      id,
      ticketNumber,
      updatedAt: new Date(),
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  };

  return (
    <ComplaintContext.Provider value={{ complaints, updateStatus, addComplaint }}>
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const ctx = useContext(ComplaintContext);
  if (!ctx) throw new Error("useComplaints must be used within ComplaintProvider");
  return ctx;
}
