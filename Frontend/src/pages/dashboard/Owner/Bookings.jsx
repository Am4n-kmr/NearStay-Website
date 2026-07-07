import { useState } from "react";
import { MapPin, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
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
};

export default function OwnerBookings() {
  const [status, setStatus] = useState("all");
  const bookings = [];
  const isLoading = false;

  return (
    <DashboardLayout title="Bookings">
      <div className="space-y-5">
        <h1 className="text-xl font-bold">Booking Requests</h1>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                status === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
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
                <Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((b) => {
              const sc = statusConfig[b.status] ?? { label: b.status, color: "bg-muted text-muted-foreground", icon: Clock };
              return (
                <div key={b.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{b.tenantName}</h3>
                      <p className="text-xs text-muted-foreground">{b.propertyTitle}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${sc.color}`}>{sc.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-muted-foreground">{b.moveInDate}</span>
                    <span className="font-semibold text-primary">₹{b.totalAmount?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm mt-1">Bookings will appear here once tenants book your properties</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}