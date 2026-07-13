import Wishlist from "../models/wishlistModel.js";
import Property from "../models/propertyModel.js";

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ user: req.user.userId })
      .populate("property")
      .sort({ createdAt: -1 });
    
    res.json(wishlistItems);
  } catch (error) {
    console.error("getWishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add property to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const wishlistItem = new Wishlist({
      user: req.user.userId,
      property: propertyId,
    });

    const saved = await wishlistItem.save();
    await saved.populate("property");

    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Property already in wishlist" });
    }
    console.error("addToWishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove property from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    await Wishlist.findOneAndDelete({
      user: req.user.userId,
      property: propertyId,
    });

    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if property is in wishlist
export const checkWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const item = await Wishlist.findOne({
      user: req.user.userId,
      property: propertyId,
    });

    res.json({ isInWishlist: !!item });
  } catch (error) {
    console.error("checkWishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};