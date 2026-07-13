import { useState, useEffect } from "react";
import { AlertTriangle, Search, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import DashboardLayout from "../../../components/DashboardLayout";
import { complaintApi } from "../../../lib/api";
import { useToast } from "../../../hooks/use-toast";

const STATUS_TABS = ["all", "open", "in_progress", "resolved", "closed"];

const statusConfig = {
  open: { label: "Open", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700", icon: XCircle },
};

export default function AdminComplaints() {
  const [status, setStatus] = useState("all");
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolution, setResolution] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, [status]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const params = status !== "all" ? { status } : {};
      const data = await complaintApi.getAll(params);
      setComplaints(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load complaints",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await complaintApi.updateStatus(complaintId, { 
        status: newStatus,
        resolution: resolution || undefined
      });
      toast({
        title: "Success",
        description: `Complaint marked as ${newStatus.replace("_", " ")}`,
      });
      setResolution("");
      fetchComplaints();
      setSelectedComplaint(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update complaint",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="All Complaints">
      <div className="space-y-5">
        <h1 className="text-xl font-bold">All Complaints</h1>

        {/* Status filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                status === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : complaints.length > 0 ? (
          <div className="space-y-3">
            {complaints.map((c) => {
              const sc = statusConfig[c.status] ?? { label: c.status, color: "bg-muted text-muted-foreground", icon: Clock };
              const StatusIcon = sc.icon;
              const isSelected = selectedComplaint?._id === c._id;
              
              return (
                <div
                  key={c._id}
                  className="dashboard-card dashboard-card-hover"
                >
                  <div
                    onClick={() => setSelectedComplaint(isSelected ? null : c)}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                            {c.category?.replace("_", " ") || "General"}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${sc.color}`}>
                            <StatusIcon className="h-3 w-3" /> {sc.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm">{c.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          By: {c.complainant?.fullName || "User"} • {c.property?.title || "General"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                      {c.ownerReply && <span className="text-primary">Owner replied</span>}
                    </div>
                  </div>

                  {/* Expanded view */}
                  {isSelected && (
                    <div className="px-4 pb-4 pt-0 border-t border-border space-y-3">
                      <div className="pt-3">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Description</h4>
                        <p className="text-sm">{c.description}</p>
                      </div>

                      {c.images && c.images.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Images</h4>
                          <div className="flex gap-2 flex-wrap">
                            {c.images.map((img, idx) => (
                              <img key={idx} src={img} alt={`Complaint ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border border-border" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolution input */}
                      <div>
                        <Label htmlFor={`resolution-${c._id}`}>Resolution (optional)</Label>
                        <Textarea
                          id={`resolution-${c._id}`}
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="Add resolution details..."
                          rows={2}
                          className="mt-1.5"
                        />
                      </div>

                      {/* Status update buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {c.status === "open" && (
                          <Button size="sm" onClick={() => handleUpdateStatus(c._id, "in_progress")} className="text-xs">
                            Mark In Progress
                          </Button>
                        )}
                        {(c.status === "open" || c.status === "in_progress") && (
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(c._id, "resolved")} className="text-xs">
                            Mark Resolved
                          </Button>
                        )}
                        {(c.status === "resolved" || c.status === "in_progress") && (
                          <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(c._id, "closed")} className="text-xs">
                            Close
                          </Button>
                        )}
                      </div>

                      {c.resolution && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-1">Resolution</h4>
                          <p className="text-sm bg-muted/50 p-2 rounded-lg">{c.resolution}</p>
                        </div>
                      )}

                      {c.ownerReply && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-1">Owner Reply</h4>
                          <p className="text-sm bg-primary/5 p-2 rounded-lg border border-primary/10">{c.ownerReply}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No complaints found</p>
            <p className="text-sm mt-1">Complaints will appear here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}