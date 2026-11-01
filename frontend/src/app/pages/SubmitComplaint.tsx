import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, LocateFixed, MapPin, Sparkles, Upload } from "lucide-react";
import { api } from "../utils/api";
import { useComplaints } from "../context/ComplaintContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Department } from "../types/complaint";

export function SubmitComplaint() {
  const navigate = useNavigate();
  const { refresh } = useComplaints();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [smart, setSmart] = useState(true);
  const [manualDepartment, setManualDepartment] =
    useState<Department>("Sanitation");
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.209 });
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [media, setMedia] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!smart || description.length < 10) {
      setPreview(null);
      return;
    }
    const timer = window.setTimeout(
      () =>
        api
          .post("/complaints/smart-preview/", { text: description })
          .then(({ data }) => setPreview(data))
          .catch(() => setPreview(null)),
      500,
    );
    return () => window.clearTimeout(timer);
  }, [description, smart]);
  const locate = () =>
    navigator.geolocation?.getCurrentPosition(({ coords }) =>
      setLocation({ lat: coords.latitude, lng: coords.longitude }),
    );
  const files = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []).slice(0, 4);
    Promise.all(
      selected.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then(setMedia)
      .catch(() => setMessage("Unable to read one of the selected files."));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api.post("/complaints/", {
        title,
        description,
        location,
        media,
        classification: smart
          ? preview
          : {
              primary_department: manualDepartment,
              secondary_departments: [],
              urgency_level: "MEDIUM",
              confidence_score: 1,
            },
      });
      await refresh();
      setMessage("Complaint submitted successfully.");
      setTitle("");
      setDescription("");
      setPreview(null);
    } catch {
      setMessage("Could not submit the complaint.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </Button>
      <div>
        <p className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          New report
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Tell us what happened
        </h2>
        <p className="mt-2 text-muted-foreground">
          Share enough detail for the right department to act quickly.
        </p>
      </div>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Complaint details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  Smart AI routing
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Suggests a department and urgency from your description.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSmart(!smart)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${smart ? "bg-blue-700 text-white" : "border bg-background"}`}
              >
                {smart ? "Enabled" : "Manual mode"}
              </button>
            </div>
            <div>
              <Label>Short title</Label>
              <Input
                className="mt-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Streetlight not working near the park"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-2"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the location, impact, and what needs attention…"
                required
              />
            </div>
            {!smart && (
              <div>
                <Label>Department</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={manualDepartment}
                  onChange={(e) =>
                    setManualDepartment(e.target.value as Department)
                  }
                >
                  {[
                    "Water Supply",
                    "Electricity",
                    "Roads & Transport",
                    "Sanitation",
                    "Healthcare",
                    "Education",
                    "Public Safety",
                    "Tax & Revenue",
                    "Building & Construction",
                    "Environment",
                  ].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            )}
            {preview && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
                <p className="font-medium">AI suggestion</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{String(preview.primary_department)}</Badge>
                  <Badge variant="outline">
                    {String(preview.urgency_level)}
                  </Badge>
                  <Badge variant="outline">
                    {Math.round(Number(preview.confidence_score) * 100)}%
                    confidence
                  </Badge>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              </div>
              <Button type="button" variant="outline" onClick={locate}>
                <LocateFixed className="mr-2 h-4 w-4" />
                Use my location
              </Button>
            </div>
            <label className="block cursor-pointer rounded-xl border border-dashed p-5 transition-colors hover:bg-muted/50">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Upload className="h-4 w-4" />
                Attach photos or videos
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Up to four files, 25 MB each
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={files}
              />
              {media.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {media.map((src) => (
                    <img
                      key={src}
                      src={src}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </label>
            {message && (
              <p className="rounded-lg bg-muted px-4 py-3 text-sm">{message}</p>
            )}
            <Button
              type="submit"
              disabled={busy || !title || description.length < 10}
              size="lg"
              className="w-full"
            >
              {busy ? "Submitting…" : "Submit complaint"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
