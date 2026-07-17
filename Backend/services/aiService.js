import OpenAI from "openai";

let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Parse a natural language property search query into structured JSON filters.
 * @param {string} query - The user's natural language query
 * @returns {Promise<Object>} Structured filter object
 */
export async function parseSearchQuery(query) {
  const client = getOpenAIClient();
  const prompt = `You are an intelligent search parser for a PG/hostel accommodation platform.
Convert the user's property search into structured JSON.

Extract the following fields if present:
- budget (number, max rent per month)
- gender (string: "male" for boys, "female" for girls)
- location (string: area or landmark name)
- college (string: college or university name)
- wifi (boolean)
- ac (boolean)
- food (string: "veg" or "non-veg")
- roomType (string: "single" or "shared")
- attachedBathroom (boolean)
- parking (boolean)
- washingMachine (boolean)
- balcony (boolean)
- security (boolean)
- distance (number: max distance in km)
- rating (number: minimum rating out of 5)

Return ONLY valid JSON. No explanation, no markdown, no code blocks.
If a field is missing, set it to null.

User query: "${query}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a precise JSON generator. Always return valid JSON only, no other text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);
    return sanitizeFilters(parsed);
  } catch (error) {
    console.error("AI parse error:", error.message);
    throw new Error("Failed to parse search query");
  }
}

/**
 * Sanitize and validate the parsed filters to prevent injection.
 * @param {Object} filters - Raw parsed filters from AI
 * @returns {Object} Sanitized filters
 */
function sanitizeFilters(filters) {
  const sanitized = {};

  // Only allow known fields
  const allowedFields = [
    "budget", "gender", "location", "college", "wifi", "ac", "food",
    "roomType", "attachedBathroom", "parking", "washingMachine",
    "balcony", "security", "distance", "rating",
  ];

  for (const field of allowedFields) {
    const value = filters[field];
    if (value === null || value === undefined) {
      sanitized[field] = null;
      continue;
    }

    switch (field) {
      case "budget":
      case "distance":
      case "rating":
        sanitized[field] = typeof value === "number" && value > 0 ? value : null;
        break;
      case "gender":
        sanitized[field] = ["male", "female"].includes(String(value).toLowerCase())
          ? String(value).toLowerCase()
          : null;
        break;
      case "food":
        sanitized[field] = ["veg", "non-veg"].includes(String(value).toLowerCase())
          ? String(value).toLowerCase()
          : null;
        break;
      case "roomType":
        sanitized[field] = ["single", "shared"].includes(String(value).toLowerCase())
          ? String(value).toLowerCase()
          : null;
        break;
      case "wifi":
      case "ac":
      case "attachedBathroom":
      case "parking":
      case "washingMachine":
      case "balcony":
      case "security":
        sanitized[field] = value === true || value === "true" ? true : null;
        break;
      case "location":
      case "college":
        sanitized[field] = typeof value === "string" && value.trim()
          ? value.trim().substring(0, 100)
          : null;
        break;
      default:
        sanitized[field] = null;
    }
  }

  return sanitized;
}

/**
 * Build a MongoDB query from sanitized filters.
 * @param {Object} filters - Sanitized filter object
 * @returns {Object} MongoDB query object
 */
export function buildMongoQuery(filters) {
  const query = { isApproved: true, isAvailable: true };

  if (filters.budget) {
    query.rent = { $lte: filters.budget };
  }

  if (filters.gender) {
    query.genderPreference = { $in: [filters.gender, "any"] };
  }

  if (filters.location) {
    query.$or = [
      { city: { $regex: filters.location, $options: "i" } },
      { address: { $regex: filters.location, $options: "i" } },
      { title: { $regex: filters.location, $options: "i" } },
    ];
  }

  if (filters.college) {
    if (!query.$or) {
      query.$or = [];
    }
    query.$or.push(
      { address: { $regex: filters.college, $options: "i" } },
      { title: { $regex: filters.college, $options: "i" } },
      { description: { $regex: filters.college, $options: "i" } }
    );
  }

  if (filters.wifi) {
    query.amenities = { $all: ["WiFi"] };
  }

  if (filters.ac) {
    if (query.amenities) {
      query.amenities.$all.push("AC");
    } else {
      query.amenities = { $all: ["AC"] };
    }
  }

  if (filters.food === "veg") {
    if (query.amenities) {
      query.amenities.$all.push("Vegetarian Food", "Food");
    } else {
      query.amenities = { $all: ["Vegetarian Food", "Food"] };
    }
  }

  if (filters.attachedBathroom) {
    if (query.amenities) {
      query.amenities.$all.push("Attached Bathroom");
    } else {
      query.amenities = { $all: ["Attached Bathroom"] };
    }
  }

  if (filters.parking) {
    if (query.amenities) {
      query.amenities.$all.push("Parking");
    } else {
      query.amenities = { $all: ["Parking"] };
    }
  }

  if (filters.washingMachine) {
    if (query.amenities) {
      query.amenities.$all.push("Washing Machine");
    } else {
      query.amenities = { $all: ["Washing Machine"] };
    }
  }

  if (filters.balcony) {
    if (query.amenities) {
      query.amenities.$all.push("Balcony");
    } else {
      query.amenities = { $all: ["Balcony"] };
    }
  }

  if (filters.security) {
    if (query.amenities) {
      query.amenities.$all.push("Security");
    } else {
      query.amenities = { $all: ["Security"] };
    }
  }

  if (filters.roomType === "single") {
    query.maxPeople = 1;
  } else if (filters.roomType === "shared") {
    query.maxPeople = { $gte: 2 };
  }

  return query;
}

/**
 * Calculate match score and generate recommendation reasons for a property.
 * @param {Object} property - Property document from MongoDB
 * @param {Object} filters - Sanitized filters from AI
 * @returns {Object} { matchScore, recommendations }
 */
export function calculateMatchScore(property, filters) {
  let score = 0;
  const recommendations = [];
  const totalWeight = 100;
  let availableWeight = totalWeight;

  // Budget Match (30 points)
  if (filters.budget) {
    if (property.rent <= filters.budget) {
      const budgetRatio = 1 - (property.rent / filters.budget);
      score += 30 * Math.max(0, budgetRatio);
      recommendations.push(`₹${property.rent}/month — within your ₹${filters.budget} budget`);
    } else {
      score += 5; // Partial credit for being close
      recommendations.push(`₹${property.rent}/month — slightly above your ₹${filters.budget} budget`);
    }
  } else {
    availableWeight -= 30;
  }

  // Location Match (25 points)
  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    const cityMatch = property.city?.toLowerCase().includes(locationLower);
    const addressMatch = property.address?.toLowerCase().includes(locationLower);
    const titleMatch = property.title?.toLowerCase().includes(locationLower);

    if (cityMatch || addressMatch || titleMatch) {
      score += 25;
      recommendations.push(`Located in/near ${filters.location}`);
    }
  } else {
    availableWeight -= 25;
  }

  // Distance (15 points) - approximated by location relevance
  if (filters.distance) {
    // We don't have actual distance data, so give partial credit
    score += 10;
    recommendations.push(`Within ${filters.distance}km range`);
  } else {
    availableWeight -= 15;
  }

  // Amenities Match (15 points)
  let amenityScore = 0;
  const amenityChecks = [
    { field: "wifi", label: "WiFi", keyword: "WiFi" },
    { field: "ac", label: "AC", keyword: "AC" },
    { field: "attachedBathroom", label: "Attached Bathroom", keyword: "Attached Bathroom" },
    { field: "parking", label: "Parking", keyword: "Parking" },
    { field: "washingMachine", label: "Washing Machine", keyword: "Washing Machine" },
    { field: "balcony", label: "Balcony", keyword: "Balcony" },
    { field: "security", label: "Security", keyword: "Security" },
  ];

  const propertyAmenities = (property.amenities || []).map((a) => a.toLowerCase());
  let requestedAmenities = 0;

  for (const check of amenityChecks) {
    if (filters[check.field]) {
      requestedAmenities++;
      const hasAmenity = propertyAmenities.some((a) => a.includes(check.keyword.toLowerCase()));
      if (hasAmenity) {
        amenityScore++;
        recommendations.push(`${check.label} available`);
      }
    }
  }

  if (filters.food === "veg") {
    requestedAmenities++;
    const hasVegFood = propertyAmenities.some(
      (a) => a.includes("vegetarian") || a.includes("food")
    );
    if (hasVegFood) {
      amenityScore++;
      recommendations.push("Vegetarian food available");
    }
  }

  if (requestedAmenities > 0) {
    score += (15 * amenityScore) / requestedAmenities;
  } else {
    availableWeight -= 15;
  }

  // Rating (10 points)
  if (filters.rating && property.reviewRating > 0) {
    const ratingScore = Math.min(property.reviewRating / 5, 1) * 10;
    score += ratingScore;
    if (property.reviewRating >= 4) {
      recommendations.push("Highly rated by students");
    } else if (property.reviewRating >= 3) {
      recommendations.push("Well-reviewed by residents");
    }
  } else if (property.reviewRating > 0) {
    score += (property.reviewRating / 5) * 10;
    if (property.reviewRating >= 4) {
      recommendations.push("Highly rated by students");
    }
  } else {
    availableWeight -= 10;
  }

  // Popularity (5 points)
  if (property.reviewCount > 0) {
    const popScore = Math.min(property.reviewCount / 10, 1) * 5;
    score += popScore;
    if (property.reviewCount >= 5) {
      recommendations.push("Popular among students");
    }
  } else {
    availableWeight -= 5;
  }

  // Normalize score based on available weight
  const finalScore = availableWeight > 0
    ? Math.round((score / availableWeight) * 100)
    : Math.round(score);

  return {
    matchScore: Math.min(finalScore, 100),
    recommendations: recommendations.slice(0, 6), // Max 6 reasons
  };
}