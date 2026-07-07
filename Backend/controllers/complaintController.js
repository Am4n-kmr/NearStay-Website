import Complaint from "../models/complaintModel.js";
import Notification from "../models/notificationModel.js";

// File a complaint (tenant)
export const createComplaint = async (req, res) => {
  try {
    const { propertyId, type, title, description } = req.body;

    const complaint = new Complaint({
      complainant: req.user.userId,
      property: propertyId || null,
      type,
      title,
      description,
    });

    const saved = await complaint.save();

    // Notify admins (in a real app, you'd find all admin users)
    const adminNotification = new Notification({
      user: req.user.userId, // placeholder - ideally notify all admins
      title: "New Complaint Filed",
      message: `Complaint: ${title}`,
      type: "complaint",
    });
    await adminNotification.save();

    res.status(201).json(saved);
  } catch (error) {
    console.error("createComplaint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get complaints for current user
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ complainant: req.user.userId })
      .populate("property", "title")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("getMyComplaints error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all complaints (admin)
export const getAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter)
      .populate("complainant", "fullName email phone")
      .populate("property", "title")
      .populate("resolvedBy", "fullName")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("getAllComplaints error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update complaint status (admin)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    if (resolution) complaint.resolution = resolution;
    if (status === "resolved" || status === "dismissed") {
      complaint.resolvedBy = req.user.userId;
    }
    await complaint.save();

    // Notify complainant
    const notification = new Notification({
      user: complaint.complainant,
      title: `Complaint ${status}`,
      message: `Your complaint "${complaint.title}" has been marked as ${status}.`,
      type: "complaint",
    });
    await notification.save();

    res.json(complaint);
  } catch (error) {
    console.error("updateComplaintStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};