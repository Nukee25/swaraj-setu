export type Department =
  | "Water Supply" | "Electricity" | "Roads & Transport" | "Sanitation"
  | "Healthcare" | "Education" | "Public Safety" | "Tax & Revenue"
  | "Building & Construction" | "Environment";
export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export interface Complaint {
  id: string; ticket_number: string; title: string; description: string;
  primary_department: Department; secondary_departments: Department[];
  urgency_level: Priority; confidence_score: number;
  location?: { type: "Point"; coordinates: [number, number] };
  media: string[]; upvotes: number; user_id?: string | null;
  status: ComplaintStatus; created_at: string; updated_at: string; resolution_notes?: string;
}
