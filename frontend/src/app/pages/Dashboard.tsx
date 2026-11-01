import { Link } from "react-router";
import { ArrowRight, Clock3, FileText, Plus, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useComplaints } from "../context/ComplaintContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AdminDashboard } from "./AdminDashboard";

export function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  const { complaints } = useComplaints();
  const stats = [
    { status: "Pending", label: "Awaiting review", icon: Clock3 },
    { status: "In Progress", label: "Being addressed", icon: FileText },
    { status: "Resolved", label: "Closed with proof", icon: CheckCircle2 },
  ].map((item) => ({
    ...item,
    count: complaints.filter((complaint) => complaint.status === item.status)
      .length,
  }));

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div className="max-w-xl">
          <p className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-300">
            Citizen dashboard
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Make your neighbourhood better.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Report a civic issue, follow progress, and help your community
            prioritise what matters.
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link to="/complaints/new">
            <Plus className="mr-2 h-4 w-4" />
            Raise a complaint
          </Link>
        </Button>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ status, label, count, icon: Icon }) => (
          <Card key={status} className="shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-muted p-3 text-muted-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{count}</p>
                <p className="text-sm font-medium">{status}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      <Card className="shadow-none">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Latest community reports</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              See what residents are reporting nearby.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/complaints">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          {complaints.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              to={`/complaints/${item.id}`}
              className="flex items-center justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted"
            >
              <span className="min-w-0 truncate text-sm font-medium">
                {item.title}
              </span>
              <Badge variant="outline" className="shrink-0">
                {item.status}
              </Badge>
            </Link>
          ))}
          {complaints.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No complaints are available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
