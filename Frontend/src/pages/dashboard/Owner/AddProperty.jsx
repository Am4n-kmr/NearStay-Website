import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import DashboardLayout from "../../../components/DashboardLayout";
import { propertyApi } from "../../../lib/api";
import { toast } from "sonner";

const PROPERTY_TYPES = ["PG", "Hostel", "Flat", "Room"];
const GENDER_OPTIONS = ["male", "female", "any"];
const AMENITY_OPTIONS = ["WiFi", "AC", "Food", "Laundry", "Parking", "Gym", "Power Backup", "Water Purifier", "TV", "Furnished"];

export default function AddProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", propertyType: "PG", genderPreference: "any",
    address: "", city: "", state: "", pincode: "",
    rent: "", securityDeposit: "", availableRooms: "1", maxPeople: "1",
    amenities: [], images: [],
  });

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await propertyApi.create({
        ...form,
        rent: Number(form.rent),
        securityDeposit: Number(form.securityDeposit) || 0,
        availableRooms: Number(form.availableRooms),
        maxPeople: Number(form.maxPeople) || 1,
      });
      toast.success("Property listed successfully! Awaiting admin approval.");
      navigate("/dashboard/owner/properties");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => {
    const value = e.target.type === "number" ? e.target.valueAsNumber : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <DashboardLayout title="Add Property">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-bold">List Your Property</h1>
            <p className="text-sm text-muted-foreground">Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <input className="w-full h-10 px-3 text-sm border rounded-lg" placeholder="e.g. Cozy PG near IIT" value={form.title} onChange={update("title")} required />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg" placeholder="Describe your property..." value={form.description} onChange={update("description")} required />
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
              <input className="w-full h-10 px-3 text-sm border rounded-lg" placeholder="Street address" value={form.address} onChange={update("address")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">City</label>
              <input className="w-full h-10 px-3 text-sm border rounded-lg" placeholder="e.g. Mumbai" value={form.city} onChange={update("city")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">State</label>
              <input className="w-full h-10 px-3 text-sm border rounded-lg" placeholder="e.g. Maharashtra" value={form.state} onChange={update("state")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pincode</label>
              <input className="w-full h-10 px-3 text-sm border rounded-lg" placeholder="400001" value={form.pincode} onChange={update("pincode")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Available Rooms</label>
              <input type="number" min="1" className="w-full h-10 px-3 text-sm border rounded-lg" value={form.availableRooms} onChange={update("availableRooms")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Max People per Room</label>
              <input type="number" min="1" className="w-full h-10 px-3 text-sm border rounded-lg" value={form.maxPeople} onChange={update("maxPeople")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Monthly Rent (₹)</label>
              <input type="number" min="0" className="w-full h-10 px-3 text-sm border rounded-lg" placeholder="5000" value={form.rent} onChange={update("rent")} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Security Deposit (₹)</label>
              <input type="number" min="0" className="w-full h-10 px-3 text-sm border rounded-lg" placeholder="10000" value={form.securityDeposit} onChange={update("securityDeposit")} />
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
            <textarea className="w-full min-h-[60px] px-3 py-2 text-sm border rounded-lg" placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              value={form.images.join("\n")} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value.split("\n").filter(Boolean) }))} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "List Property"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}