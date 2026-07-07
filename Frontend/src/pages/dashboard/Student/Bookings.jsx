import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";

const STATUS_TABS = ["all", "pending", "confirmed", "completed", "cancelled"];

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
  refunded: { label: "Refunded", color: "bg-purple-100 text-purple-700", icon: XCircle },
};

export default function StudentBookings() {
  const [status, setStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const bookings = [];

  return (
    <DashboardLayout title="My Bookings">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">My Bookings</h1>
          <Link to="/search"><Button size="sm">Find accommodation</Button></Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((b) => {
              const sc = statusConfig[b.status] ?? { label: b.status, color: "bg-muted text-muted-foreground", icon: Clock };
              return (
                <div key={b.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{b.propertyTitle}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" /> {b.propertyAddress}
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${sc.color}`}>{sc.label}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <Badge variant={b.isPaid ? "default" : "secondary"} className="text-xs">
                        {b.isPaid ? "Paid" : "Payment pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No bookings found</p>
            <p className="text-sm mt-1">Your bookings will appear here once you start exploring</p>
            <Link to="/search"><Button className="mt-4" size="sm">Find accommodation</Button></Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}