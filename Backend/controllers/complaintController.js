import Complaint from "../models/complaintModel.js";
import Property from "../models/propertyModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

// File a complaint (tenant)
export const createComplaint = async (req, res) => {
  try {
    const { propertyId, category, title, description, images } = req.body;

    const complaint = new Complaint({
      complainant: req.user.userId,
      property: propertyId || null,
      category,
      title,
      description,
      images: images || [],
    });

    const saved = await complaint.save();

    // Notify property owner if complaint is about a property
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (property) {
        const ownerNotification = new Notification({
          user: property.owner,
          title: "New Complaint Filed",
          message: `A complaint has been filed for your property "${property.title}": ${title}`,
          type: "complaint",
          link: `/dashboard/owner/complaints/${saved._id}`,
        });
        await ownerNotification.save();
      }
    }

    // Notify admins
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      const adminNotification = new Notification({
        user: admin._id,
        title: "New Complaint Filed",
        message: `New ${category} complaint: ${title}`,
        type: "complaint",
        link: `/dashboard/admin/complaints/${saved._id}`,
      });
      await adminNotification.save();
    }

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

// Update complaint status (admin or owner)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    // Check authorization - admin or property owner
    if (req.user.role !== "admin") {
      const property = await Property.findById(complaint.property);
      if (!property || property.owner.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    complaint.status = status;
    if (resolution) complaint.resolution = resolution;
    if (status === "resolved" || status === "closed") {
      complaint.resolvedBy = req.user.userId;
    }
    await complaint.save();

    // Notify complainant
    const notification = new Notification({
      user: complaint.complainant,
      title: `Complaint ${status.replace('_', ' ')}`,
      message: `Your complaint "${complaint.title}" has been marked as ${status.replace('_', ' ')}.`,
      type: "complaint",
      link: `/dashboard/student/complaints/${complaint._id}`,
    });
    await notification.save();

    res.json(complaint);
  } catch (error) {
    console.error("updateComplaintStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Owner reply to complaint
export const replyToComplaint = async (req, res) => {
  try {
    const { reply } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    // Check if user is property owner or admin
    if (req.user.role !== "admin") {
      const property = await Property.findById(complaint.property);
      if (!property || property.owner.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    complaint.ownerReply = reply;
    complaint.repliedAt = new Date();
    await complaint.save();

    // Notify complainant
    const notification = new Notification({
      user: complaint.complainant,
      title: "Owner Replied to Your Complaint",
      message: `The owner has replied to your complaint: "${complaint.title}"`,
      type: "complaint",
      link: `/dashboard/student/complaints/${complaint._id}`,
    });
    await notification.save();

    res.json(complaint);
  } catch (error) {
    console.error("replyToComplaint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
