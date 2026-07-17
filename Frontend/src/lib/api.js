import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Only redirect if not already on login/register
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authApi = {
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
};

// ─── Properties ───
export const propertyApi = {
  list: (params) => api.get("/properties", { params }).then((r) => r.data),
  getById: (id) => api.get(`/properties/${id}`).then((r) => r.data),
  create: (data) => api.post("/properties", data).then((r) => r.data),
  update: (id, data) => api.put(`/properties/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/properties/${id}`).then((r) => r.data),
  getMyProperties: () => api.get("/properties/owner/me").then((r) => r.data),
};

// ─── Bookings ───
export const bookingApi = {
  create: (data) => api.post("/bookings", data).then((r) => r.data),
  getMyBookings: (params) => api.get("/bookings/mine", { params }).then((r) => r.data),
  getOwnerBookings: (params) => api.get("/bookings/owner", { params }).then((r) => r.data),
  getById: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data).then((r) => r.data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data),
  getAll: (params) => api.get("/bookings/all", { params }).then((r) => r.data),
};

// ─── Visit Requests ───
export const visitApi = {
  create: (data) => api.post("/visits", data).then((r) => r.data),
  getMyVisits: () => api.get("/visits/mine").then((r) => r.data),
  getOwnerVisits: () => api.get("/visits/owner").then((r) => r.data),
  updateStatus: (id, data) => api.patch(`/visits/${id}/status`, data).then((r) => r.data),
  cancel: (id) => api.patch(`/visits/${id}/cancel`).then((r) => r.data),
};

// ─── Chat ───
export const chatApi = {
  getOrCreate: (data) => api.post("/chats", data).then((r) => r.data),
  getMyChats: () => api.get("/chats").then((r) => r.data),
  getMessages: (chatId) => api.get(`/chats/${chatId}/messages`).then((r) => r.data),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data).then((r) => r.data),
};

// ─── Complaints ───
export const complaintApi = {
  create: (data) => api.post("/complaints", data).then((r) => r.data),
  getMyComplaints: () => api.get("/complaints/mine").then((r) => r.data),
  getAll: (params) => api.get("/complaints/all", { params }).then((r) => r.data),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data).then((r) => r.data),
  replyToComplaint: (id, data) => api.patch(`/complaints/${id}/reply`, data).then((r) => r.data),
};

// ─── Wishlist ───
export const wishlistApi = {
  getWishlist: () => api.get("/wishlist").then((r) => r.data),
  addToWishlist: (data) => api.post("/wishlist", data).then((r) => r.data),
  removeFromWishlist: (propertyId) => api.delete(`/wishlist/${propertyId}`).then((r) => r.data),
  checkWishlist: (propertyId) => api.get(`/wishlist/check/${propertyId}`).then((r) => r.data),
};

// ─── Notifications ───
export const notificationApi = {
  getMyNotifications: () => api.get("/notifications").then((r) => r.data),
  getUnreadCount: () => api.get("/notifications/unread-count").then((r) => r.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};

// ─── Reviews ───
export const reviewApi = {
  getByProperty: (propertyId) => api.get(`/reviews/property/${propertyId}`).then((r) => r.data),
  add: (propertyId, data) => api.post(`/reviews/property/${propertyId}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
};

// ─── Payments ───
export const paymentApi = {
  createOrder: (data) => api.post("/payments/create-order", data).then((r) => r.data),
  verify: (data) => api.post("/payments/verify", data).then((r) => r.data),
  reconcile: (bookingId) => api.post(`/payments/reconcile/${bookingId}`).then((r) => r.data),
  getBookingPayments: (bookingId) => api.get(`/payments/booking/${bookingId}`).then((r) => r.data),
  getMyPayments: (params) => api.get("/payments/my-payments", { params }).then((r) => r.data),
  processRefund: (paymentId, data) => api.patch(`/payments/${paymentId}/refund`, data).then((r) => r.data),
  getAll: (params) => api.get("/payments/all", { params }).then((r) => r.data),
};

// ─── Admin ───
export const adminApi = {
  getStats: () => api.get("/admin/stats").then((r) => r.data),
  getUsers: (params) => api.get("/admin/users", { params }).then((r) => r.data),
  toggleBlock: (userId) => api.patch(`/admin/users/${userId}/block`).then((r) => r.data),
  changeRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }).then((r) => r.data),
  getPendingProperties: () => api.get("/admin/properties/pending").then((r) => r.data),
  getAllProperties: (params) => api.get("/admin/properties", { params }).then((r) => r.data),
  moderateProperty: (id, isApproved) => api.patch(`/admin/properties/${id}/moderate`, { isApproved }).then((r) => r.data),
};

// ─── Dashboard ───
export const dashboardApi = {
  student: () => api.get("/dashboard/student").then((r) => r.data),
  owner: () => api.get("/dashboard/owner").then((r) => r.data),
  admin: () => api.get("/dashboard/admin").then((r) => r.data),
};

// ─── AI Search ───
export const aiApi = {
  search: (query) => api.post("/ai/search", { query }).then((r) => r.data),
};

export default api;
