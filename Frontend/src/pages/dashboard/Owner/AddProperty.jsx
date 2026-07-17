import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
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

          {/* Images */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Images</label>

            {/* Upload from device */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-dashed border-border bg-background hover:border-primary/50 cursor-pointer transition-colors">
                <Upload className="h-4 w-4" />
                Upload from device
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    files.forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setForm((f) => ({ ...f, images: [...f.images, ev.target.result] }));
                      };
                      reader.readAsDataURL(file);
                    });
                    e.target.value = "";
                  }}
                />
              </label>
              <span className="text-xs text-muted-foreground">or paste URLs below</span>
            </div>

            {/* Paste image URLs */}
            <textarea
              className="w-full min-h-[56px] px-3 py-2 text-sm border rounded-lg"
              placeholder="https://example.com/image1.jpg"
              onChange={(e) => {
                const url = e.target.value.trim();
                if (url && e.target.value.endsWith("\n")) {
                  setForm((f) => ({ ...f, images: [...f.images, url] }));
                  e.target.value = "";
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const val = e.target.value.trim();
                  if (val) {
                    setForm((f) => ({ ...f, images: [...f.images, val] }));
                    e.target.value = "";
                  }
                }
              }}
            />

            {/* Image previews */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                    {img.startsWith("data:") ? (
                      <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <img
                          src={img}
                          alt={`Image ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "flex"; }}
                        />
                        <div className="hidden w-full h-full items-center justify-center text-xs text-muted-foreground bg-muted">
                          <ImageIcon className="h-5 w-5 mr-1" /> Invalid URL
                        </div>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "List Property"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}