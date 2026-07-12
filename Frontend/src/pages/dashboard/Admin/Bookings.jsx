import { useState, useEffect } from "react";
import { MapPin, CheckCircle2, Clock, XCircle, Search, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { bookingApi } from "../../../lib/api";
import { useToast } from "../../../hooks/use-toast";

const STATUS_TABS = ["all", "pending", "accepted", "confirmed", "completed", "cancelled", "rejected"];

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
  rejected: { label: "Rejected", color: "bg-gray-100 text-gray-700", icon: XCircle },
};

export default function AdminBookings() {
  const [status, setStatus] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [status, page]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status !== "all") params.status = status;
      const data = await bookingApi.getAll(params);
      setBookings(data.bookings);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="All Bookings">
      <div className="space-y-5">
        <h1 className="text-xl font-bold">All Bookings</h1>

        {/* Status filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
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
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="dashboard-card p-4 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <>
            <div className="space-y-3">
              {bookings.map((b) => {
                const sc = statusConfig[b.status] ?? { label: b.status, color: "bg-muted text-muted-foreground", icon: Clock };
                const StatusIcon = sc.icon;
                return (
                  <div key={b._id} className="dashboard-card dashboard-card-hover p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{b.tenant?.fullName || "Student"}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.property?.title || "Property"}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" /> {b.property?.city}
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 flex items-center gap-1 ${sc.color}`}>
                        <StatusIcon className="h-3 w-3" /> {sc.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Move-in Date</div>
                        <div className="text-sm font-medium mt-0.5">
                          {new Date(b.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="text-sm font-medium mt-0.5">{b.durationMonths} month(s)</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total Amount</div>
                        <div className="text-sm font-semibold text-primary mt-0.5">₹{b.totalAmount?.toLocaleString("en-IN")}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Payment</div>
                        <Badge variant={b.paymentStatus === "paid" ? "default" : "secondary"} className="text-xs mt-1">
                          {b.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <span>Owner: {b.owner?.fullName}</span>
                      <span>{new Date(b.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No bookings found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}