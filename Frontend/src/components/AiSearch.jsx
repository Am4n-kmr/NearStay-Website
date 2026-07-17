import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Search, X, Loader2, Star, MapPin, Building2, ShieldCheck } from "lucide-react";
import { aiApi } from "../lib/api";

const EXAMPLE_QUERIES = [
  "I need a boys PG under ₹7000 near NSEC with WiFi and AC",
  "Looking for a girls PG with WiFi and attached bathroom",
  "Single room under ₹8500 with AC",
  "Vegetarian PG near college with parking",
  "PG under ₹6000 with WiFi and food included",
];

const fallbackImg =
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=600&fit=crop";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-40 sm:h-48 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="flex gap-2 mt-2">
          <div className="h-3 bg-muted rounded w-1/4" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
        <div className="h-8 bg-muted rounded w-full mt-3" />
      </div>
    </div>
  );
}

function MatchBar({ score }) {
  const color =
    score >= 90 ? "bg-emerald-500" :
    score >= 75 ? "bg-green-500" :
    score >= 60 ? "bg-amber-500" :
    score >= 40 ? "bg-orange-500" :
    "bg-red-500";

  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-foreground min-w-[3ch] text-right">
        {score}%
      </span>
    </div>
  );
}

function PropertyCard({ property }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-card overflow-hidden group animate-fade-in-up">
      <div className="h-40 sm:h-48 overflow-hidden bg-muted relative">
        <img
          src={property.images?.[0] || fallbackImg}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => { e.target.src = fallbackImg; }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-white/90 text-foreground font-medium capitalize shadow-sm">
            {property.propertyType}
          </span>
          {property.matchScore >= 90 && (
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/90 text-white font-medium shadow-sm">
              Best Match
            </span>
          )}
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
          ) : property.genderPreference === "any" ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/90 text-white font-medium">
              Co-ed
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm line-clamp-1 flex-1">
            {property.title}
          </h3>
        </div>
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

        <MatchBar score={property.matchScore} />

        {property.recommendations?.length > 0 && (
          <div className="mb-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Recommended because
            </p>
            <ul className="space-y-0.5">
              {property.recommendations.map((reason, i) => (
                <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                  <span className="text-primary shrink-0 mt-0.5">✓</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-base font-bold text-primary">
              ₹{property.rent?.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
          {property.isApproved && (
            <ShieldCheck className="h-4 w-4 text-emerald-500" title="Verified" />
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => navigate(`/property/${property._id}`)}
            className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95"
          >
            View Details
          </button>
          <button
            onClick={() => navigate(`/property/${property._id}?book=true`)}
            className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-all active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AiSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExamples, setShowExamples] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = useCallback(async (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    setShowExamples(false);

    try {
      const data = await aiApi.search(finalQuery.trim());
      setResults(data);
    } catch (err) {
      console.error("AI Search error:", err);
      if (err.response?.status === 400) {
        setError("Please enter a valid search query.");
      } else if (err.response?.status === 429) {
        setError("Too many requests. Please wait a moment.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === "Network Error") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Search failed. Please try again.");
      }
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [query, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleExampleClick = (example) => {
    setQuery(example);
    setShowExamples(false);
    handleSearch(example);
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setError(null);
    setSearchPerformed(false);
    setShowExamples(true);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-left">
      {/* AI Search Input */}
      <div className="relative">
        <div
          className="relative flex items-center gap-2 bg-white dark:bg-white/10 backdrop-blur-lg rounded-2xl p-1.5 shadow-lg border-2 transition-all duration-300"
          style={{
            borderColor: loading
              ? "rgba(99, 102, 241, 0.5)"
              : "rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5">
            <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-300 shrink-0 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              placeholder='Ask naturally... "I need a PG under ₹7000 near NSEC"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm outline-none min-w-0 disabled:opacity-50"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:scale-100 shrink-0 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search with AI</span>
                <span className="sm:hidden">Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Example queries */}
      {showExamples && !searchPerformed && (
        <div className="mt-4 animate-fade-in-up text-center">
          <p className="text-muted-foreground text-xs mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_QUERIES.map((example, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105 active:scale-95"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status message - only show warnings/errors, not generic success messages */}
      {results && results.message && results.message !== "AI recommendations" && results.message !== "AI recommendations (cached)" && results.message !== "Showing matching properties" && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-200 text-xs">
          {results.message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-200 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => handleSearch()}
            className="text-xs font-semibold px-3 py-1 rounded-lg bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
            <p className="text-muted-foreground text-sm">Searching properties with AI...</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="mt-6 animate-fade-in">
          {results.properties?.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <p className="text-muted-foreground text-sm">
                    Found <span className="font-bold text-foreground">{results.properties.length}</span> matching properties
                  </p>
                </div>
                <button
                  onClick={clearSearch}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  New search
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.properties.map((property, i) => (
                  <div
                    key={property._id}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-foreground/70 text-sm font-medium mb-2">
                No matching property found
              </p>
              <p className="text-muted-foreground text-xs mb-4">
                Try increasing your budget or removing some requirements
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setResults(null);
                  setSearchPerformed(false);
                  setShowExamples(true);
                }}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                Try a different search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}