import { useState } from "react";
import { useComplaints } from "../context/ComplaintContext";
import { useAuth } from "../context/AuthContext";
import { statusColors, departmentColors } from "../data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Plus } from "lucide-react";
import { Link } from "react-router";
import { ComplaintStatus } from "../types/complaint";

export function Dashboard() {
  const { complaints, updateStatus } = useComplaints();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Track pending status changes per card before committing
  const [pendingStatus, setPendingStatus] = useState<Record<string, ComplaintStatus>>({});

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const departmentStats = complaints.reduce((acc, complaint) => {
    acc[complaint.department] = (acc[complaint.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentComplaints = [...complaints]
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .slice(0, 6);

  const handleUpdateStatus = (id: string) => {
    const status = pendingStatus[id];
    if (status) {
      updateStatus(id, status);
      setPendingStatus((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-1">Overview of all complaints and their current status</p>
        </div>
        {/* Public users see a prominent CTA */}
        {!isAdmin && (
          <Button asChild className="bg-blue-700 hover:bg-blue-800 gap-2 shrink-0">
            <Link to="/complaints/new">
              <Plus className="w-4 h-4" />
              Raise a Complaint
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Complaints</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
            <p className="text-xs text-slate-600 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.pending}</div>
            <p className="text-xs text-slate-600 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.inProgress}</div>
            <p className="text-xs text-slate-600 mt-1">Being addressed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Resolved</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.resolved}</div>
            <p className="text-xs text-slate-600 mt-1">Successfully closed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaint Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>
                {isAdmin ? "Manage complaint statuses below" : "Latest submissions from citizens"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentComplaints.map((complaint) => {
                  const currentStatus = pendingStatus[complaint.id] ?? complaint.status;
                  return (
                    <div
                      key={complaint.id}
                      className="p-4 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className="text-xs text-slate-500">{complaint.ticketNumber}</span>
                            {/* Status badge — read-only for public */}
                            {!isAdmin && (
                              <Badge className={statusColors[complaint.status]}>
                                {complaint.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-900 line-clamp-2">
                            {complaint.complaintText}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className={departmentColors[complaint.department]}>
                              {complaint.department}
                            </Badge>
                            <span className="text-xs text-slate-400">by {complaint.submittedBy}</span>
                          </div>
                        </div>

                        {/* Public: link to detail; Admin: status editor */}
                        {isAdmin ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <Select
                              value={currentStatus}
                              onValueChange={(val) =>
                                setPendingStatus((prev) => ({
                                  ...prev,
                                  [complaint.id]: val as ComplaintStatus,
                                }))
                              }
                            >
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-blue-700 hover:bg-blue-800"
                              disabled={!pendingStatus[complaint.id]}
                              onClick={() => handleUpdateStatus(complaint.id)}
                            >
                              Update
                            </Button>
                          </div>
                        ) : (
                          <Link
                            to={`/complaints/${complaint.id}`}
                            className="text-xs text-blue-600 hover:underline shrink-0"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/complaints">View All Complaints</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>By Department</CardTitle>
            <CardDescription>Distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(departmentStats)
                .sort((a, b) => b[1] - a[1])
                .map(([department, count]) => (
                  <div key={department} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700 truncate flex-1 mr-2">{department}</span>
                      <span className="text-xs text-slate-900 shrink-0">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
