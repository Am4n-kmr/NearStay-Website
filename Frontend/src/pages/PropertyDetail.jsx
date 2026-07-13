import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  MapPin, Star, Wifi, Zap, UtensilsCrossed, ShieldCheck, Heart,
  BedDouble, Bath, Maximize2, ChevronLeft, ChevronRight,
  MessageCircle, Calendar, Loader2, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { propertyApi, chatApi, bookingApi, paymentApi } from "../lib/api";
import { openRazorpayCheckout } from "../lib/razorpay";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { getDashboardBasePath } from "../lib/dashboard";
import logo from "../assets/logo.png";

const genderLabels = { male: "Boys", female: "Girls", any: "Co-ed" };

function StarRating({ rating, max = 5, size = "sm" }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} ${
            i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function NavUserMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <button onClick={() => navigate("/login")} className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">Sign in</button>
        <button onClick={() => navigate("/register")} className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">Get started</button>
      </>
    );
  }

  const dashboardPath = getDashboardBasePath(user.role);

  return (
    <button
      onClick={() => navigate(dashboardPath)}
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors group"
    >
      <div className="profile-avatar w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xs shadow-sm">
        {user.fullName?.charAt(0) || "U"}
      </div>
      <span className="text-sm font-medium hidden sm:inline">{user.fullName?.split(" ")[0] || "User"}</span>
    </button>
  );
}

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src={logo}
            alt="NearStay Logo"
            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
          />
          <h1 className="flex items-center select-none">
            <span className="font-poppins text-2xl font-extrabold tracking-tight text-slate-900">
              Near
            </span>
            <span className="-ml-0.5 font-kaushan leading-none text-[#4338CA]">
              <span className="text-[2rem]">S</span>
              <span className="text-2xl">tay</span>
            </span>
          </h1>
        </a>
        <div className="flex items-center gap-2">
          <NavUserMenu />
        </div>
      </div>
    </nav>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    moveInDate: "",
    durationMonths: 1,
    notes: "",
  });
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setIsLoading(true);
    try {
      const data = await propertyApi.getById(id);
      setProperty(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!user._id) {
      navigate("/login");
      return;
    }
    try {
      const chat = await chatApi.getOrCreate({ participantId: property.owner._id, propertyId: property._id });
      navigate(`${getDashboardBasePath(user.role)}/messages`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  const handleBook = () => {
    if (!user._id) {
      navigate("/login");
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const booking = await bookingApi.create({
        propertyId: property._id,
        moveInDate: bookingData.moveInDate,
        durationMonths: bookingData.durationMonths,
        notes: bookingData.notes,
      });

      const totalAmount =
        property.rent * bookingData.durationMonths + (property.securityDeposit || 0);

      const orderResp = await paymentApi.createOrder({
        bookingId: booking._id,
        paymentMethod: "razorpay",
        paymentType: "full",
        amount: totalAmount,
      });

      if (!orderResp?.order?.id) {
        throw new Error("Failed to create payment order");
      }

      const razorpayKey = orderResp.key || import.meta.env.VITE_RAZORPAY_KEY;

      if (!razorpayKey) {
        toast({
          title: "Booking created",
          description: "Payment gateway is not configured. Complete payment from My Bookings.",
        });
        setShowBookingForm(false);
        navigate("/dashboard/student/bookings");
        return;
      }

      setShowBookingForm(false);

      try {
        await openRazorpayCheckout({
          key: razorpayKey,
          amount: orderResp.amount,
          currency: orderResp.currency || "INR",
          orderId: orderResp.order.id,
          description: `Booking payment for ${property.title}`,
          prefill: {
            name: user.fullName,
            email: user.email,
          },
          onSuccess: async (response) => {
            await paymentApi.verify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
        });

        toast({
          title: "Payment successful",
          description: "Your booking and payment are complete.",
        });
        navigate("/dashboard/student/bookings");
      } catch (paymentError) {
        toast({
          title: paymentError.message === "Payment cancelled" ? "Payment cancelled" : "Payment failed",
          description: "Your booking was saved. You can complete payment from My Bookings.",
          variant: "destructive",
        });
        navigate("/dashboard/student/bookings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const images = property?.images?.length > 0 ? property.images : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=600&fit=crop"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="h-56 sm:h-72 w-full rounded-xl bg-muted animate-pulse" />
          <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          <div className="h-40 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">
          <p className="mb-4">Property not found</p>
          <Link to="/search">
            <button className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold">
              Browse Properties
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const amenities = [
    { key: "wifi", label: "WiFi", icon: Wifi },
    { key: "ac", label: "AC", icon: Zap },
    { key: "food", label: "Food included", icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <nav className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            to="/search"
            className="hover:text-foreground transition-colors"
          >
            Search
          </Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{property.title}</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-6">
        {/* Image gallery */}
        <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden mb-5 sm:mb-6 bg-muted">
          <img
            src={images[imgIdx]}
            alt={property.title}
            className="w-full h-full object-cover transition-opacity duration-200"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=600&fit=crop";
            }}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setImgIdx((i) => (i - 1 + images.length) % images.length)
                }
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {imgIdx + 1} / {images.length}
              </div>
            </>
          )}
          {/* Wishlist button */}
          <button
            onClick={() => setWishlisted((w) => !w)}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart
              className={`h-4 w-4 ${wishlisted ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`}
            />
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-6">
          {/* Left content */}
          <div className="space-y-5 sm:space-y-6">
            {/* Title & badges */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                  {property.title}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                  {property.propertyType}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                  {genderLabels[property.genderPreference] ||
                    property.genderPreference}
                </span>
                {property.isApproved && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {property.address}, {property.city}, {property.state}
                </span>
              </div>
              {property.reviewRating > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={property.reviewRating} size="md" />
                  <span className="text-sm font-medium">
                    {property.reviewRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({property.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-3">
              {amenities.map(({ key, label, icon: Icon }) => {
                const hasAmenity =
                  property.amenities?.includes(key) ||
                  (key === "wifi" && property.hasWifi) ||
                  (key === "ac" && property.hasAC) ||
                  (key === "food" && property.foodAvailable);
                return hasAmenity ? (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" /> {label}
                  </div>
                ) : null;
              })}
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="font-semibold mb-2 text-sm sm:text-base">
                  About this property
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            {/* House rules */}
            {property.houseRules && (
              <div>
                <h2 className="font-semibold mb-2 text-sm sm:text-base">
                  House rules
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {property.houseRules}
                </p>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="font-semibold mb-3 text-sm sm:text-base">
                Reviews{" "}
                {property.reviewCount > 0 && `(${property.reviewCount})`}
              </h2>
              {property.reviewCount > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Reviews will be displayed here
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>

          {/* Desktop booking sidebar */}
          <div className="hidden md:block space-y-4">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <div className="text-2xl font-bold text-primary">
                  ₹{property.rent?.toLocaleString("en-IN")}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
                {property.securityDeposit > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Security deposit: ₹
                    {property.securityDeposit.toLocaleString("en-IN")}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-0.5">
                  {property.availableRooms} room(s) available
                </div>
                {property.maxPeople > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Up to {property.maxPeople} people per room
                  </div>
                )}
              </div>

              <button
                onClick={handleBook}
                className="w-full flex items-center justify-center gap-2 h-11 bg-black text-white rounded-lg font-semibold text-sm transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20"
              >
                <Calendar className="h-4 w-4" />
                Book Now
              </button>

              <button
                onClick={handleChat}
                className="w-full flex items-center justify-center gap-2 h-11 border border-input bg-background rounded-lg font-medium text-sm transition-all active:scale-[0.98] hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" /> Chat with owner
              </button>

              <hr className="border-border" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {property.owner?.fullName?.charAt(0) || "O"}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {property.owner?.fullName || "Owner"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Property owner
                  </div>
                </div>
              </div>

              {property.isApproved && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xs text-emerald-700 font-medium">
                    Verified property
                  </p>
                  <p className="text-xs text-emerald-600">
                    Reviewed by NearStay team
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-border rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Book Property</h2>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Move-in Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingData.moveInDate}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      moveInDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Duration (months)
                </label>
                <select
                  value={bookingData.durationMonths}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      durationMonths: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                    <option key={month} value={month}>
                      {month} month{month > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Monthly Rent
                </label>
                <input
                  type="text"
                  value={`₹${property.rent?.toLocaleString("en-IN")}`}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-sm text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Security Deposit
                </label>
                <input
                  type="text"
                  value={`₹${property.securityDeposit?.toLocaleString("en-IN")}`}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-sm text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`₹${(property.rent * bookingData.durationMonths + property.securityDeposit)?.toLocaleString("en-IN")}`}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-sm text-muted-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Notes (optional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, notes: e.target.value })
                  }
                  placeholder="Any special requests or notes..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay & Book"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-primary leading-none">
              ₹{property.rent?.toLocaleString("en-IN")}
              <span className="text-xs font-normal text-muted-foreground">
                /mo
              </span>
            </div>
            {property.securityDeposit > 0 && (
              <div className="text-xs text-muted-foreground mt-0.5">
                +₹{property.securityDeposit.toLocaleString("en-IN")} deposit
              </div>
            )}
          </div>
          <button
            onClick={handleChat}
            className="flex items-center gap-1.5 h-11 px-4 border border-input rounded-lg text-sm font-medium bg-background hover:bg-muted transition-all active:scale-95"
          >
            <MessageCircle className="h-4 w-4" /> Chat
          </button>
          <button
            onClick={handleBook}
            className="flex items-center gap-1.5 h-11 px-5 bg-primary text-white rounded-lg text-sm font-semibold transition-all active:scale-95 hover:shadow-lg hover:shadow-primary/20"
          >
            <Calendar className="h-4 w-4" />
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}