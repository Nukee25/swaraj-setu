import { useState } from "react";
import { Link } from "react-router";
import { Heart, Search } from "lucide-react";
import { useComplaints } from "../context/ComplaintContext";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ComplaintStatus } from "../types/complaint";

const statuses: ComplaintStatus[] = ["Pending", "In Progress", "Resolved"];
export function Complaints() {
  const { complaints, upvote } = useComplaints();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const visible = complaints.filter((item) =>
    `${item.title} ${item.description} ${item.primary_department}`.toLowerCase().includes(query.toLowerCase()) &&
    (status === "all" || item.status === status),
  );
  return <div className="space-y-6"><div><h2 className="text-3xl text-slate-900">Complaint Feed</h2><p className="text-slate-600 mt-1">Transparent, community-powered civic issue tracking.</p></div>
    <div className="flex flex-wrap gap-3"><div className="relative flex-1 min-w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input className="pl-9" placeholder="Search complaints" value={query} onChange={(e) => setQuery(e.target.value)} /></div><select className="rounded-md border px-3" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="grid gap-4 md:grid-cols-2">{visible.map((item) => <Card key={item.id}><CardContent className="p-5 space-y-3"><div className="flex justify-between gap-3"><div><p className="text-xs text-slate-500">{item.ticket_number}</p><Link to={`/complaints/${item.id}`} className="font-semibold hover:text-blue-700">{item.title}</Link></div><Badge>{item.status}</Badge></div><p className="text-sm text-slate-600 line-clamp-3">{item.description}</p><div className="flex flex-wrap gap-2"><Badge variant="outline">{item.primary_department}</Badge><Badge variant="outline">{item.urgency_level}</Badge></div>{item.media?.length > 0 && <div className="flex gap-2 overflow-hidden">{item.media.map((src) => <img key={src} src={src} className="h-20 w-20 rounded object-cover" />)}</div>}<div className="flex items-center justify-between text-xs text-slate-500"><span>{new Date(item.created_at).toLocaleDateString("en-IN")} · {item.upvotes} upvotes</span><Button variant="ghost" size="sm" onClick={() => upvote(item.id)}><Heart className="w-4 h-4 mr-1" />Upvote</Button></div></CardContent></Card>)}</div>
  </div>;
}
