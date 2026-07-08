import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import SearchPage from "./pages/Search";
import PropertyDetailPage from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";

import StudentDashboard from "./pages/dashboard/Student/Index";
import StudentBookings from "./pages/dashboard/Student/Bookings";
import StudentComplaints from "./pages/dashboard/Student/Complaints";
import StudentMessages from "./pages/dashboard/Student/Messages";
import StudentProfile from "./pages/dashboard/Student/Profile";
import StudentWishlist from "./pages/dashboard/Student/Wishlist";

import OwnerDashboard from "./pages/dashboard/Owner/Index";
import OwnerBookings from "./pages/dashboard/Owner/Bookings";
import OwnerComplaints from "./pages/dashboard/Owner/Complaints";
import OwnerMessages from "./pages/dashboard/Owner/Messages";
import OwnerProfile from "./pages/dashboard/Owner/Profile";
import OwnerProperties from "./pages/dashboard/Owner/Properties";
import OwnerAddProperty from "./pages/dashboard/Owner/AddProperty";
import OwnerEditProperty from "./pages/dashboard/Owner/EditProperty";

import AdminDashboard from "./pages/dashboard/Admin/Index";
import AdminUsers from "./pages/dashboard/Admin/Users";

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />

          {/* Student Dashboard */}
          <Route path="/dashboard/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/student/bookings" element={<ProtectedRoute><StudentBookings /></ProtectedRoute>} />
          <Route path="/dashboard/student/complaints" element={<ProtectedRoute><StudentComplaints /></ProtectedRoute>} />
          <Route path="/dashboard/student/messages" element={<ProtectedRoute><StudentMessages /></ProtectedRoute>} />
          <Route path="/dashboard/student/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
          <Route path="/dashboard/student/wishlist" element={<ProtectedRoute><StudentWishlist /></ProtectedRoute>} />

          {/* Owner Dashboard */}
          <Route path="/dashboard/owner" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/owner/bookings" element={<ProtectedRoute><OwnerBookings /></ProtectedRoute>} />
          <Route path="/dashboard/owner/complaints" element={<ProtectedRoute><OwnerComplaints /></ProtectedRoute>} />
          <Route path="/dashboard/owner/messages" element={<ProtectedRoute><OwnerMessages /></ProtectedRoute>} />
          <Route path="/dashboard/owner/profile" element={<ProtectedRoute><OwnerProfile /></ProtectedRoute>} />
          <Route path="/dashboard/owner/properties" element={<ProtectedRoute><OwnerProperties /></ProtectedRoute>} />
          <Route path="/dashboard/owner/properties/new" element={<ProtectedRoute><OwnerAddProperty /></ProtectedRoute>} />
          <Route path="/dashboard/owner/properties/:id/edit" element={<ProtectedRoute><OwnerEditProperty /></ProtectedRoute>} />

          {/* Admin Dashboard */}
          <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default App;