export type Department = 
  | "Water Supply"
  | "Electricity"
  | "Roads & Transport"
  | "Sanitation"
  | "Healthcare"
  | "Education"
  | "Public Safety"
  | "Tax & Revenue"
  | "Building & Construction"
  | "Environment";

export type ComplaintStatus = "pending" | "in-progress" | "resolved" | "rejected";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface Complaint {
  id: string;
  ticketNumber: string;
  complaintText: string;
  department: Department;
  processedSummary: string;
  keywords: string[];
  status: ComplaintStatus;
  priority: Priority;
  submittedBy: string;
  submittedAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  resolution?: string;
}
