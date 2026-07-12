import Booking from "../models/bookingModel.js";
import Property from "../models/propertyModel.js";
import Complaint from "../models/complaintModel.js";
import Notification from "../models/notificationModel.js";
import { Chat, Message } from "../models/chatModel.js";
import User from "../models/userModel.js";

// ─── Student Dashboard Stats ───
export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's chat IDs
    const userChats = await Chat.find({ participants: userId }).select("_id");
    const chatIds = userChats.map(c => c._id);

    const [
      totalBookings,
      activeBookings,
      pendingBookings,
      cancelledBookings,
      completedBookings,
      unreadNotifications,
      pendingComplaints,
      unreadMessages,
    ] = await Promise.all([
      Booking.countDocuments({ tenant: userId }),
      Booking.countDocuments({ tenant: userId, status: "confirmed" }),
      Booking.countDocuments({ tenant: userId, status: "pending" }),
      Booking.countDocuments({ tenant: userId, status: "cancelled" }),
      Booking.countDocuments({ tenant: userId, status: "completed" }),
      Notification.countDocuments({ user: userId, isRead: false }),
      Complaint.countDocuments({ user: userId, status: "open" }),
      Message.countDocuments({ chat: { $in: chatIds }, sender: { $ne: userId }, isRead: false }),
    ]);

    // Recent bookings
    const recentBookings = await Booking.find({ tenant: userId })
      .populate("property", "title images city")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent notifications
    const recentNotifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalBookings,
      activeBookings,
      pendingBookings,
      cancelledBookings,
      completedBookings,
      unreadNotifications,
      pendingComplaints,
      unreadMessages,
      recentBookings,
      recentNotifications,
    });
  } catch (error) {
    console.error("getStudentDashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

  // ─── Owner Dashboard Stats ───
export const getOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's chat IDs
    const userChats = await Chat.find({ participants: userId }).select("_id");
    const chatIds = userChats.map(c => c._id);

    const [
      totalProperties,
      activeListings,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      unreadNotifications,
      pendingComplaints,
      unreadMessages,
    ] = await Promise.all([
      Property.countDocuments({ owner: userId }),
      Property.countDocuments({ owner: userId, isAvailable: true, isApproved: true }),
      Booking.countDocuments({ owner: userId }),
      Booking.countDocuments({ owner: userId, status: "pending" }),
      Booking.countDocuments({ owner: userId, status: "confirmed" }),
      Notification.countDocuments({ user: userId, isRead: false }),
      Complaint.countDocuments({ owner: userId, status: "open" }),
      Message.countDocuments({ chat: { $in: chatIds }, sender: { $ne: userId }, isRead: false }),
    ]);

    // Total revenue from confirmed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { owner: userId, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Available rooms across all properties
    const properties = await Property.find({ owner: userId });
    const availableRooms = properties.reduce((sum, p) => sum + (p.availableRooms || 0), 0);

    // Recent bookings
    const recentBookings = await Booking.find({ owner: userId })
      .populate("property", "title images city")
      .populate("tenant", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent notifications
    const recentNotifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalProperties,
      activeListings,
      availableRooms,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      unreadNotifications,
      pendingComplaints,
      unreadMessages,
      recentBookings,
      recentNotifications,
    });
  } catch (error) {
    console.error("getOwnerDashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Admin Dashboard Stats (enhanced) ───
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalOwners,
      totalProperties,
      approvedProperties,
      pendingProperties,
      totalBookings,
      activeBookings,
      pendingComplaints,
      totalPayments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ["student", "tenant"] } }),
      User.countDocuments({ role: "owner" }),
      Property.countDocuments(),
      Property.countDocuments({ isApproved: true }),
      Property.countDocuments({ isApproved: false }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Complaint.countDocuments({ status: "open" }),
      Booking.countDocuments({ paymentStatus: "paid" }),
    ]);

    // Total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent registrations
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent properties
    const recentProperties = await Property.find()
      .populate("owner", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate("property", "title")
      .populate("tenant", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent complaints
    const recentComplaints = await Complaint.find()
      .populate("user", "fullName")
      .populate("property", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalStudents,
      totalOwners,
      totalProperties,
      approvedProperties,
      pendingProperties,
      totalBookings,
      activeBookings,
      totalRevenue,
      pendingComplaints,
      totalPayments,
      recentUsers,
      recentProperties,
      recentBookings,
      recentComplaints,
    });
  } catch (error) {
    console.error("getAdminDashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};