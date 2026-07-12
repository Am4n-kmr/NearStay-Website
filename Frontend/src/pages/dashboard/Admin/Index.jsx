import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, Building2, AlertTriangle, Shield, CheckCircle2, XCircle, Loader2
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { dashboardApi, notificationApi } from "../../../lib/api";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/use-auth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await dashboardApi.admin();
      setData(res);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, approve) => {
    try {
      await adminApi.moderateProperty(id, approve);
      toast.success(approve ? "Property approved" : "Property rejected");
      fetchData();
    } catch (err) {
      toast.error("Failed to moderate property");
    }
  };

  const statCards = data ? [
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-blue-500", href: "/dashboard/admin/users" },
    { label: "Total Properties", value: data.totalProperties, icon: Building2, color: "text-primary", href: "#" },
    { label: "Pending Approvals", value: data.pendingProperties, icon: Shield, color: "text-amber-500", href: "#" },
    { label: "Open Complaints", value: data.pendingComplaints, icon: AlertTriangle, color: "text-destructive", href: "#" },
  ] : [];

  const pendingProperties = data?.pendingProperties || [];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage the NearStay platform</p>
          </div>
          <Link to="/dashboard/admin/users">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Users className="h-4 w-4" /> Manage Users
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, href }) => (
              <Link key={label} to={href} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="text-2xl font-bold">{value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{label}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Pending Property Approvals</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{data?.pendingPropertiesCount ?? 0}</span>
            </div>
            {loading ? (
              <div className="p-8"><Skeleton className="h-20 rounded-lg" /></div>
            ) : data?.pendingProperties?.length > 0 ? (
              <div className="divide-y divide-border">
                {data.pendingProperties.map((p) => (
                  <div key={p._id} className="p-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.city} • {p.propertyType} • ₹{p.rent}/mo</p>
                      <p className="text-xs text-muted-foreground">by {p.owner?.fullName || "Unknown"}</p>
                    </div>
                    <div className="flex gap-1.5 ml-3 shrink-0">
                      <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => handleModerate(p._id, true)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleModerate(p._id, false)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">All caught up!</p>
                <p className="text-xs mt-1">No properties pending review</p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Recent Complaints</h2>
            </div>
            <div className="divide-y divide-border">
              {data?.recentComplaints?.length > 0 ? (
                data.recentComplaints.map((c) => (
                  <div key={c._id} className="p-4">
                    <p className="text-sm font-medium">{c.title || c.description?.slice(0, 50)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">by {c.user?.fullName || "User"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No open complaints</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
