import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Complaint, ComplaintStatus } from "../types/complaint";
import { api } from "../utils/api";
interface ComplaintContextType {
  complaints: Complaint[];
  refresh: () => Promise<void>;
  updateStatus: (
    id: string,
    status: ComplaintStatus,
    note?: string,
  ) => Promise<void>;
  upvote: (id: string) => Promise<boolean>;
}
const ComplaintContext = createContext<ComplaintContextType | null>(null);
export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const refresh = async () => {
    const { data } = await api.get("/complaints/feed/");
    setComplaints(data);
  };
  useEffect(() => {
    refresh().catch(() => setComplaints([]));
  }, []);
  const updateStatus = async (
    id: string,
    status: ComplaintStatus,
    note = "",
  ) => {
    const { data } = await api.patch(`/admin/complaints/${id}/status/`, {
      status,
      resolution_notes: note,
    });
    setComplaints((items) =>
      items.map((item) => (item.id === id ? data : item)),
    );
  };
  const upvote = async (id: string) => {
    const { data } = await api.post(`/complaints/${id}/upvote/`);
    setComplaints((items) =>
      items.map((item) =>
        item.id === id ? { ...item, upvotes: data.upvotes } : item,
      ),
    );
    return !data.already_upvoted;
  };
  return (
    <ComplaintContext.Provider
      value={{ complaints, refresh, updateStatus, upvote }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}
export function useComplaints() {
  const ctx = useContext(ComplaintContext);
  if (!ctx)
    throw new Error("useComplaints must be used within ComplaintProvider");
  return ctx;
}
