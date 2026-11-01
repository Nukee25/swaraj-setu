import { useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Filter,
  ShieldCheck,
} from "lucide-react";
import { useComplaints } from "../context/ComplaintContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ComplaintStatus } from "../types/complaint";

export function AdminDashboard() {
  const { complaints, updateStatus } = useComplaints();
  const [department, setDepartment] = useState("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const departments = [
    ...new Set(complaints.map((item) => item.primary_department)),
  ];
  const visible = complaints.filter(
    (item) => department === "all" || item.primary_department === department,
  );
  const stats = [
    {
      label: "Open queue",
      value: complaints.filter((item) => item.status !== "Resolved").length,
      icon: ClipboardList,
    },
    {
      label: "In progress",
      value: complaints.filter((item) => item.status === "In Progress").length,
      icon: Clock3,
    },
    {
      label: "Resolved",
      value: complaints.filter((item) => item.status === "Resolved").length,
      icon: CheckCircle2,
    },
  ];
  const advance = async (id: string, current: ComplaintStatus) => {
    const next: Record<ComplaintStatus, ComplaintStatus | null> = {
      Pending: "Assigned",
      Assigned: "In Progress",
      "In Progress": "Resolved",
      Resolved: null,
    };
    if (next[current]) await updateStatus(id, next[current]!, notes[id]);
  };
  return (
    <div className="space-y-7">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-blue-700 dark:text-blue-300">
            Administration
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Resolve community issues
          </h2>
          <p className="mt-2 text-muted-foreground">
            Review your queue, update progress, and close tickets with
            resolution proof.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="shadow-none">
            <CardContent className="flex items-center gap-3 p-5">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="all">All departments</option>
          {departments.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((item) => (
          <Card key={item.id} className="shadow-none">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base leading-6">
                  {item.title}
                </CardTitle>
                <Badge>{item.status}</Badge>
              </div>
              <Badge variant="outline" className="w-fit">
                {item.primary_department}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <textarea
                className="min-h-24 w-full resize-y rounded-md border bg-background p-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                placeholder="Add resolution proof or progress notes"
                value={notes[item.id] || item.resolution_notes || ""}
                onChange={(e) =>
                  setNotes({ ...notes, [item.id]: e.target.value })
                }
              />
              <Button
                className="w-full sm:w-auto"
                disabled={item.status === "Resolved"}
                onClick={() => advance(item.id, item.status)}
              >
                {item.status === "Pending"
                  ? "Assign ticket"
                  : item.status === "Assigned"
                    ? "Start work"
                    : item.status === "In Progress"
                      ? "Mark resolved"
                      : "Resolved"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
