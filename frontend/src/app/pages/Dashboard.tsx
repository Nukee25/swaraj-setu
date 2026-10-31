import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useComplaints } from "../context/ComplaintContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AdminDashboard } from "./AdminDashboard";
export function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  const { complaints } = useComplaints();
  const stats = ["Pending", "In Progress", "Resolved"].map((status) => ({ status, count: complaints.filter((item) => item.status === status).length }));
  return <div className="space-y-7"><div className="flex items-center justify-between"><div><h2 className="text-3xl">Citizen Dashboard</h2><p className="text-slate-600 mt-1">Report issues and follow their resolution.</p></div><Button asChild><Link to="/complaints/new"><Plus className="w-4 h-4 mr-2" />Raise complaint</Link></Button></div><div className="grid gap-4 md:grid-cols-3">{stats.map((item) => <Card key={item.status}><CardHeader><CardTitle className="text-sm">{item.status}</CardTitle></CardHeader><CardContent><span className="text-3xl">{item.count}</span></CardContent></Card>)}</div><Card><CardHeader><CardTitle>Latest public complaints</CardTitle></CardHeader><CardContent className="space-y-3">{complaints.slice(0, 5).map((item) => <Link key={item.id} to={`/complaints/${item.id}`} className="flex justify-between border-b pb-3 last:border-0"><span>{item.title}</span><Badge variant="outline">{item.status}</Badge></Link>)}</CardContent></Card></div>;
}
