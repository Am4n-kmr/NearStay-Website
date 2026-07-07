import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";

export default function StudentWishlist() {
  const properties = [];
  const isLoading = false;

  return (
    <DashboardLayout title="Wishlist">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Wishlist</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Properties you've saved for later</p>
          </div>
          <Link to="/search"><Button size="sm" variant="outline"><Search className="h-4 w-4 mr-2" /> Find more</Button></Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2"><Skeleton className="aspect-[4/3] rounded-xl" /><Skeleton className="h-4 w-3/4" /></div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4">
                <p className="font-medium">{p.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground bg-card border border-border rounded-xl">
            <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Your wishlist is empty</p>
            <p className="text-sm mt-1">Save properties while browsing to find them here</p>
            <Link to="/search"><Button className="mt-4" size="sm">Explore properties</Button></Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}