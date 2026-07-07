import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Heart,
  AlertTriangle,
  User,
  LogOut,
  Building2,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const studentNavItems = [
  { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "My Bookings", href: "/dashboard/student/bookings", icon: Calendar },
  { label: "Messages", href: "/dashboard/student/messages", icon: MessageSquare },
  { label: "Wishlist", href: "/dashboard/student/wishlist", icon: Heart },
  { label: "Complaints", href: "/dashboard/student/complaints", icon: AlertTriangle },
  { label: "Profile", href: "/dashboard/student/profile", icon: User },
];

const ownerNavItems = [
  { label: "Dashboard", href: "/dashboard/owner", icon: LayoutDashboard },
  { label: "My Properties", href: "/dashboard/owner/properties", icon: Building2 },
  { label: "Bookings", href: "/dashboard/owner/bookings", icon: Calendar },
  { label: "Messages", href: "/dashboard/owner/messages", icon: MessageSquare },
  { label: "Complaints", href: "/dashboard/owner/complaints", icon: AlertTriangle },
  { label: "Profile", href: "/dashboard/owner/profile", icon: User },
];

const adminNavItems = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Properties", href: "/dashboard/admin/properties", icon: Building2 },
  { label: "Users", href: "/dashboard/admin/users", icon: User },
  { label: "Complaints", href: "/dashboard/admin/complaints", icon: AlertTriangle },
];

export default function DashboardLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const role = user?.role || "student";
  const navItems =
    role === "admin"
      ? adminNavItems
      : role === "owner"
      ? ownerNavItems
      : studentNavItems;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-bold text-xs text-white">N</span>
          </div>
          <span className="font-bold text-base">NearStay</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 lg:w-64 flex-col border-r border-border bg-card shrink-0">
        <NavContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative bg-card w-64 h-full flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="font-bold text-xs text-white">N</span>
                </div>
                <span className="font-bold text-base">NearStay</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-card sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          {title && (
            <h1 className="font-semibold text-sm truncate">{title}</h1>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}