import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
};

// ─── Notifications ───
export const notificationApi = {
  getMyNotifications: () => api.get("/notifications").then((r) => r.data),
  getUnreadCount: () => api.get("/notifications/unread-count").then((r) => r.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};

export default api;