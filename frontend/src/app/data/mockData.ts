import { Complaint } from "../types/complaint";

export const mockComplaints: Complaint[] = [
  {
    id: "1",
    ticketNumber: "SS-2024-001",
    complaintText:
      "There is no water supply in our area for the last 3 days. We are facing severe water shortage in Sector 15.",
    department: "Water Supply",
    processedSummary: "Water supply disruption in Sector 15 for 3 days",
    keywords: ["water supply", "shortage", "sector 15"],
    status: "in-progress",
    priority: "high",
    submittedBy: "Rajesh Kumar",
    submittedAt: new Date("2024-02-21T10:30:00"),
    updatedAt: new Date("2024-02-22T14:20:00"),
    assignedTo: "Water Dept. Team A",
  },
  {
    id: "2",
    ticketNumber: "SS-2024-002",
    complaintText:
      "Street lights are not working on MG Road since last week. It's very dark at night and unsafe for commuters.",
    department: "Electricity",
    processedSummary: "Street lights malfunction on MG Road",
    keywords: ["street lights", "electricity", "mg road", "safety"],
    status: "pending",
    priority: "medium",
    submittedBy: "Priya Sharma",
    submittedAt: new Date("2024-02-22T08:15:00"),
    updatedAt: new Date("2024-02-22T08:15:00"),
  },
  {
    id: "3",
    ticketNumber: "SS-2024-003",
    complaintText:
      "The road near City Hospital has big potholes. Many accidents have happened. Please repair immediately.",
    department: "Roads & Transport",
    processedSummary: "Potholes near City Hospital causing accidents",
    keywords: ["potholes", "road repair", "city hospital", "accidents"],
    status: "resolved",
    priority: "urgent",
    submittedBy: "Amit Patel",
    submittedAt: new Date("2024-02-18T16:45:00"),
    updatedAt: new Date("2024-02-20T11:30:00"),
    assignedTo: "Roads Dept. - Zone 3",
    resolution: "Potholes filled and road repaired on 20th Feb 2024",
  },
  {
    id: "4",
    ticketNumber: "SS-2024-004",
    complaintText:
      "Garbage has not been collected from our locality for 5 days. Bad smell and unhygienic conditions prevailing.",
    department: "Sanitation",
    processedSummary: "Garbage collection delay in locality for 5 days",
    keywords: ["garbage", "sanitation", "hygiene", "collection"],
    status: "in-progress",
    priority: "high",
    submittedBy: "Meera Reddy",
    submittedAt: new Date("2024-02-23T07:00:00"),
    updatedAt: new Date("2024-02-23T09:30:00"),
    assignedTo: "Sanitation Team B",
  },
  {
    id: "5",
    ticketNumber: "SS-2024-005",
    complaintText:
      "Construction work is happening without proper permission next to my house. Lot of noise and dust pollution.",
    department: "Building & Construction",
    processedSummary:
      "Unauthorized construction causing noise and dust pollution",
    keywords: ["construction", "noise pollution", "dust", "unauthorized"],
    status: "pending",
    priority: "medium",
    submittedBy: "Suresh Nair",
    submittedAt: new Date("2024-02-24T11:20:00"),
    updatedAt: new Date("2024-02-24T11:20:00"),
  },
  {
    id: "6",
    ticketNumber: "SS-2024-006",
    complaintText:
      "Government school in our area needs more teachers. My children's classes are not being held regularly.",
    department: "Education",
    processedSummary: "Teacher shortage at government school affecting classes",
    keywords: ["education", "teachers", "school", "shortage"],
    status: "pending",
    priority: "high",
    submittedBy: "Lakshmi Iyer",
    submittedAt: new Date("2024-02-23T14:30:00"),
    updatedAt: new Date("2024-02-23T14:30:00"),
  },
];

export const departmentColors: Record<string, string> = {
  "Water Supply": "bg-blue-100 text-blue-800",
  Electricity: "bg-yellow-100 text-yellow-800",
  "Roads & Transport": "bg-gray-100 text-gray-800",
  Sanitation: "bg-green-100 text-green-800",
  Healthcare: "bg-red-100 text-red-800",
  Education: "bg-purple-100 text-purple-800",
  "Public Safety": "bg-orange-100 text-orange-800",
  "Tax & Revenue": "bg-indigo-100 text-indigo-800",
  "Building & Construction": "bg-amber-100 text-amber-800",
  Environment: "bg-emerald-100 text-emerald-800",
};

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};
