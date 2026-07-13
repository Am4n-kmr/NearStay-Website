import { useState, useEffect } from "react";
import { Building2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { adminApi } from "../../../lib/api";
import { toast } from "sonner";

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await adminApi.getAllProperties(params);
      setProperties(data.properties || []);
    } catch (err) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, [statusFilter]);

  const handleModerate = async (id, approve) => {
    try {
      await adminApi.moderateProperty(id, approve);
      toast.success(approve ? "Property approved" : "Property rejected");
      fetchProperties();
    } catch (err) {
      toast.error("Failed to moderate property");
    }
  };

  return (
    <DashboardLayout title="All Properties">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">All Properties</h1>
            <p className="text-sm text-muted-foreground mt-0.5">View and manage all listed properties</p>
          </div>
          <div className="flex gap-2">
            {[
              { label: "All", value: "" },
              { label: "Approved", value: "approved" },
              { label: "Pending", value: "pending" },
            ].map(({ label, value }) => (
              <button key={value} onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${statusFilter === value ? "bg-primary text-white border-primary" : "bg-background border-border hover:border-primary/50"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No properties found</p>
          </div>
        ) : (
          <div className="dashboard-card dashboard-card-hover overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium">Property</th>
                    <th className="text-left px-4 py-3 font-medium">Owner</th>
                    <th className="text-left px-4 py-3 font-medium">Rent</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p._id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.city}, {p.state} • {p.propertyType}{p.maxPeople > 0 ? ` • Up to ${p.maxPeople}/room` : ""}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.owner?.fullName || "Unknown"}
                      </td>
                      <td className="px-4 py-3 font-medium">₹{p.rent?.toLocaleString("en-IN")}/mo</td>
                      <td className="px-4 py-3">
                        {p.isApproved ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!p.isApproved && (
                          <div className="flex gap-1.5 justify-end">
                            <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => handleModerate(p._id, true)}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleModerate(p._id, false)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {p.isApproved && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}