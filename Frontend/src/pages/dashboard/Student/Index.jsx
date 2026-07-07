import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Heart, Bell, MessageSquare, Calendar, ArrowRight, Home
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  refunded: "bg-purple-100 text-purple-700",
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const d = null; // Will come from API integration

  const stats = [
    { label: "Active Bookings", value: d?.activeBookings ?? 0, icon: BookOpen, href: "/dashboard/student/bookings", color: "text-primary" },
    { label: "Wishlist", value: d?.wishlistCount ?? 0, icon: Heart, href: "/dashboard/student/wishlist", color: "text-rose-500" },
    { label: "Unread Messages", value: d?.unreadMessages ?? 0, icon: MessageSquare, href: "/dashboard/student/messages", color: "text-blue-500" },
    { label: "Notifications", value: d?.unreadNotifications ?? 0, icon: Bell, href: "/dashboard/student", color: "text-amber-500" },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Welcome back, {user?.fullName?.split(" ")[0] || "Student"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your accommodations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, href, color }) => (
            <button key={label} onClick={() => navigate(href)} className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${color}`} />
                {isLoading ? <Skeleton className="h-6 w-8" /> : <span className="text-2xl font-bold">{value}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Recent Bookings */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Recent Bookings</h2>
              <Link to="/dashboard/student/bookings">
                <Button variant="ghost" size="sm" className="text-xs gap-1">View all <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 space-y-1.5"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No bookings yet</p>
                  <Link to="/search"><Button size="sm" variant="outline" className="mt-3">Browse properties</Button></Link>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Notifications</h2>
            </div>
            <div className="divide-y divide-border">
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">You're all caught up</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/search"><Button variant="outline" size="sm">Find accommodation</Button></Link>
            <Link to="/dashboard/student/bookings"><Button variant="outline" size="sm">View bookings</Button></Link>
            <Link to="/dashboard/student/complaints"><Button variant="outline" size="sm">File a complaint</Button></Link>
            <Link to="/dashboard/student/profile"><Button variant="outline" size="sm">Update profile</Button></Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}