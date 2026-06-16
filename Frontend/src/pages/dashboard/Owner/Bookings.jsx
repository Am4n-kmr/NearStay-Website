import { useState } from "react";
import { Link } from "wouter";
import { Calendar, MapPin, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListBookings, useCancelBooking } from "@workspace/api-client-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const cancelBooking = useCancelBooking();

  const params = status !== "all" ? { status } : {};
  const { data, isLoading } = useListBookings(params);

  const bookings = data?.bookings ?? [];

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelBooking.mutateAsync({ bookingId: id });
      toast({ title: "Booking cancelled" });
    } catch {
      toast({ title: "Failed to cancel", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="My Bookings">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">My Bookings</h1>
          <Link href="/search"><Button size="sm">Find accommodation</Button></Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${status === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
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
                        <Link href={`/booking/${b.id}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">{b.propertyTitle}</h3>
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" /> {b.propertyAddress}
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${sc.color}`}>{sc.label}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Room</div>
                        <div className="font-medium">{b.roomNumber}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Move-in</div>
                        <div className="font-medium">{b.moveInDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="font-medium">{b.durationMonths}mo</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-bold text-primary">₹{b.totalAmount.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <Badge variant={b.isPaid ? "default" : "secondary"} className="text-xs">
                        {b.isPaid ? "Paid" : "Payment pending"}
                      </Badge>
                      <div className="flex gap-2">
                        <Link href={`/booking/${b.id}`}><Button size="sm" variant="outline" className="h-7 text-xs">View details</Button></Link>
                        {["pending", "confirmed"].includes(b.status) && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleCancel(b.id)}>Cancel</Button>
                        )}
                      </div>
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
            <Link href="/search"><Button className="mt-4" size="sm">Find accommodation</Button></Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
