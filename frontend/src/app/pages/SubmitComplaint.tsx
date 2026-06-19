import { useEffect,useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Department } from "../types/complaint";
import { useComplaints } from "../context/ComplaintContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const API_KEY=import.meta.env.VITE_OPENAI_API_KEY;

  useEffect(() => {
    api
     .get("/complaints",{headers: { "x-api-key": API_KEY,
       },
      })
     .then((data) => setComplaints(Array.isArray(data) ? data : []));
     .catch((error) => {
       console.error("Error fetching complaints:", error); 
       setComplaints([]);
    });
  }, [API_KEY]);

const DEPARTMENTS: Department[] = [
  "Water Supply", "Electricity", "Roads & Transport", "Sanitation",
  "Healthcare", "Education", "Public Safety", "Tax & Revenue",
  "Building & Construction", "Environment",
];

function guessDepartment(text: string): Department {
  const lower = text.toLowerCase();
  if (lower.includes("water") || lower.includes("tap")) return "Water Supply";
  if (lower.includes("electric") || lower.includes("light") || lower.includes("power")) return "Electricity";
  if (lower.includes("road") || lower.includes("pothole") || lower.includes("traffic")) return "Roads & Transport";
  if (lower.includes("garbage") || lower.includes("sanit") || lower.includes("waste") || lower.includes("drain")) return "Sanitation";
  if (lower.includes("hospital") || lower.includes("health") || lower.includes("doctor")) return "Healthcare";
  if (lower.includes("school") || lower.includes("teacher") || lower.includes("educat")) return "Education";
  if (lower.includes("police") || lower.includes("crime") || lower.includes("theft") || lower.includes("unsafe")) return "Public Safety";
  if (lower.includes("tax") || lower.includes("revenue") || lower.includes("property")) return "Tax & Revenue";
  if (lower.includes("construct") || lower.includes("build") || lower.includes("encroach")) return "Building & Construction";
  if (lower.includes("pollut") || lower.includes("noise") || lower.includes("environment") || lower.includes("dust")) return "Environment";
  return "Sanitation";
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(["the", "is", "in", "and", "of", "our", "for", "has", "not", "are", "very", "have", "it", "on", "a", "an", "to", "my", "we", "no"]);
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 5);
}

export function SubmitComplaint() {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [nlpResult, setNlpResult] = useState<{
    department: Department;
    summary: string;
    keywords: string[];
    ticketNumber: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() || !title.trim()) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const department = guessDepartment(complaintText);
    const keywords = extractKeywords(complaintText);
    const summary = title.length > 60 ? title.slice(0, 60) + "…" : title;

    const newComplaint = addComplaint({
      complaintText,
      department,
      processedSummary: summary,
      keywords,
      status: "pending",
      priority: "medium",
      submittedBy: user?.name ?? "Anonymous",
      submittedAt: new Date(),
    });

    setNlpResult({
      department,
      summary,
      keywords,
      ticketNumber: newComplaint.ticketNumber,
    });
    setIsProcessing(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setTitle("");
    setComplaintText("");
    setSubmitted(false);
    setNlpResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-3xl tracking-tight text-slate-900">Raise a Complaint</h2>
          <p className="text-slate-600 mt-1">
            Describe your issue and our NLP system will categorize it automatically
          </p>
        </div>
      </div>

      {submitted && nlpResult ? (
        <div className="space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Complaint Submitted Successfully!</AlertTitle>
            <AlertDescription className="text-green-800">
              Your complaint has been registered and assigned to the relevant department.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Complaint Registered</CardTitle>
              <CardDescription>NLP Processing Results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-600">Ticket Number</Label>
                  <p className="text-lg mt-1">{nlpResult.ticketNumber}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Status</Label>
                  <div className="mt-1">
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-slate-600">Title</Label>
                <p className="text-slate-900 mt-1">{title}</p>
              </div>

              <div>
                <Label className="text-slate-600">Description</Label>
                <p className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-900 text-sm">
                  {complaintText}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-900">NLP Analysis</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-orange-800">Assigned Department</Label>
                    <div className="mt-1">
                      <Badge className="bg-blue-700 text-white">{nlpResult.department}</Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-orange-800">Processed Summary</Label>
                    <p className="text-sm text-orange-900 mt-1">{nlpResult.summary}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-orange-800">Extracted Keywords</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {nlpResult.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="border-orange-300 text-orange-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button onClick={handleReset} className="bg-blue-700 hover:bg-blue-800">
                  Submit Another
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/complaints")}>
                  View All Complaints
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Complaint Form</CardTitle>
            <CardDescription>
              Our AI will analyze your text and route it to the correct department automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Short title for your complaint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint">Description</Label>
                <Textarea
                  id="complaint"
                  placeholder="Describe your complaint in detail. E.g. 'There is no water supply in our area for the last 3 days in Sector 15...'"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  rows={7}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-slate-500">
                  Be as specific as possible — the NLP system will extract the department, keywords, and summary.
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>How it works</AlertTitle>
                <AlertDescription>
                  Once you submit, our NLP system will:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Analyze your complaint text</li>
                    <li>Identify the relevant department</li>
                    <li>Extract key information and keywords</li>
                    <li>Generate a ticket number for tracking</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800"
                disabled={isProcessing || !complaintText.trim() || !title.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing with NLP…
                  </>
                ) : (
                  "Submit Complaint"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
