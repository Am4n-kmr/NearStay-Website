import Booking from "../models/bookingModel.js";
import Property from "../models/propertyModel.js";
import Notification from "../models/notificationModel.js";

// Create a booking (tenant only)
export const createBooking = async (req, res) => {
  try {
    const { propertyId, moveInDate, durationMonths, notes } = req.body;

    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    if (!property.isAvailable)
      return res.status(400).json({ message: "Property not available" });
    if (property.availableRooms < 1)
      return res.status(400).json({ message: "No rooms available" });

    const monthlyRent = property.rent;
    const securityDeposit = property.securityDeposit;
    const totalAmount = monthlyRent * durationMonths + securityDeposit;

    const booking = new Booking({
      tenant: req.user.userId,
      owner: property.owner,
      property: propertyId,
      moveInDate,
      durationMonths: durationMonths || 1,
      monthlyRent,
      securityDeposit,
      totalAmount,
      notes,
    });

    const saved = await booking.save();

    // Decrement available rooms
    property.availableRooms -= 1;
    if (property.availableRooms <= 0) property.isAvailable = false;
    await property.save();

    // Notify owner
    const notification = new Notification({
      user: property.owner,
      title: "New Booking",
      message: `A new booking has been made for "${property.title}".`,
      type: "booking",
      link: `/dashboard/owner/bookings/${saved._id}`,
    });
    await notification.save();

    res.status(201).json(saved);
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ message: "Server error creating booking" });
  }
};

// Get bookings for current user
export const getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { tenant: req.user.userId };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("property", "title address city images")
      .populate("owner", "fullName email phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("getMyBookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get bookings for owner's properties
export const getOwnerBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { owner: req.user.userId };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("property", "title address city images")
      .populate("tenant", "fullName email phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("getOwnerBookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single booking
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("property")
      .populate("tenant", "fullName email phone profileImage")
      .populate("owner", "fullName email phone profileImage");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    // Only tenant, owner, or admin can view
    if (
      booking.tenant._id.toString() !== req.user.userId &&
      booking.owner._id.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (error) {
    console.error("getBookingById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update booking status (owner or admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate("property");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (
      booking.owner.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    // Notify tenant
    const notification = new Notification({
      user: booking.tenant,
      title: `Booking ${status}`,
      message: `Your booking for "${booking.property.title}" has been ${status}.`,
      type: "booking",
      link: `/dashboard/student/bookings/${booking._id}`,
    });
    await notification.save();

    res.json(booking);
  } catch (error) {
    console.error("updateBookingStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel booking (tenant or admin)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("property");
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (
      booking.tenant.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Restore available rooms
    const property = await Property.findById(booking.property);
    if (property) {
      property.availableRooms += 1;
      property.isAvailable = true;
      await property.save();
    }

    res.json(booking);
  } catch (error) {
    console.error("cancelBooking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate("property", "title city")
      .populate("tenant", "fullName email")
      .populate("owner", "fullName email")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ bookings, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("getAllBookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};