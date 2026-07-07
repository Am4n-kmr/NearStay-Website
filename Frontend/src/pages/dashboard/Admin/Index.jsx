import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, Building2, AlertTriangle, CheckCircle2, TrendingUp, Shield
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import DashboardLayout from "../../../components/DashboardLayout";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const stats = [
    { label: "Total Users", value: 0, icon: Users, color: "text-blue-500" },
    { label: "Total Properties", value: 0, icon: Building2, color: "text-primary" },
    { label: "Pending Approvals", value: 0, icon: Shield, color: "text-amber-500" },
    { label: "Open Complaints", value: 0, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage the NearStay platform</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="text-2xl font-bold">{value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Pending Property Approvals</h2>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No pending approvals</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Recent Complaints</h2>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No open complaints</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}