import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, Edit, Trash2, Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { propertyApi } from "../../../lib/api";
import { toast } from "sonner";

export default function OwnerProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyApi.getMyProperties();
      setProperties(data);
    } catch (err) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await propertyApi.delete(id);
      toast.success("Property deleted");
      fetchProperties();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <DashboardLayout title="My Properties">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">My Properties</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your listed properties</p>
          </div>
          <Link to="/dashboard/owner/properties/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No properties listed</p>
            <p className="text-xs mt-1">List your first property to start receiving bookings</p>
            <Link to="/dashboard/owner/properties/new">
              <Button size="sm" className="mt-4 gap-1.5">
                <Plus className="h-4 w-4" /> Add Property
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => (
              <div key={p._id} className="dashboard-card dashboard-card-hover overflow-hidden">
                {p.images?.[0] && (
                  <img src={p.images[0]} alt={p.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{p.title}</h3>
                      <p className="text-xs text-muted-foreground">{p.city}, {p.state}</p>
                    </div>
                    <div>
                      {p.isApproved ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>₹{p.rent}/mo</span>
                    <span>•</span>
                    <span>{p.propertyType}</span>
                    <span>•</span>
                    <span>{p.availableRooms} rooms</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Link to={`/property/${p._id}`}>
                      <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                    </Link>
                    <Link to={`/dashboard/owner/properties/${p._id}/edit`}>
                      <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p._id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}