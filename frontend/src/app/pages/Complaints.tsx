import { useState } from "react";
import { departmentColors, statusColors, priorityColors } from "../data/mockData";
import { useComplaints } from "../context/ComplaintContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, Filter } from "lucide-react";
import { Link } from "react-router";
import { Department, ComplaintStatus } from "../types/complaint";
import { api } from "../utils/api";

export function Complaints() {
  const { complaints } = useComplaints();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.complaintText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      filterDepartment === "all" || complaint.department === filterDepartment;
    
    const matchesStatus = 
      filterStatus === "all" || complaint.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments: Department[] = [
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
  ];

  const statuses: ComplaintStatus[] = ["pending", "in-progress", "resolved", "rejected"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl tracking-tight text-slate-900">All Complaints</h2>
        <p className="text-slate-600 mt-1">Browse and search through all submitted complaints</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Search
          </CardTitle>
          <CardDescription>Narrow down complaints by department, status, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </p>
        </div>

        {filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">No complaints found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredComplaints.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/complaints/${complaint.id}`}
                className="block"
              >
                <Card className="hover:border-blue-400 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-sm text-slate-900">{complaint.ticketNumber}</span>
                          <Badge className={statusColors[complaint.status]}>
                            {complaint.status}
                          </Badge>
                          <Badge className={priorityColors[complaint.priority]}>
                            {complaint.priority}
                          </Badge>
                        </div>

                        <p className="text-slate-900 line-clamp-2">
                          {complaint.complaintText}
                        </p>

                        <div className="flex items-center flex-wrap gap-3 text-sm text-slate-600">
                          <div>
                            <span className="font-medium">Submitted by:</span> {complaint.submittedBy}
                          </div>
                          <span>•</span>
                          <div>
                            {new Date(complaint.submittedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          {complaint.assignedTo && (
                            <>
                              <span>•</span>
                              <div>
                                <span className="font-medium">Assigned to:</span> {complaint.assignedTo}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={departmentColors[complaint.department]}>
                            {complaint.department}
                          </Badge>
                          {complaint.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}