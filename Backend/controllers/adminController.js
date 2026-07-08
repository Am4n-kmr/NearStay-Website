import User from "../models/userModel.js";
import Property from "../models/propertyModel.js";
import Booking from "../models/bookingModel.js";
import Complaint from "../models/complaintModel.js";

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const pendingApprovals = await Property.countDocuments({ isApproved: false });
    const openComplaints = await Complaint.countDocuments({ status: "open" });
    const totalBookings = await Booking.countDocuments();

    res.json({
      totalUsers,
      totalProperties,
      pendingApprovals,
      openComplaints,
      totalBookings,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle block/unblock user
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}`, user });
  } catch (error) {
    console.error("toggleBlockUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Change user role
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ message: "User role updated", user });
  } catch (error) {
    console.error("changeUserRole error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pending properties for admin
export const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: false })
      .populate("owner", "fullName email phone")
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error("getPendingProperties error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve/reject property (with role check)
export const moderateProperty = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved, isAvailable: isApproved ? true : false },
      { new: true }
    ).populate("owner", "fullName email");

    if (!property) return res.status(404).json({ message: "Property not found" });

    // Notify owner
    const Notification = (await import("../models/notificationModel.js")).default;
    const notification = new Notification({
      user: property.owner,
      title: isApproved ? "Property Approved" : "Property Rejected",
      message: `Your property "${property.title}" has been ${isApproved ? "approved" : "rejected"}.`,
      type: "verification",
    });
    await notification.save();

    res.json(property);
  } catch (error) {
    console.error("moderateProperty error:", error);
    res.status(500).json({ message: "Server error" });
  }
};