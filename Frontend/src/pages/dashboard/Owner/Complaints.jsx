import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Search, Loader2, CheckCircle2, Clock, XCircle, MessageSquare } from "lucide-react";
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

export default function OwnerComplaints() {
  const [status, setStatus] = useState("all");
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const navigate = useNavigate();
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

  const handleMessage = (complaint) => {
    // Navigate to messages page with complaint context
    navigate(`/dashboard/owner/messages?complaintId=${complaint.complaintId}&studentId=${complaint.complainant?._id}`);
  };

  return (
    <DashboardLayout title="Complaints">
      <div className="space-y-5">
        <h1 className="text-xl font-bold">Complaints</h1>

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
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium font-mono">
                            #{c.complaintId}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                            {c.category?.replace("_", " ") || "General"}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${sc.color}`}>
                            <StatusIcon className="h-3 w-3" /> {sc.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm">{c.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          By: {c.complainant?.fullName || "Student"} • {c.property?.title || "General"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                      {c.ownerReply && <span className="text-primary flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Replied</span>}
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

                      {/* Message button */}
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleMessage(c)}
                          className="w-full"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Student
                        </Button>
                      </div>

                      {c.resolution && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-1">Resolution</h4>
                          <p className="text-sm bg-muted/50 p-2 rounded-lg">{c.resolution}</p>
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
            <p className="text-sm mt-1">Complaints will appear here when students file them</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}