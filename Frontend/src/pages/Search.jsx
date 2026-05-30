import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";

// Skeleton placeholder for property cards
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

// Shared Navbar
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

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL
  const getFilters = () => ({
    city: searchParams.get("city") ?? "",
    q: searchParams.get("q") ?? "",
    minBudget: searchParams.get("minBudget") ?? "",
    maxBudget: searchParams.get("maxBudget") ?? "",
    propertyType: searchParams.get("propertyType") ?? "",
    gender: searchParams.get("gender") ?? "",
    hasWifi: searchParams.get("hasWifi") === "true",
    hasAC: searchParams.get("hasAC") === "true",
    foodAvailable: searchParams.get("foodAvailable") === "true",
    sortBy: searchParams.get("sortBy") ?? "",
    page: parseInt(searchParams.get("page") ?? "1", 10),
  });

  const urlFilters = getFilters();

  // Local form state
  const [cityInput, setCityInput] = useState(urlFilters.city || urlFilters.q);
  const [propertyType, setPropertyType] = useState(urlFilters.propertyType);
  const [gender, setGender] = useState(urlFilters.gender);
  const [hasWifi, setHasWifi] = useState(urlFilters.hasWifi);
  const [hasAC, setHasAC] = useState(urlFilters.hasAC);
  const [foodAvailable, setFoodAvailable] = useState(urlFilters.foodAvailable);
  const [sortBy, setSortBy] = useState(urlFilters.sortBy);
  const [budgetRange, setBudgetRange] = useState([
    parseInt(urlFilters.minBudget || "0", 10),
    parseInt(urlFilters.maxBudget || "25000", 10),
  ]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync form state when URL changes
  useEffect(() => {
    const f = getFilters();
    setCityInput(f.city || f.q);
    setPropertyType(f.propertyType);
    setGender(f.gender);
    setHasWifi(f.hasWifi);
    setHasAC(f.hasAC);
    setFoodAvailable(f.foodAvailable);
    setSortBy(f.sortBy);
    setBudgetRange([
      parseInt(f.minBudget || "0", 10),
      parseInt(f.maxBudget || "25000", 10),
    ]);
  }, [searchParams.toString()]);

  // TODO: replace with real API call when backend is ready
  const properties = [];
  const isLoading = false;
  const total = 0;
  const totalPages = 1;

  const applyFilters = (overrides = {}) => {
    const p = new URLSearchParams();
    const city = overrides.city ?? cityInput;
    if (city) p.set("city", city);
    const pt = overrides.propertyType ?? propertyType;
    if (pt) p.set("propertyType", pt);
    const g = overrides.gender ?? gender;
    if (g) p.set("gender", g);
    const wifi = overrides.hasWifi ?? hasWifi;
    if (wifi) p.set("hasWifi", "true");
    const ac = overrides.hasAC ?? hasAC;
    if (ac) p.set("hasAC", "true");
    const food = overrides.foodAvailable ?? foodAvailable;
    if (food) p.set("foodAvailable", "true");
    const sort = overrides.sortBy ?? sortBy;
    if (sort) p.set("sortBy", sort);
    const minB = overrides.minBudget ?? (budgetRange[0] > 0 ? String(budgetRange[0]) : "");
    if (minB) p.set("minBudget", minB);
    const maxB = overrides.maxBudget ?? (budgetRange[1] < 25000 ? String(budgetRange[1]) : "");
    if (maxB) p.set("maxBudget", maxB);
    p.set("page", String(overrides.page ?? 1));
    setSearchParams(p);
    setMobileFiltersOpen(false);
  };

  function FiltersContent() {
    return (
      <div className="space-y-5">
        {/* Property Type */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Property Type</label>
          <select
            value={propertyType || "all"}
            onChange={(e) => setPropertyType(e.target.value === "all" ? "" : e.target.value)}
            className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Any type</option>
            <option value="hostel">Hostel</option>
            <option value="pg">PG</option>
            <option value="shared">Shared</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Gender */}
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

        {/* Budget */}
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

        {/* Amenities */}
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

        {/* Sort */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Sort by</label>
          <select
            value={sortBy || "newest"}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="newest">Newest first</option>
            <option value="rating_desc">Highest rated</option>
          </select>
        </div>

        <button
          onClick={() => applyFilters()}
          className="w-full h-11 bg-primary text-white text-sm font-semibold rounded-lg transition-all active:scale-[0.98]"
        >
          Apply Filters
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Sticky search bar */}
      <div className="border-b border-border bg-card sticky top-14 sm:top-16 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2">
          {/* Search input */}
          <div className="flex-1 flex items-center gap-2 border border-input rounded-lg px-3 bg-background h-10 sm:h-11 min-w-0">
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
              <button onClick={() => setCityInput("")} className="shrink-0 p-0.5">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={() => applyFilters()}
            className="flex items-center gap-2 h-10 sm:h-11 px-3 sm:px-4 bg-primary text-white text-sm font-semibold rounded-lg transition-all active:scale-95 shrink-0"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 border border-input rounded-lg bg-background shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile filter drawer */}
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
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-60 shrink-0">
          <div className="sticky top-[7.5rem] bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold mb-4">Filters</h3>
            <FiltersContent />
          </div>
        </aside>

        {/* Results */}
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
                  <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-medium">{p.title}</p>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    className="h-10 px-4 border border-input rounded-lg text-sm disabled:opacity-50 transition-colors"
                    disabled={urlFilters.page <= 1}
                    onClick={() => applyFilters({ page: urlFilters.page - 1 })}
                  >
                    Previous
                  </button>
                  <span className="flex items-center text-sm text-muted-foreground px-3">
                    Page {urlFilters.page} of {totalPages}
                  </span>
                  <button
                    className="h-10 px-4 border border-input rounded-lg text-sm disabled:opacity-50 transition-colors"
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