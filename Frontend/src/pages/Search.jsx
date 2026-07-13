import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, MapPin, Star, ShieldCheck } from "lucide-react";
import { propertyApi } from "../lib/api";
import { useAuth } from "../hooks/use-auth";
import { getDashboardBasePath } from "../lib/dashboard";
import logo from "../assets/logo.png";

function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="h-48 bg-muted skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4 skeleton" />
        <div className="h-3 bg-muted rounded w-1/2 skeleton" />
        <div className="h-4 bg-muted rounded w-1/3 mt-3 skeleton" />
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

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const getFilters = () => ({
    city: searchParams.get("city") ?? "",
    q: searchParams.get("q") ?? "",
    minRent: searchParams.get("minRent") ?? "",
    maxRent: searchParams.get("maxRent") ?? "",
    propertyType: searchParams.get("propertyType") ?? "",
    gender: searchParams.get("gender") ?? "",
    amenities: searchParams.get("amenities") ?? "",
    sortBy: searchParams.get("sortBy") ?? "",
    page: parseInt(searchParams.get("page") ?? "1", 10),
  });

  const urlFilters = getFilters();

  const [cityInput, setCityInput] = useState(urlFilters.city || urlFilters.q);
  const [propertyType, setPropertyType] = useState(urlFilters.propertyType);
  const [gender, setGender] = useState(urlFilters.gender);
  const [hasWifi, setHasWifi] = useState(urlFilters.amenities.includes("WiFi"));
  const [hasAC, setHasAC] = useState(urlFilters.amenities.includes("AC"));
  const [foodAvailable, setFoodAvailable] = useState(urlFilters.amenities.includes("Food"));
  const [sortBy, setSortBy] = useState(urlFilters.sortBy);
  const [budgetRange, setBudgetRange] = useState([
    parseInt(urlFilters.minRent || "0", 10),
    parseInt(urlFilters.maxRent || "25000", 10),
  ]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch properties from API when filters change
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (urlFilters.city) params.city = urlFilters.city;
        if (urlFilters.q) params.q = urlFilters.q;
        if (urlFilters.propertyType) {
          // Map frontend values to backend schema
          const typeMap = { hostel: "Hostel", pg: "PG", flat: "Flat", room: "Room" };
          params.propertyType = typeMap[urlFilters.propertyType] || urlFilters.propertyType;
        }
        if (urlFilters.gender) {
          const genderMap = { male: "male", female: "female", coed: "any" };
          params.gender = genderMap[urlFilters.gender] || urlFilters.gender;
        }
        if (urlFilters.minRent) params.minRent = urlFilters.minRent;
        if (urlFilters.maxRent) params.maxRent = urlFilters.maxRent;
        if (urlFilters.amenities) params.amenities = urlFilters.amenities;
        if (urlFilters.sortBy) {
          const sortMap = { newest: "newest", rating_desc: "rating_desc", rent_asc: "rent_asc", rent_desc: "rent_desc" };
          params.sortBy = sortMap[urlFilters.sortBy] || "newest";
        }
        params.page = urlFilters.page;
        params.limit = 12;

        const data = await propertyApi.list(params);
        setProperties(data.properties || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Search error:", err);
        setProperties([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [searchParams.toString()]);

  // Sync form state when URL changes
  useEffect(() => {
    const f = getFilters();
    setCityInput(f.city || f.q);
    setPropertyType(f.propertyType);
    setGender(f.gender);
    setHasWifi(f.amenities.includes("WiFi"));
    setHasAC(f.amenities.includes("AC"));
    setFoodAvailable(f.amenities.includes("Food"));
    setSortBy(f.sortBy);
    setBudgetRange([
      parseInt(f.minRent || "0", 10),
      parseInt(f.maxRent || "25000", 10),
    ]);
  }, [searchParams.toString()]);

  const applyFilters = (overrides = {}) => {
    const p = new URLSearchParams();
    const city = overrides.city ?? cityInput;
    if (city) p.set("city", city);
    const pt = overrides.propertyType ?? propertyType;
    if (pt) p.set("propertyType", pt);
    const g = overrides.gender ?? gender;
    if (g) p.set("gender", g);

    // Build amenities list
    const amenitiesList = [];
    const wifi = overrides.hasWifi ?? hasWifi;
    if (wifi) amenitiesList.push("WiFi");
    const ac = overrides.hasAC ?? hasAC;
    if (ac) amenitiesList.push("AC");
    const food = overrides.foodAvailable ?? foodAvailable;
    if (food) amenitiesList.push("Food");
    if (amenitiesList.length > 0) p.set("amenities", amenitiesList.join(","));

    const sort = overrides.sortBy ?? sortBy;
    if (sort) p.set("sortBy", sort);
    const minB = overrides.minRent ?? (budgetRange[0] > 0 ? String(budgetRange[0]) : "");
    if (minB) p.set("minRent", minB);
    const maxB = overrides.maxRent ?? (budgetRange[1] < 25000 ? String(budgetRange[1]) : "");
    if (maxB) p.set("maxRent", maxB);
    p.set("page", String(overrides.page ?? 1));
    setSearchParams(p);
    setMobileFiltersOpen(false);
  };

  function FiltersContent() {
    return (
      <div className="space-y-5">
        <div>
          <label className="text-sm font-semibold mb-2 block">Property Type</label>
          <select
            value={propertyType || "all"}
            onChange={(e) => setPropertyType(e.target.value === "all" ? "" : e.target.value)}
            className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Any type</option>
            <option value="pg">PG</option>
            <option value="hostel">Hostel</option>
            <option value="flat">Flat</option>
            <option value="room">Room</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Gender</label>
          <select
            value={gender || "all"}
            onChange={(e) => setGender(e.target.value === "all" ? "" : e.target.value)}
            className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Any</option>
            <option value="male">Boys</option>
            <option value="female">Girls</option>
            <option value="coed">Co-ed</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-3 block">
            Budget: ₹{budgetRange[0].toLocaleString("en-IN")} – ₹{budgetRange[1].toLocaleString("en-IN")}/mo
          </label>
          <input
            type="range"
            min={0} max={25000} step={500}
            value={budgetRange[1]}
            onChange={(e) => setBudgetRange([budgetRange[0], parseInt(e.target.value)])}
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold block">Amenities</label>
          {[
            { key: "wifi", label: "WiFi included", value: hasWifi, set: setHasWifi },
            { key: "ac", label: "Air conditioning", value: hasAC, set: setHasAC },
            { key: "food", label: "Food included", value: foodAvailable, set: setFoodAvailable },
          ].map(({ key, label, value, set }) => (
            <div key={key} className="flex items-center gap-3 py-0.5">
              <input
                type="checkbox"
                id={key}
                checked={value}
                onChange={(e) => set(e.target.checked)}
                className="h-4 w-4 accent-primary rounded"
              />
              <label htmlFor={key} className="text-sm cursor-pointer select-none">{label}</label>
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Sort by</label>
          <select
            value={sortBy || "newest"}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="newest">Newest first</option>
            <option value="rating_desc">Highest rated</option>
            <option value="rent_asc">Rent: Low to High</option>
            <option value="rent_desc">Rent: High to Low</option>
          </select>
        </div>

        <button
          onClick={() => applyFilters()}
          className="w-full h-11 bg-black text-white text-sm font-semibold rounded-lg transition-all active:scale-[0.98]"
        >
          Apply Filters
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-14 sm:top-16 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 border border-input rounded-lg px-3 bg-background h-10 sm:h-11 min-w-0 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="City, college, area..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="flex-1 bg-transparent text-sm outline-none min-w-0 placeholder-muted-foreground"
            />
            {cityInput && (
              <button onClick={() => setCityInput("")} className="shrink-0 p-0.5 hover:scale-110 transition-transform">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <button
            onClick={() => applyFilters()}
            className="flex items-center gap-2 h-10 sm:h-11 px-3 sm:px-4 bg-black text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 shrink-0"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 border border-input rounded-lg bg-background hover:bg-muted transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative bg-background w-[85vw] max-w-sm h-full overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <FiltersContent />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-6 flex gap-5 sm:gap-6">
        <aside className="hidden md:block w-60 shrink-0">
          <div className="sticky top-[7.5rem] bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-4">Filters</h3>
            <FiltersContent />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isLoading
                ? "Searching..."
                : `${total} propert${total === 1 ? "y" : "ies"} found`}
              {urlFilters.city && ` in ${urlFilters.city}`}
              {urlFilters.q && !urlFilters.city && ` for "${urlFilters.q}"`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {properties.map((p) => (
                  <Link
                    key={p._id}
                    to={`/property/${p._id}`}
                    className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 group"
                  >
                    <div className="relative overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="h-48 w-full object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="h-48 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                      {p.isApproved && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{p.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {p.city}, {p.state}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-sm font-bold">₹{p.rent?.toLocaleString("en-IN")}/<span className="text-xs font-normal text-muted-foreground">mo</span></p>
                        {p.reviewCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-amber-500">
                            <Star className="h-3 w-3 fill-current" /> {p.reviewRating?.toFixed(1)} ({p.reviewCount})
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-0.5 rounded">{p.propertyType}</span>
                        <span>{p.availableRooms} room{p.availableRooms > 1 ? "s" : ""}</span>
                        {p.maxPeople > 0 && <span>Up to {p.maxPeople}</span>}
                        <span>{p.genderPreference === "male" ? "Boys" : p.genderPreference === "female" ? "Girls" : "Co-ed"}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    className="h-10 px-4 border border-input rounded-lg text-sm disabled:opacity-50 transition-all hover:bg-muted hover:scale-105 active:scale-95"
                    disabled={urlFilters.page <= 1}
                    onClick={() => applyFilters({ page: urlFilters.page - 1 })}
                  >
                    Previous
                  </button>
                  <span className="flex items-center text-sm text-muted-foreground px-3">
                    Page {urlFilters.page} of {totalPages}
                  </span>
                  <button
                    className="h-10 px-4 border border-input rounded-lg text-sm disabled:opacity-50 transition-all hover:bg-muted hover:scale-105 active:scale-95"
                    disabled={urlFilters.page >= totalPages}
                    onClick={() => applyFilters({ page: urlFilters.page + 1 })}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-14 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No properties found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search a different city</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}