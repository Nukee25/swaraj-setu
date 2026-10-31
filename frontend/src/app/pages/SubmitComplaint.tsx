import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, LocateFixed, MapPin, Sparkles, Upload } from "lucide-react";
import { api } from "../utils/api";
import { useComplaints } from "../context/ComplaintContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
export function SubmitComplaint() {
  const navigate = useNavigate(); const { refresh } = useComplaints(); const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [smart, setSmart] = useState(true); const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 }); const [preview, setPreview] = useState<Record<string, unknown> | null>(null); const [media, setMedia] = useState<string[]>([]); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => { if (!smart || description.length < 10) { setPreview(null); return; } const timer = window.setTimeout(() => api.post("/complaints/smart-preview/", { text: description }).then(({ data }) => setPreview(data)).catch(() => setPreview(null)), 500); return () => window.clearTimeout(timer); }, [description, smart]);
  const locate = () => navigator.geolocation?.getCurrentPosition(({ coords }) => setLocation({ lat: coords.latitude, lng: coords.longitude }));
  const files = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []).slice(0, 4);
    Promise.all(selected.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then(setMedia).catch(() => setMessage("Unable to read one of the selected files."));
  };
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setMessage(""); try { await api.post("/complaints/", { title, description, location, media, classification: smart ? preview : undefined }); await refresh(); setMessage("Complaint submitted successfully."); setTitle(""); setDescription(""); setPreview(null); } catch { setMessage("Could not submit the complaint."); } finally { setBusy(false); } };
  return <div className="max-w-3xl mx-auto space-y-5"><Button variant="ghost" onClick={() => navigate("/dashboard")}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button><Card><CardHeader><CardTitle>Raise a Complaint</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="flex items-center justify-between rounded-lg bg-slate-100 p-3"><span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-500" />Smart AI Mode</span><button type="button" onClick={() => setSmart(!smart)} className={`rounded-full px-3 py-1 text-xs ${smart ? "bg-blue-700 text-white" : "bg-white"}`}>{smart ? "On" : "Manual"}</button></div><div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div><div><Label>Description</Label><Textarea rows={7} value={description} onChange={(e) => setDescription(e.target.value)} required /></div>{preview && <div className="rounded-lg border border-orange-200 bg-orange-50 p-4"><p className="font-medium flex items-center gap-2"><Sparkles className="w-4 h-4" />AI prediction</p><div className="flex flex-wrap gap-2 mt-3"><Badge>{String(preview.primary_department)}</Badge><Badge variant="outline">{String(preview.urgency_level)}</Badge><Badge variant="outline">{Math.round(Number(preview.confidence_score) * 100)}% confidence</Badge></div></div>}<div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={locate}><LocateFixed className="w-4 h-4 mr-2" />Use my location</Button><span className="text-sm text-slate-600 flex items-center gap-1"><MapPin className="w-4 h-4" />{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span></div><label className="block rounded-lg border border-dashed p-4 cursor-pointer"><span className="flex items-center gap-2 text-sm"><Upload className="w-4 h-4" />Attach photos/videos (up to 25MB)</span><input type="file" accept="image/*,video/*" multiple className="hidden" onChange={files} />{media.length > 0 && <div className="flex gap-2 mt-3">{media.map((src) => <img key={src} src={src} className="w-16 h-16 object-cover rounded" />)}</div>}</label>{message && <p className="text-sm text-blue-700">{message}</p>}<Button type="submit" disabled={busy || !title || description.length < 10} className="w-full">{busy ? "Submitting…" : "Submit complaint"}</Button></form></CardContent></Card></div>;
}
