import { useState } from "react";
import { useComplaints } from "../context/ComplaintContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ComplaintStatus } from "../types/complaint";
export function AdminDashboard() {
  const { complaints, updateStatus } = useComplaints(); const [department, setDepartment] = useState("all"); const [notes, setNotes] = useState<Record<string, string>>({});
  const departments = [...new Set(complaints.map((item) => item.primary_department))]; const visible = complaints.filter((item) => department === "all" || item.primary_department === department);
  const advance = async (id: string, current: ComplaintStatus) => { const next: Record<ComplaintStatus, ComplaintStatus | null> = { Pending: "In Progress", "In Progress": "Resolved", Resolved: null }; if (next[current]) await updateStatus(id, next[current]!, notes[id]); };
  return <div className="space-y-6"><div><h2 className="text-3xl">Admin Dashboard</h2><p className="text-slate-600">Manage municipal queues and resolution proof.</p></div><select className="rounded-md border px-3 py-2" value={department} onChange={(e) => setDepartment(e.target.value)}><option value="all">All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select><div className="grid gap-4 lg:grid-cols-2">{visible.map((item) => <Card key={item.id}><CardHeader><div className="flex justify-between gap-3"><CardTitle className="text-base">{item.title}</CardTitle><Badge>{item.status}</Badge></div></CardHeader><CardContent className="space-y-3"><p className="text-sm text-slate-600">{item.description}</p><Badge variant="outline">{item.primary_department}</Badge><textarea className="w-full rounded-md border p-2 text-sm" placeholder="Resolution proof / notes" value={notes[item.id] || item.resolution_notes || ""} onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })} /><Button disabled={item.status === "Resolved"} onClick={() => advance(item.id, item.status)}>{item.status === "Pending" ? "Start work" : "Mark resolved"}</Button></CardContent></Card>)}</div></div>;
}
