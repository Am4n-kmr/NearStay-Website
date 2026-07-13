import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Search, Plus, Loader2, Image as ImageIcon, X, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Textarea } from "../../../components/ui/textarea";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import DashboardLayout from "../../../components/DashboardLayout";
import { complaintApi } from "../../../lib/api";
import { useToast } from "../../../hooks/use-toast";

const CATEGORIES = [
  { value: "electricity", label: "Electricity" },
  { value: "water", label: "Water" },
  { value: "wifi", label: "WiFi" },
  { value: "cleaning", label: "Cleaning" },
  { value: "food", label: "Food" },
  { value: "security", label: "Security" },
  { value: "furniture", label: "Furniture" },
  { value: "maintenance", label: "Maintenance" },
  { value: "others", label: "Others" },
];

const STATUS_TABS = ["all", "open", "in_progress", "resolved", "closed"];

const statusConfig = {
  open: { label: "Open", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700", icon: XCircle },
};

export default function StudentComplaints() {
  const [status, setStatus] = useState("all");
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: "electricity",
    title: "",
    description: "",
    propertyId: "",
    images: [],
  });

  useEffect(() => {
    fetchComplaints();
  }, [status]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const params = status !== "all" ? { status } : {};
      const data = await complaintApi.getMyComplaints(params);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await complaintApi.create(formData);
      toast({
        title: "Success",
        description: "Complaint filed successfully",
      });
      setShowForm(false);
      setFormData({ category: "electricity", title: "", description: "", propertyId: "", images: [] });
      fetchComplaints();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to file complaint",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="My Complaints">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">My Complaints</h1>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Complaint
          </Button>
        </div>

        {/* New Complaint Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-sm">File New Complaint</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title for your complaint"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your complaint in detail"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Submit Complaint</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

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
              return (
                <div
                  key={c._id}
                  onClick={() => setSelectedComplaint(selectedComplaint?._id === c._id ? null : c)}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer"
                >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium font-mono">
                              #{c.complaintId}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                              {c.category.replace("_", " ")}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${sc.color}`}>
                              <StatusIcon className="h-3 w-3" /> {sc.label}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm">{c.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                        </div>
                      </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                    {c.ownerReply && <span className="text-primary">Owner replied</span>}
                  </div>

                  {/* Expanded view */}
                  {selectedComplaint?._id === c._id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Full Description</h4>
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
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(c.repliedAt).toLocaleDateString("en-IN")}
                          </p>
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
            <p className="text-sm mt-1">Your complaints will appear here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}