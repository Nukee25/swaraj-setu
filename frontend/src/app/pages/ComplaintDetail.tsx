import { useParams, Link, useNavigate } from "react-router";
import { useComplaints } from "../context/ComplaintContext";
import { departmentColors, statusColors, priorityColors } from "../data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, Calendar, User, Building2, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints } = useComplaints();
  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Complaint Not Found</AlertTitle>
          <AlertDescription>
            The complaint you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const timeline = [
    {
      title: "Complaint Submitted",
      description: `Submitted by ${complaint.submittedBy}`,
      date: complaint.submittedAt,
    },
    ...(complaint.assignedTo
      ? [
          {
            title: "Assigned to Department",
            description: `Assigned to ${complaint.assignedTo}`,
            date: complaint.updatedAt,
          },
        ]
      : []),
    ...(complaint.status === "resolved" && complaint.resolution
      ? [
          {
            title: "Complaint Resolved",
            description: complaint.resolution,
            date: complaint.updatedAt,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <span className="text-sm text-slate-500">Back to Dashboard</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Complaint Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{complaint.ticketNumber}</CardTitle>
                  <CardDescription className="mt-2">
                    Submitted on{" "}
                    {new Date(complaint.submittedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusColors[complaint.status]}>{complaint.status}</Badge>
                  <Badge className={priorityColors[complaint.priority]}>
                    {complaint.priority} priority
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm text-slate-600 mb-2">Original Complaint</h3>
                <p className="text-slate-900 leading-relaxed p-4 bg-slate-50 rounded-lg">
                  {complaint.complaintText}
                </p>
              </div>

              <Separator />

              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <h3 className="text-orange-900">NLP Analysis Results</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-orange-800 mb-2">Identified Department</h4>
                    <Badge className={departmentColors[complaint.department]}>
                      {complaint.department}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm text-orange-800 mb-2">Processed Summary</h4>
                    <p className="text-sm text-orange-900">{complaint.processedSummary}</p>
                  </div>

                  <div>
                    <h4 className="text-sm text-orange-800 mb-2">Extracted Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {complaint.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="border-orange-300 text-orange-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {complaint.resolution && (
                <>
                  <Separator />
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900">Resolution</AlertTitle>
                    <AlertDescription className="text-green-800">
                      {complaint.resolution}
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Track the progress of this complaint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mt-1" />
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 my-1 min-h-12" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <h4 className="text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(item.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complaint Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Submitted By</p>
                  <p className="text-slate-900">{complaint.submittedBy}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Department</p>
                  <Badge className={departmentColors[complaint.department]}>
                    {complaint.department}
                  </Badge>
                </div>
              </div>

              {complaint.assignedTo && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">Assigned To</p>
                      <p className="text-slate-900">{complaint.assignedTo}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Last Updated</p>
                  <p className="text-slate-900">
                    {new Date(complaint.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Priority Level</p>
                  <Badge className={priorityColors[complaint.priority]}>{complaint.priority}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" asChild>
            <Link to="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
