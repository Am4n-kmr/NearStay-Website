import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import { propertyApi } from "../lib/api";
import { useAuth } from "../hooks/use-auth";
import { getDashboardBasePath } from "../lib/dashboard";
import logo from "../assets/logo.png";

const POPULAR_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: "Verified Listings",
    desc: "Every property is manually reviewed",
  },
  {
    icon: Users,
    label: "Verified Owners",
    desc: "ID-verified property owners only",
  },
  { icon: Star, label: "Honest Reviews", desc: "Reviews from real tenants" },
  {
    icon: CheckCircle2,
    label: "Secure Payments",
    desc: "Protected by Razorpay",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search by city or college",
    desc: "Browse verified hostels, PGs and shared rooms near your college or workplace.",
  },
  {
    step: "02",
    title: "Connect directly with owners",
    desc: "No brokers. Chat with verified owners, ask questions, and schedule visits.",
  },
  {
    step: "03",
    title: "Book and pay securely",
    desc: "Confirm your room and pay through our secure payment gateway.",
  },
];

const REVIEWS = [
  {
    name: "Priya Sharma",
    college: "IIT Bombay, Mumbai",
    rating: 5,
    avatar: "P",
    color: "bg-violet-500",
    text: "Found my PG within 2 days of joining. The owner was verified and the room was exactly as shown. No broker fees — saved ₹15,000!",
  },
  {
    name: "Rahul Mehta",
    college: "Delhi University, Delhi",
    rating: 5,
    avatar: "R",
    color: "bg-blue-500",
    text: "NearStay made my hostel search so easy. The filters helped me find a boys-only hostel with food included near my college. Highly recommend!",
  },
  {
    name: "Anjali Singh",
    college: "Christ University, Bangalore",
    rating: 5,
    avatar: "A",
    color: "bg-emerald-500",
    text: "As a girl coming from outside the city, safety was my top concern. All properties are verified and the owner was super helpful. Feels safe and homely.",
  },
  {
    name: "Karan Patel",
    college: "NMIMS, Mumbai",
    rating: 4,
    avatar: "K",
    color: "bg-amber-500",
    text: "Booked a shared room in 3 days. Payment was smooth, the security deposit process was transparent. Wish I had found this platform sooner.",
  },
  {
    name: "Sneha Reddy",
    college: "BITS Pilani, Hyderabad",
    rating: 5,
    avatar: "S",
    color: "bg-rose-500",
    text: "The chat feature let me talk directly with the owner before booking. No middlemen, no hidden costs. Got a great deal on a fully furnished room.",
  },
  {
    name: "Amit Joshi",
    college: "Symbiosis, Pune",
    rating: 5,
    avatar: "A",
    color: "bg-cyan-500",
    text: "The reviews from other students were super honest and helped me pick the right place. Move-in was smooth and the owner was exactly as described.",
  },
];

function ReviewCarousel() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const total = REVIEWS.length;

  const goTo = useCallback(
    (idx) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((idx + total) % total);
        setTransitioning(false);
      }, 250);
    },
    [transitioning, total],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  const r = REVIEWS[current];

  return (
    <div className="relative flex flex-col h-full select-none">
      <div
        className="flex-1 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col justify-between"
        style={{
          background: "rgba(255,255,255,0.10)",
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <Quote className="h-8 w-8 text-white/30 mb-3 shrink-0" />
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
            />
          ))}
        </div>
        <p className="text-white/90 text-sm leading-relaxed flex-1 mb-5">
          "{r.text}"
        </p>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
          >
            {r.avatar}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{r.name}</div>
            <div className="text-white/60 text-xs">{r.college}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1.5">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === current ? "24px" : "6px",
                background: i === current ? "white" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.10)" }}
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={next}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.10)" }}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}

function PropertyCard({ property }) {
  const navigate = useNavigate();
  const fallbackImg =
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=600&fit=crop";

  return (
    <div
      onClick={() => navigate(`/property/${property._id}`)}
      className="dashboard-card dashboard-card-hover overflow-hidden cursor-pointer group"
    >
      <div className="h-48 overflow-hidden bg-muted relative">
        <img
          src={property.images?.[0] || fallbackImg}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = fallbackImg;
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="text-xs px-2 py-1 rounded-full bg-white/90 text-foreground font-medium capitalize shadow-sm">
            {property.propertyType}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          {property.genderPreference === "male" ? (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/90 text-white font-medium">
              Boys
            </span>
          ) : property.genderPreference === "female" ? (
            <span className="text-xs px-2 py-1 rounded-full bg-pink-500/90 text-white font-medium">
              Girls
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/90 text-white font-medium">
              Co-ed
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-1 mb-1">
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {property.city}, {property.state}
          </span>
        </div>
        {property.reviewRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">
              {property.reviewRating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({property.reviewCount})
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <div>
            <span className="text-base font-bold text-primary">
              ₹{property.rent?.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
          {property.isApproved && (
            <ShieldCheck
              className="h-4 w-4 text-emerald-500"
              title="Verified"
            />
          )}
        </div>
        {property.maxPeople > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            Up to {property.maxPeople} people
          </div>
        )}
      </div>
    </div>
  );
}

function NavUserMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <button
          onClick={() => navigate("/login")}
          className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          Sign in
        </button>
        <button
          onClick={() => navigate("/register")}
          className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-[#5548e3] text-white hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          Get started
        </button>
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
      <span className="text-sm font-medium hidden sm:inline">
        {user.fullName?.split(" ")[0] || "User"}
      </span>
    </button>
  );
}

function CtaSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only show to owners and guests — hide from students
  if (user?.role === "student") return null;

  return (
    <section
      className="relative overflow-hidden text-white py-14 sm:py-16"
      style={{
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      <div
        className="absolute top-[-20%] right-[-5%] w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, #6366f1, transparent 70%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 animate-fade-in-up">
          Own a property? List it on NearStay
        </h2>
        <p className="text-white/70 mb-6 max-w-lg mx-auto text-sm sm:text-base animate-fade-in-up delay-200">
          Reach thousands of verified students looking for accommodation. Get
          bookings within days.
        </p>
        <button
          onClick={() =>
            navigate(user ? "/dashboard/owner/properties" : "/register")
          }
          className="bg-white text-indigo-700 hover:bg-white/90 active:scale-95 transition-all font-semibold px-6 py-3 rounded-lg text-sm shadow-lg hover:shadow-xl hover:scale-105"
        >
          {user ? "List your property" : "List your property for free"}
        </button>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const data = await propertyApi.list({ limit: 6, sortBy: "newest" });
      setFeaturedProperties(data.properties || []);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      setFeaturedProperties([]);
    } finally {
      setIsFeaturedLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    navigate(`/search?${params.toString()}`);
  };

  const handleCitySearch = (city) => {
    navigate(`/search?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slide-down { animation: slideDown 0.6s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 8s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl animate-slide-down">
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
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/search")}
              className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Browse
            </button>
            <NavUserMenu />
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden animate-fade-in hero-gradient"
        style={{
          background:
            "linear-gradient(135deg, #0f0c29 0%, #1a1060 40%, #24243e 100%)",
        }}
      >
        <div
          className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] max-w-lg rounded-full opacity-20 blur-3xl pointer-events-none animate-pulse-glow"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[35vw] h-[35vw] max-w-md rounded-full opacity-15 blur-3xl pointer-events-none animate-pulse-glow"
          style={{
            background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
            animationDelay: "2s",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 pt-14 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="animate-fade-in-up delay-200">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur text-white/80 text-xs font-medium mb-6 animate-fade-in-up delay-400">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
              Trusted by 10,000+ students across India
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5 animate-fade-in-up delay-500">
              Find your perfect
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #a78bfa, #60a5fa)",
                }}
              >
                PG or hostel
              </span>
              <br />
              near your college
            </h1>

            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-8 max-w-md animate-fade-in-up delay-600">
              Verified rooms, direct from owners. No brokers, no hidden fees.
              Browse thousands of PGs, hostels, and shared rooms across India.
            </p>

            <div className="flex gap-2 bg-white/10 backdrop-blur-lg rounded-3xl p-1.5 max-w-lg animate-fade-in-up delay-700 shadow-soft">
              <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-3xl bg-white/10">
                <MapPin className="h-4 w-4 text-white/60 shrink-0" />
                <input
                  type="text"
                  placeholder="City, college or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none min-w-0"
                />
              </div>
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 bg-[#5548e3] hover:bg-[#4a3fd4] text-white text-sm font-semibold px-4 py-2.5 rounded-3xl transition-all hover:scale-105 active:scale-95 shrink-0 shadow-lg"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 animate-fade-in-up delay-800">
              <span className="text-white/40 text-xs self-center">
                Popular:
              </span>
              {["Mumbai", "Delhi", "Bangalore", "Pune"].map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySearch(city)}
                  className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex flex-col h-72 animate-fade-in delay-600">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">
              What students say
            </p>
            <ReviewCarousel />
          </div>

          <div className="lg:hidden mt-2 animate-fade-in-up delay-600">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">
              What students say
            </p>
            <ReviewCarousel />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-background/80 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {[
            { value: "10,000+", label: "Happy Students" },
            { value: "2,500+", label: "Verified Properties" },
            { value: "50+", label: "Cities Covered" },
            { value: "4.8/5", label: "Average Rating" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="glass-panel p-5 rounded-[1.25rem] shadow-soft transition-transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {TRUST_BADGES.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className="dashboard-card dashboard-card-hover flex flex-col items-center text-center p-5 rounded-3xl"
              style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="font-semibold text-xs sm:text-sm mb-1">
                {label}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="max-w-7xl mx-auto px-4 pb-12 sm:pb-14">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Featured Properties
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Latest accommodations added by verified owners
            </p>
          </div>
          <button
            onClick={() => navigate("/search")}
            className="flex items-center gap-1 text-primary text-sm hover:text-[#2e74ff] transition-all hover:scale-105 active:scale-95"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {isFeaturedLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))
          ) : featuredProperties.length > 0 ? (
            featuredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No properties listed yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Cities ── */}
      <section className="bg-muted/40 border-y border-border py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
            Browse by city
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mb-5 sm:mb-6">
            Find accommodation in India's top student cities
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {POPULAR_CITIES.map((city, i) => (
              <button
                key={city}
                onClick={() => handleCitySearch(city)}
                className="relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 hover:scale-105 hover:-translate-y-1 active:scale-95 p-4 text-left group"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both`,
                }}
              >
                <div className="font-semibold text-sm mb-0.5">{city}</div>
                <div className="text-xs text-muted-foreground">Explore</div>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold">How NearStay works</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Book your room in 3 simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <div
              key={step}
              className="text-center flex flex-col items-center sm:block"
              style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.2}s both` }}
            >
              <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-0">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center sm:mx-auto sm:mb-4 shrink-0 transition-transform hover:scale-110 hover:rotate-5">
                  {step}
                </div>
                <div className="text-left sm:text-center">
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="w-0.5 h-6 bg-border mx-auto mt-4 sm:hidden" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner (only show to non-owners) ── */}
      <CtaSection />

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card text-muted-foreground animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5 hover:scale-105 transition-transform cursor-default group">
            <img
              src={logo}
              alt="NearStay Logo"
              className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <h1 className="flex items-center select-none">
              <span className="font-poppins text-lg font-extrabold tracking-tight text-slate-900">
                Near
              </span>
              <span className="-ml-0.5 font-kaushan leading-none text-[#4338CA]">
                <span className="text-[1.4rem]">S</span>
                <span className="text-lg">tay</span>
              </span>
            </h1>
          </div>
          <p className="text-xs">
            Direct student housing. No brokers. No hidden charges.
          </p>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} NearStay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
