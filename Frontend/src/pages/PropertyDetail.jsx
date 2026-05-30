import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  MapPin, Star, Wifi, Zap, UtensilsCrossed, ShieldCheck, Heart,
  BedDouble, Bath, Maximize2, ChevronLeft, ChevronRight,
  MessageCircle, Calendar,
} from "lucide-react";

const typeLabels = { hostel: "Hostel", pg: "PG", shared: "Shared", private: "Private" };
const genderLabels = { male: "Boys", female: "Girls", coed: "Co-ed" };
const occupancyLabels = { single: "Single", double: "Double", triple: "Triple" };

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

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-bold text-sm text-white">N</span>
          </div>
          <span className="font-bold text-lg tracking-tight">NearStay</span>
        </a>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/login")} className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">Sign in</button>
          <button onClick={() => navigate("/register")} className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">Get started</button>
        </div>
      </div>
    </nav>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);

  // TODO: Replace with real API call when backend is ready
  // const { data: prop, isLoading } = useGetProperty(id);
  const isLoading = false;
  const prop = null; // will come from backend

  const handleChat = () => navigate("/login");
  const handleBook = () => navigate("/login");

  const images = ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=600&fit=crop"];

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

  if (!prop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">
          <p className="mb-4">Connect your backend to see property details.</p>
          <p className="text-sm mb-6">Property ID: <span className="font-mono bg-muted px-2 py-1 rounded">{id}</span></p>
          <Link to="/search">
            <button className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold">
              Browse Properties
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <nav className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-foreground transition-colors">Search</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{prop.title}</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-6">
        {/* Image gallery */}
        <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden mb-5 sm:mb-6 bg-muted">
          <img
            src={images[imgIdx]}
            alt={prop.title}
            className="w-full h-full object-cover transition-opacity duration-200"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=600&fit=crop"; }}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setImgIdx(i => (i + 1) % images.length)}
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
            onClick={() => setWishlisted(w => !w)}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-6">
          {/* Left content */}
          <div className="space-y-5 sm:space-y-6">
            {/* Title & badges */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">{prop.title}</h1>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {typeLabels[prop.propertyType] ?? prop.propertyType}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {genderLabels[prop.gender] ?? prop.gender}
                </span>
                {prop.isVerified && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{prop.address}, {prop.city}</span>
              </div>
              {prop.rating > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={prop.rating} size="md" />
                  <span className="text-sm font-medium">{prop.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({prop.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-3">
              {prop.hasWifi && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Wifi className="h-4 w-4 text-primary" /> WiFi
                </div>
              )}
              {prop.hasAC && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-primary" /> AC
                </div>
              )}
              {prop.foodAvailable && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UtensilsCrossed className="h-4 w-4 text-primary" /> Food included
                </div>
              )}
            </div>

            {/* Description */}
            {prop.description && (
              <div>
                <h2 className="font-semibold mb-2 text-sm sm:text-base">About this property</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{prop.description}</p>
              </div>
            )}

            {/* Nearby colleges */}
            {prop.nearbyColleges?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2 text-sm sm:text-base">Nearby colleges</h2>
                <div className="flex flex-wrap gap-2">
                  {prop.nearbyColleges.map((c) => (
                    <span key={c} className="text-xs px-2 py-1 rounded-full border border-border bg-card">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* House rules */}
            {prop.houseRules && (
              <div>
                <h2 className="font-semibold mb-2 text-sm sm:text-base">House rules</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{prop.houseRules}</p>
              </div>
            )}

            {/* Rooms */}
            {prop.rooms?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 text-sm sm:text-base">Available rooms</h2>
                <div className="space-y-2.5">
                  {prop.rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id === selectedRoomId ? null : room.id)}
                      disabled={!room.isAvailable}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${
                        selectedRoomId === room.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-card hover:border-primary/40"
                      } ${!room.isAvailable ? "opacity-50 cursor-default" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-sm">Room {room.roomNumber}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-2">
                            <span>{occupancyLabels[room.occupancyType]} occupancy</span>
                            {room.hasAttachedBath && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />Attached bath</span>}
                            {room.hasBalcony && <span className="flex items-center gap-0.5"><Maximize2 className="h-3 w-3" />Balcony</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-primary text-sm">
                            ₹{room.pricePerMonth.toLocaleString("en-IN")}
                            <span className="text-xs font-normal text-muted-foreground">/mo</span>
                          </div>
                          <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${room.isAvailable ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {room.isAvailable ? "Available" : "Occupied"}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="font-semibold mb-3 text-sm sm:text-base">
                Reviews {prop.reviewCount > 0 && `(${prop.reviewCount})`}
              </h2>
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
          </div>

          {/* Desktop booking sidebar */}
          <div className="hidden md:block space-y-4">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <div className="text-2xl font-bold text-primary">
                  ₹{prop.minPrice?.toLocaleString("en-IN")}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                {prop.securityDeposit && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Security deposit: ₹{prop.securityDeposit.toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              <button
                onClick={handleBook}
                className="w-full flex items-center justify-center gap-2 h-11 bg-primary text-white rounded-lg font-semibold text-sm transition-all active:scale-[0.98]"
              >
                <Calendar className="h-4 w-4" />
                {selectedRoomId ? "Book this room" : "Book now"}
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
                  {prop.ownerName?.charAt(0) ?? "O"}
                </div>
                <div>
                  <div className="text-sm font-medium">{prop.ownerName}</div>
                  <div className="text-xs text-muted-foreground">Property owner</div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-emerald-700 font-medium">Verified property</p>
                <p className="text-xs text-emerald-600">Reviewed by NearStay team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-primary leading-none">
              ₹{prop.minPrice?.toLocaleString("en-IN")}
              <span className="text-xs font-normal text-muted-foreground">/mo</span>
            </div>
            {prop.securityDeposit && (
              <div className="text-xs text-muted-foreground mt-0.5">+₹{prop.securityDeposit.toLocaleString("en-IN")} deposit</div>
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
            className="flex items-center gap-1.5 h-11 px-5 bg-primary text-white rounded-lg text-sm font-semibold transition-all active:scale-95"
          >
            <Calendar className="h-4 w-4" />
            {selectedRoomId ? "Book Room" : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}