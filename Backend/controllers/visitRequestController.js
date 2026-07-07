import VisitRequest from "../models/visitRequestModel.js";
import Property from "../models/propertyModel.js";
import Notification from "../models/notificationModel.js";

// Create a visit request (tenant)
export const createVisitRequest = async (req, res) => {
  try {
    const { propertyId, requestedDate, timeSlot, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    const visitRequest = new VisitRequest({
      tenant: req.user.userId,
      owner: property.owner,
      property: propertyId,
      requestedDate,
      timeSlot,
      message,
    });

    const saved = await visitRequest.save();

    // Notify owner
    const notification = new Notification({
      user: property.owner,
      title: "New Visit Request",
      message: `A visit request has been made for "${property.title}" on ${new Date(
        requestedDate
      ).toLocaleDateString()}.`,
      type: "visit",
      link: `/dashboard/owner/visits`,
    });
    await notification.save();

    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Visit request already exists for this time slot" });
    }
    console.error("createVisitRequest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get visit requests for current tenant
export const getMyVisitRequests = async (req, res) => {
  try {
    const requests = await VisitRequest.find({ tenant: req.user.userId })
      .populate("property", "title address city images")
      .populate("owner", "fullName email phone")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("getMyVisitRequests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get visit requests for owner's properties
export const getOwnerVisitRequests = async (req, res) => {
  try {
    const requests = await VisitRequest.find({ owner: req.user.userId })
      .populate("property", "title address city images")
      .populate("tenant", "fullName email phone")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("getOwnerVisitRequests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update visit request status (owner)
export const updateVisitRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const visit = await VisitRequest.findById(req.params.id).populate(
      "property",
      "title"
    );

    if (!visit) return res.status(404).json({ message: "Visit not found" });
    if (visit.owner.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    visit.status = status;
    await visit.save();

    // Notify tenant
    const notification = new Notification({
      user: visit.tenant,
      title: `Visit ${status}`,
      message: `Your visit request for "${visit.property.title}" has been ${status}.`,
      type: "visit",
    });
    await notification.save();

    res.json(visit);
  } catch (error) {
    console.error("updateVisitRequestStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel visit request (tenant)
export const cancelVisitRequest = async (req, res) => {
  try {
    const visit = await VisitRequest.findById(req.params.id);
    if (!visit) return res.status(404).json({ message: "Visit not found" });
    if (visit.tenant.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    visit.status = "cancelled";
    await visit.save();
    res.json(visit);
  } catch (error) {
    console.error("cancelVisitRequest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};