import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, Calendar, MessageSquare, Bell, TrendingUp, Users, Plus, ArrowRight
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const stats = [
    { label: "Total Properties", value: 0, icon: Building2, href: "/dashboard/owner/properties", color: "text-primary" },
    { label: "Active Bookings", value: 0, icon: Calendar, href: "/dashboard/owner/bookings", color: "text-emerald-500" },
    { label: "Unread Messages", value: 0, icon: MessageSquare, href: "/dashboard/owner/messages", color: "text-blue-500" },
    { label: "Notifications", value: 0, icon: Bell, href: "/dashboard/owner", color: "text-amber-500" },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {user?.fullName?.split(" ")[0] || "Owner"}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your properties and bookings</p>
          </div>
          <Link to="/dashboard/owner/properties/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, href, color }) => (
            <button
              key={label}
              onClick={() => navigate(href)}
              className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="text-2xl font-bold">{value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </button>
          ))}
        </div>

        {/* Placeholder for recent bookings */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Recent Bookings</h2>
              <Link to="/dashboard/owner/bookings">
                <Button variant="ghost" size="sm" className="text-xs gap-1">View all <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No bookings yet</p>
              <p className="text-xs mt-1">Bookings will appear here once tenants book your properties</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">My Properties</h2>
              <Link to="/dashboard/owner/properties">
                <Button variant="ghost" size="sm" className="text-xs gap-1">View all <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No properties listed yet</p>
              <Link to="/dashboard/owner/properties/new">
                <Button size="sm" variant="outline" className="mt-3">List your first property</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}