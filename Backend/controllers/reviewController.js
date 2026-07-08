import Review from "../models/reviewModel.js";
import Property from "../models/propertyModel.js";

// Add or update a review for a property
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const propertyId = req.params.propertyId;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Upsert review (one per user per property)
    const review = await Review.findOneAndUpdate(
      { property: propertyId, user: req.user.userId },
      { rating, comment },
      { upsert: true, new: true, runValidators: true }
    );

    // Recalculate average rating
    const stats = await Review.aggregate([
      { $match: { property: property._id } },
      { $group: { _id: "$property", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      property.reviewRating = Math.round(stats[0].avgRating * 10) / 10;
      property.reviewCount = stats[0].count;
      await property.save();
    }

    res.status(201).json(review);
  } catch (error) {
    console.error("addReview error:", error);
    res.status(500).json({ message: "Server error submitting review" });
  }
};

// Get reviews for a property
export const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate("user", "fullName profileImage")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("getPropertyReviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a review (user or admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const propertyId = review.property;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average
    const stats = await Review.aggregate([
      { $match: { property: propertyId } },
      { $group: { _id: "$property", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const property = await Property.findById(propertyId);
    if (property) {
      if (stats.length > 0) {
        property.reviewRating = Math.round(stats[0].avgRating * 10) / 10;
        property.reviewCount = stats[0].count;
      } else {
        property.reviewRating = 0;
        property.reviewCount = 0;
      }
      await property.save();
    }

    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};