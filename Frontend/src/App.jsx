import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./hooks/use-auth";

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
import AdminProperties from "./pages/dashboard/Admin/Properties";
import AdminBookings from "./pages/dashboard/Admin/Bookings";
import AdminComplaints from "./pages/dashboard/Admin/Complaints";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />

            {/* Student Dashboard */}
            <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/student/bookings" element={<ProtectedRoute allowedRoles={["student"]}><StudentBookings /></ProtectedRoute>} />
            <Route path="/dashboard/student/complaints" element={<ProtectedRoute allowedRoles={["student"]}><StudentComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/student/messages" element={<ProtectedRoute allowedRoles={["student"]}><StudentMessages /></ProtectedRoute>} />
            <Route path="/dashboard/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />
            <Route path="/dashboard/student/wishlist" element={<ProtectedRoute allowedRoles={["student"]}><StudentWishlist /></ProtectedRoute>} />

            {/* Owner Dashboard */}
            <Route path="/dashboard/owner" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/owner/bookings" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerBookings /></ProtectedRoute>} />
            <Route path="/dashboard/owner/complaints" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/owner/messages" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerMessages /></ProtectedRoute>} />
            <Route path="/dashboard/owner/profile" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerProfile /></ProtectedRoute>} />
            <Route path="/dashboard/owner/properties" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerProperties /></ProtectedRoute>} />
            <Route path="/dashboard/owner/properties/new" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerAddProperty /></ProtectedRoute>} />
            <Route path="/dashboard/owner/properties/:id/edit" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerEditProperty /></ProtectedRoute>} />

            {/* Admin Dashboard */}
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/dashboard/admin/properties" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProperties /></ProtectedRoute>} />
            <Route path="/dashboard/admin/bookings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminBookings /></ProtectedRoute>} />
            <Route path="/dashboard/admin/complaints" element={<ProtectedRoute allowedRoles={["admin"]}><AdminComplaints /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
