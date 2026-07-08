import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { propertyApi } from "../../../lib/api";
import { toast } from "sonner";

const PROPERTY_TYPES = ["PG", "Hostel", "Flat", "Room"];
const GENDER_OPTIONS = ["male", "female", "any"];
const AMENITY_OPTIONS = ["WiFi", "AC", "Food", "Laundry", "Parking", "Gym", "Power Backup", "Water Purifier", "TV", "Furnished"];

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", propertyType: "PG", genderPreference: "any",
    address: "", city: "", state: "", pincode: "",
    rent: "", securityDeposit: "", availableRooms: "1",
    amenities: [], images: [],
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const p = await propertyApi.getById(id);
        setForm({
          title: p.title || "",
          description: p.description || "",
          propertyType: p.propertyType || "PG",
          genderPreference: p.genderPreference || "any",
          address: p.address || "",
          city: p.city || "",
          state: p.state || "",
          pincode: p.pincode || "",
          rent: p.rent?.toString() || "",
          securityDeposit: p.securityDeposit?.toString() || "0",
          availableRooms: p.availableRooms?.toString() || "1",
          amenities: p.amenities || [],
          images: p.images || [],
        });
      } catch (err) {
        toast.error("Failed to load property");
        navigate("/dashboard/owner/properties");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await propertyApi.update(id, {
        ...form,
        rent: Number(form.rent),
        securityDeposit: Number(form.securityDeposit) || 0,
        availableRooms: Number(form.availableRooms),
      });
      toast.success("Property updated successfully!");
      navigate("/dashboard/owner/properties");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update property");
    } finally {
      setSaving(false);
    }
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (loading) {
    return (
      <DashboardLayout title="Edit Property">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Property">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-bold">Edit Property</h1>
            <p className="text-sm text-muted-foreground">Update your property details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <input className="w-full h-10 px-3 text-sm border rounded-lg" value={form.title} onChange={update("title")} required />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg" value={form.description} onChange={update("description")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Property Type</label>
              <select className="w-full h-10 px-3 text-sm border rounded-lg" value={form.propertyType} onChange={update("propertyType")}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Gender Preference</label>
              <select className="w-full h-10 px-3 text-sm border rounded-lg" value={form.genderPreference} onChange={update("genderPreference")}>
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <input className="w-full h-10 px-3 text-sm border rounded-lg" value={form.address} onChange={update("address")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">City</label>
              <input className="w-full h-10 px-3 text-sm border rounded-lg" value={form.city} onChange={update("city")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">State</label>
              <input className="w-full h-10 px-3 text-sm border rounded-lg" value={form.state} onChange={update("state")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pincode</label>
              <input className="w-full h-10 px-3 text-sm border rounded-lg" value={form.pincode} onChange={update("pincode")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Available Rooms</label>
              <input type="number" min="1" className="w-full h-10 px-3 text-sm border rounded-lg" value={form.availableRooms} onChange={update("availableRooms")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Monthly Rent (₹)</label>
              <input type="number" min="0" className="w-full h-10 px-3 text-sm border rounded-lg" value={form.rent} onChange={update("rent")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Security Deposit (₹)</label>
              <input type="number" min="0" className="w-full h-10 px-3 text-sm border rounded-lg" value={form.securityDeposit} onChange={update("securityDeposit")} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${form.amenities.includes(a) ? "bg-primary text-white border-primary" : "bg-background border-border hover:border-primary/50"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Image URLs (one per line)</label>
            <textarea className="w-full min-h-[60px] px-3 py-2 text-sm border rounded-lg"
              value={form.images.join("\n")} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value.split("\n").filter(Boolean) }))} />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}