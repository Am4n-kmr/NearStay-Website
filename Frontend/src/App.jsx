import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import SearchPage from "./pages/Search";
import PropertyDetailPage from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";

import StudentDashboard from "./pages/dashboard/student/Index";
import OwnerDashboard from "./pages/dashboard/owner/Index";
import AdminDashboard from "./pages/dashboard/admin/Index";

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

          <Route path="/dashboard/student" element={
            <ProtectedRoute><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/owner" element={
            <ProtectedRoute><OwnerDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default App;