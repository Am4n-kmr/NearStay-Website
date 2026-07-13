import Property from "../models/propertyModel.js";
import Notification from "../models/notificationModel.js";

// Get all properties with filtering and search
export const getProperties = async (req, res) => {
  try {
    const {
      q,
      city,
      propertyType,
      gender,
      minRent,
      maxRent,
      amenities,
      isApproved,
      page = 1,
      limit = 12,
      sortBy = "newest",
    } = req.query;

    const filter = {};

    // Text search
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (city) filter.city = { $regex: city, $options: "i" };
    if (propertyType) filter.propertyType = propertyType;
    if (gender) filter.genderPreference = gender;
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = parseInt(minRent);
      if (maxRent) filter.rent.$lte = parseInt(maxRent);
    }
    if (amenities) {
      const amenityList = amenities.split(",");
      filter.amenities = { $all: amenityList };
    }

    // By default only show approved & available properties for public
    if (isApproved === undefined && !req.user?.role?.includes("admin")) {
      filter.isApproved = true;
      filter.isAvailable = true;
    }

    // Sort
    let sort = {};
    switch (sortBy) {
      case "rent_asc":
        sort = { rent: 1 };
        break;
      case "rent_desc":
        sort = { rent: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .populate("owner", "fullName email phone profileImage")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      properties,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("getProperties error:", error);
    res.status(500).json({ message: "Server error fetching properties" });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "fullName email phone profileImage"
    );
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    console.error("getPropertyById error:", error);
    res.status(500).json({ message: "Server error fetching property" });
  }
};

// Create a new property (owner only)
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      genderPreference,
      address,
      city,
      state,
      pincode,
      rent,
      securityDeposit,
      availableRooms,
      maxPeople,
      amenities,
      images,
    } = req.body;

    const property = new Property({
      owner: req.user.userId,
      title,
      description,
      propertyType,
      genderPreference,
      address,
      city,
      state,
      pincode,
      rent,
      securityDeposit,
      availableRooms,
      maxPeople,
      amenities,
      images,
    });

    const saved = await property.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("createProperty error:", error);
    res.status(500).json({ message: "Server error creating property" });
  }
};

// Update a property (owner only)
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    if (property.owner.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    console.error("updateProperty error:", error);
    res.status(500).json({ message: "Server error updating property" });
  }
};

// Delete a property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    if (property.owner.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted" });
  } catch (error) {
    console.error("deleteProperty error:", error);
    res.status(500).json({ message: "Server error deleting property" });
  }
};

// Get properties for a specific owner
export const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(properties);
  } catch (error) {
    console.error("getOwnerProperties error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: approve/reject property
export const approveProperty = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    // Notify owner
    const notification = new Notification({
      user: property.owner,
      title: isApproved ? "Property Approved" : "Property Rejected",
      message: `Your property "${property.title}" has been ${
        isApproved ? "approved" : "rejected"
      }.`,
      type: "verification",
    });
    await notification.save();

    res.json(property);
  } catch (error) {
    console.error("approveProperty error:", error);
    res.status(500).json({ message: "Server error" });
  }
};