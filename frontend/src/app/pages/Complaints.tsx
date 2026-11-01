import { useState } from "react";
import { Link } from "react-router";
import { Heart, Search, SlidersHorizontal } from "lucide-react";
import { useComplaints } from "../context/ComplaintContext";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ComplaintStatus } from "../types/complaint";

const statuses: ComplaintStatus[] = [
  "Pending",
  "Assigned",
  "In Progress",
  "Resolved",
];
export function Complaints() {
  const { complaints, upvote } = useComplaints();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const visible = complaints.filter(
    (item) =>
      `${item.title} ${item.description} ${item.primary_department}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "all" || item.status === status),
  );
  const handleUpvote = async (id: string) => {
    setBusyId(id);
    setMessage("");
    try {
      const added = await upvote(id);
      setMessage(
        added ? "Upvote recorded." : "You have already upvoted this complaint.",
      );
    } catch {
      setMessage("Unable to record the upvote. Please try again.");
    } finally {
      setBusyId(null);
    }
  };
  return (
    <div className="space-y-7">
      <div>
        <p className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          Community feed
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Explore local complaints
        </h2>
        <p className="mt-2 text-muted-foreground">
          Support existing reports so departments can focus on the issues
          affecting the most people.
        </p>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title, department, or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            className="h-9 w-full rounded-md border bg-background px-3 text-sm sm:w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>
      {message && (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          {message}
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((item) => (
          <Card
            key={item.id}
            className="shadow-none transition-shadow hover:shadow-md"
          >
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.ticket_number}
                  </p>
                  <Link
                    to={`/complaints/${item.id}`}
                    className="mt-1 block truncate text-lg font-semibold hover:text-blue-700"
                  >
                    {item.title}
                  </Link>
                </div>
                <Badge>{item.status}</Badge>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{item.primary_department}</Badge>
                <Badge variant="outline">{item.urgency_level}</Badge>
              </div>
              {item.media?.length > 0 && (
                <div className="flex gap-2 overflow-hidden">
                  {item.media.slice(0, 3).map((src) => (
                    <img
                      key={src}
                      src={src}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
                <span>
                  {item.upvotes} upvotes ·{" "}
                  {new Date(item.created_at).toLocaleDateString("en-IN")}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyId === item.id}
                  onClick={() => handleUpvote(item.id)}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {busyId === item.id ? "Saving…" : "Upvote"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {visible.length === 0 && (
        <Card className="shadow-none">
          <CardContent className="py-16 text-center">
            <p className="font-medium">No complaints match your filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or status.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
