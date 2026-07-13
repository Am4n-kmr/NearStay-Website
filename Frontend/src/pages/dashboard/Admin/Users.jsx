import { useState, useEffect } from "react";
import { User, UserCheck, UserX } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { adminApi } from "../../../lib/api";
import { toast } from "sonner";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const data = await adminApi.getUsers(params);
      setUsers(data.users || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleToggleBlock = async (userId) => {
    try {
      const data = await adminApi.toggleBlock(userId);
      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to toggle user status");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminApi.changeRole(userId, newRole);
      toast.success("Role updated");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage platform users</p>
          </div>
          <div className="flex gap-2">
            {["", "student", "owner", "admin"].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${roleFilter === r ? "bg-primary text-white border-primary" : "bg-background border-border"}`}>
                {r || "All"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="dashboard-card dashboard-card-hover overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Role</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{u.fullName?.charAt(0)}</span>
                          </div>
                          <span className="font-medium">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u._id, e.target.value)}
                          className="text-xs bg-background border border-border rounded-lg px-2 py-1"
                        >
                          <option value="student">Student</option>
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {u.isBlocked ? (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <UserX className="h-3 w-3" /> Blocked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <UserCheck className="h-3 w-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant={u.isBlocked ? "outline" : "destructive"}
                          size="sm"
                          className="text-xs"
                          onClick={() => handleToggleBlock(u._id)}
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}