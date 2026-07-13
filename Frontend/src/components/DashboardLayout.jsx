import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Heart,
  AlertTriangle,
  UserCircle2,
  LogOut,
  Building2,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getDashboardBasePath } from "../lib/dashboard";

const studentNavItems = (base) => [
  { label: "Dashboard", href: base, icon: LayoutDashboard },
  { label: "My Bookings", href: `${base}/bookings`, icon: Calendar },
  { label: "Messages", href: `${base}/messages`, icon: MessageSquare },
  { label: "Wishlist", href: `${base}/wishlist`, icon: Heart },
  { label: "Complaints", href: `${base}/complaints`, icon: AlertTriangle },
  { label: "Profile", href: `${base}/profile`, icon: UserCircle2 },
];

const ownerNavItems = (base) => [
  { label: "Dashboard", href: base, icon: LayoutDashboard },
  { label: "My Properties", href: `${base}/properties`, icon: Building2 },
  { label: "Bookings", href: `${base}/bookings`, icon: Calendar },
  { label: "Messages", href: `${base}/messages`, icon: MessageSquare },
  { label: "Complaints", href: `${base}/complaints`, icon: AlertTriangle },
  { label: "Profile", href: `${base}/profile`, icon: UserCircle2 },
];

const adminNavItems = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "All Properties", href: "/dashboard/admin/properties", icon: Building2 },
  { label: "Users", href: "/dashboard/admin/users", icon: UserCircle2 },
  { label: "Bookings", href: "/dashboard/admin/bookings", icon: Calendar },
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
  const dashboardBase = getDashboardBasePath(role);
  const navItems = useMemo(() => {
    if (role === "admin") return adminNavItems;
    if (role === "owner") return ownerNavItems(dashboardBase);
    return studentNavItems(dashboardBase);
  }, [role, dashboardBase]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0 bg-background/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary shadow-soft flex items-center justify-center">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-sm"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-3 border-t border-border space-y-2 bg-background/80 rounded-2xl">
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/40 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shadow-sm">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-sm transition-colors duration-200"
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
      <aside className="hidden md:flex md:w-60 lg:w-64 flex-col border-r border-border bg-card shadow-soft shrink-0">
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
        <header className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-card shadow-soft sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 bg-muted/70 hover:bg-muted transition-colors duration-200">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            {title && (
              <h1 className="font-semibold text-sm truncate">{title}</h1>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}