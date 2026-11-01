import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Heart, MapPin } from "lucide-react";
import { useComplaints } from "../context/ComplaintContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, upvote } = useComplaints();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const complaint = complaints.find((item) => item.id === id);
  if (!complaint)
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="font-medium">Complaint not found.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              It may have been removed or is still loading.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  const handleUpvote = async () => {
    setBusy(true);
    setMessage("");
    try {
      const added = await upvote(complaint.id);
      setMessage(
        added ? "Upvote recorded." : "You have already upvoted this complaint.",
      );
    } catch {
      setMessage("Unable to record the upvote. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/complaints">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to feed
        </Link>
      </Button>
      <Card className="shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {complaint.ticket_number}
              </p>
              <CardTitle className="mt-2 text-2xl">{complaint.title}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge>{complaint.status}</Badge>
              <Badge variant="outline">{complaint.urgency_level}</Badge>
            </div>
          </div>
          <p className="max-w-3xl leading-7 text-muted-foreground">
            {complaint.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{complaint.primary_department}</Badge>
            {complaint.secondary_departments?.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
          {complaint.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {complaint.location.coordinates[1].toFixed(4)},{" "}
              {complaint.location.coordinates[0].toFixed(4)}
            </div>
          )}
          {complaint.media?.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {complaint.media.map((src) => (
                <img
                  key={src}
                  src={src}
                  className="aspect-square rounded-xl object-cover"
                />
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              {new Date(complaint.created_at).toLocaleString("en-IN")}
            </span>
            <Button variant="outline" disabled={busy} onClick={handleUpvote}>
              <Heart className="mr-2 h-4 w-4" />
              {busy ? "Saving…" : `${complaint.upvotes} upvotes`}
            </Button>
          </div>
          {message && (
            <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              {message}
            </p>
          )}
          {complaint.resolution_notes && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
              <p className="font-medium text-green-900 dark:text-green-200">
                Resolution proof
              </p>
              <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                {complaint.resolution_notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
