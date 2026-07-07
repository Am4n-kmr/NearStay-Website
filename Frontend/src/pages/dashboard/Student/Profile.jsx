import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import DashboardLayout from "../../../components/DashboardLayout";

export default function StudentProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your personal information</p>
        </div>

        {/* Avatar section */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profileImage ?? undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              {user?.fullName?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{user?.fullName || "User"}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <div className="flex gap-1.5 mt-1.5">
              <Badge variant="secondary" className="text-xs capitalize">{user?.role || "student"}</Badge>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Personal Information</h2>

          <div className="space-y-1.5">
            <Label>Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={user?.fullName || ""} readOnly className="pl-9 bg-muted cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={user?.email || ""} readOnly className="pl-9 bg-muted cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={user?.phone || "Not provided"} readOnly className="pl-9 bg-muted cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Account type</Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student"} readOnly className="pl-9 bg-muted cursor-not-allowed" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}