import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Heart, Bell, MessageSquare, Calendar, ArrowRight, Home
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { dashboardApi, notificationApi } from "../../../lib/api";
import { useAuth } from "../../../hooks/use-auth";

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  refunded: "bg-purple-100 text-purple-700",
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.student();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: "Active Bookings", value: data?.activeBookings ?? 0, icon: BookOpen, href: "/dashboard/student/bookings", color: "text-primary" },
    { label: "Wishlist", value: data?.wishlistCount ?? 0, icon: Heart, href: "/dashboard/student/wishlist", color: "text-rose-500" },
    { label: "Unread Messages", value: data?.unreadMessages ?? 0, icon: MessageSquare, href: "/dashboard/student/messages", color: "text-blue-500" },
    { label: "Notifications", value: data?.unreadNotifications ?? 0, icon: Bell, href: "/dashboard/student", color: "text-amber-500" },
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
              )) : data?.recentBookings?.length > 0 ? (
                data.recentBookings.map((booking) => (
                  <div key={booking._id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{booking.property?.title || "Property"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {booking.property?.city} • {new Date(booking.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColors[booking.status] || "bg-gray-100 text-gray-700"}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
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
              {data?.unreadNotifications > 0 && (
                <button
                  onClick={async () => {
                    await notificationApi.markAllAsRead();
                    setData(prev => prev ? {
                      ...prev,
                      unreadNotifications: 0,
                      recentNotifications: prev.recentNotifications.map(n => ({ ...n, isRead: true }))
                    } : null);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-border">
              {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 space-y-1.5"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
              )) : data?.recentNotifications?.length > 0 ? (
                data.recentNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={async () => {
                      if (!notif.isRead) {
                        await notificationApi.markAsRead(notif._id);
                        setData(prev => prev ? ({
                          ...prev,
                          unreadNotifications: Math.max(0, prev.unreadNotifications - 1),
                          recentNotifications: prev.recentNotifications.map(n =>
                            n._id === notif._id ? { ...n, isRead: true } : n
                          )
                        }) : null);
                      }
                    }}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      !notif.isRead ? "bg-primary/5 border-l-2 border-primary" : ""
                    }`}
                  >
                    <p className={`text-sm ${!notif.isRead ? "font-bold" : "font-medium"}`}>{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">You're all caught up</p>
                </div>
              )}
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
