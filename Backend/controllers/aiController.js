import Property from "../models/propertyModel.js";
import {
  parseSearchQuery,
  buildMongoQuery,
  calculateMatchScore,
} from "../services/aiService.js";

// Simple in-memory cache for repeated searches
const searchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * POST /api/ai/search
 * AI-powered property search using natural language.
 */
export async function aiSearch(req, res) {
  try {
    const { query } = req.body;

    // Validate input
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query",
      });
    }

    const trimmedQuery = query.trim().substring(0, 500);

    // Check cache first
    const cacheKey = trimmedQuery.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        message: "AI recommendations (cached)",
        filters: cached.filters,
        properties: cached.properties,
      });
    }

    // Parse query with AI
    let filters;
    try {
      filters = await parseSearchQuery(trimmedQuery);
    } catch (aiError) {
      console.error("AI service error:", aiError.message);
      // Fallback: use smart text + budget parsing
      return await smartFallbackSearch(req, res, trimmedQuery);
    }

    // Build MongoDB query from filters
    const mongoQuery = buildMongoQuery(filters);

    // Fetch matching properties
    const properties = await Property.find(mongoQuery)
      .populate("owner", "fullName email phone")
      .sort({ reviewRating: -1, reviewCount: -1 })
      .limit(20)
      .lean();

    if (!properties || properties.length === 0) {
      // Try fallback with relaxed filters
      return await smartFallbackSearch(req, res, trimmedQuery);
    }

    // Rank and score properties
    const scoredProperties = properties.map((property) => {
      const { matchScore, recommendations } = calculateMatchScore(property, filters);
      return {
        _id: property._id,
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        genderPreference: property.genderPreference,
        rent: property.rent,
        securityDeposit: property.securityDeposit,
        address: property.address,
        city: property.city,
        state: property.state,
        pincode: property.pincode,
        amenities: property.amenities,
        images: property.images,
        maxPeople: property.maxPeople,
        availableRooms: property.availableRooms,
        reviewRating: property.reviewRating,
        reviewCount: property.reviewCount,
        isApproved: property.isApproved,
        isAvailable: property.isAvailable,
        owner: property.owner,
        matchScore,
        recommendations,
      };
    });

    // Sort by match score descending
    scoredProperties.sort((a, b) => b.matchScore - a.matchScore);

    const result = {
      filters,
      properties: scoredProperties,
    };

    // Cache the result
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      filters,
      properties: scoredProperties,
    });

    // Clean old cache entries
    if (searchCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of searchCache) {
        if (now - value.timestamp > CACHE_TTL) {
          searchCache.delete(key);
        }
      }
    }

    return res.json({
      success: true,
      message: "AI recommendations",
      ...result,
    });
  } catch (error) {
    console.error("AI search error:", error);
    return res.status(500).json({
      success: false,
      message: "Search failed. Please try again.",
    });
  }
}

/**
 * Smart fallback search that handles budget keywords like "under 12000", "below 8000", etc.
 * Also does text matching on title, city, address, amenities.
 */
async function smartFallbackSearch(req, res, query) {
  try {
    // Extract budget from query (e.g., "under 12000", "below 8000", "₹7000", "7000")
    let budget = null;
    const budgetMatch = query.match(/(?:under|below|less than|upto|up to|max|budget|₹|rs\.?)\s*(\d{3,7})/i);
    if (budgetMatch) {
      budget = parseInt(budgetMatch[1], 10);
    } else {
      // Try to find any standalone number that looks like a rent amount
      const numberMatch = query.match(/\b(\d{4,6})\b/);
      if (numberMatch) {
        budget = parseInt(numberMatch[1], 10);
      }
    }

    // Build search query - filter out common stop words and short terms
    const STOP_WORDS = new Set([
      "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "and", "or",
      "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
      "do", "does", "did", "will", "would", "can", "could", "shall", "should",
      "may", "might", "i", "me", "my", "we", "our", "you", "your", "he", "she",
      "it", "its", "they", "them", "their", "this", "that", "these", "those",
      "am", "near", "need", "looking", "some", "any", "all", "each", "every",
      "no", "not", "just", "very", "too", "so", "also", "but", "if", "then",
      "else", "than", "as", "by", "from", "into", "through", "during", "before",
      "after", "above", "below", "between", "out", "off", "over", "under", "again",
      "further", "once", "here", "there", "when", "where", "why", "how", "which",
      "who", "whom", "what", "room", "pg", "hostel", "flat", "property",
    ]);

    const searchTerms = query
      .replace(/under|below|less than|upto|up to|max|budget|₹|rs\.?|\d{3,7}/gi, "")
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP_WORDS.has(t.toLowerCase()));

    const searchConditions = [];

    // Budget filter
    if (budget) {
      searchConditions.push({ rent: { $lte: budget } });
    }

    // Text search on individual terms
    for (const term of searchTerms) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      searchConditions.push({
        $or: [
          { title: regex },
          { description: regex },
          { address: regex },
          { city: regex },
          { amenities: regex },
        ],
      });
    }

    // Build the query - start with base filters
    let queryFilter = { isApproved: true, isAvailable: true };

    // If we have search conditions, combine with $and
    if (searchConditions.length > 0) {
      queryFilter.$and = searchConditions;
    }

    let properties = await Property.find(queryFilter)
      .populate("owner", "fullName email phone")
      .sort({ reviewRating: -1, reviewCount: -1 })
      .limit(20)
      .lean();

    // If no results with text search + budget, try just budget filter
    if (properties.length === 0 && budget) {
      properties = await Property.find({
        isApproved: true,
        isAvailable: true,
        rent: { $lte: budget },
      })
        .populate("owner", "fullName email phone")
        .sort({ reviewRating: -1, reviewCount: -1 })
        .limit(20)
        .lean();
    }

    // If still no results and we have budget, show all properties as suggestions
    if (properties.length === 0 && budget) {
      properties = await Property.find({
        isApproved: true,
        isAvailable: true,
      })
        .populate("owner", "fullName email phone")
        .sort({ reviewRating: -1, reviewCount: -1 })
        .limit(10)
        .lean();
    }

    const resultProperties = properties.map((p) => {
      const reasons = [];
      if (budget && p.rent <= budget) {
        reasons.push(`₹${p.rent}/month — within your budget`);
      }
      if (p.reviewRating >= 4) {
        reasons.push("Highly rated by students");
      }
      if (reasons.length === 0) {
        reasons.push("Matched your search criteria");
      }
      return {
        ...p,
        matchScore: budget && p.rent <= budget ? 70 : 50,
        recommendations: reasons,
      };
    });

    const message = properties.length > 0
      ? "Showing matching properties"
      : "No matching property found. Try a different search.";

    return res.json({
      success: true,
      message,
      filters: { query, budget },
      properties: resultProperties,
    });
  } catch (fallbackError) {
    console.error("Fallback search error:", fallbackError);
    return res.status(500).json({
      success: false,
      message: "Search failed. Please try again.",
    });
  }
}