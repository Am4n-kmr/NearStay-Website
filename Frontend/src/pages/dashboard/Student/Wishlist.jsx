import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import DashboardLayout from "../../../components/DashboardLayout";
import { wishlistApi } from "../../../lib/api";
import { useToast } from "../../../hooks/use-toast";

export default function StudentWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const data = await wishlistApi.getWishlist();
      setWishlist(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (propertyId) => {
    try {
      await wishlistApi.removeFromWishlist(propertyId);
      toast({
        title: "Success",
        description: "Removed from wishlist",
      });
      fetchWishlist();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist",
        variant: "destructive",
      });
    }
  };

  const isPropertyAvailable = (property) => {
    return property.isAvailable && property.availableRooms > 0;
  };

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
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((item) => {
              const property = item.property;
              const available = isPropertyAvailable(property);
              
              return (
                <div
                  key={item._id}
                  className={`bg-card border rounded-xl p-4 transition-all ${
                    available ? "border-border hover:border-primary/30" : "border-gray-300 opacity-60"
                  }`}
                >
                  <div className="relative">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full aspect-[4/3] object-cover rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <Heart className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {!available && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Badge variant="secondary" className="bg-gray-800 text-white">Fully Booked</Badge>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{property.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {property.address}, {property.city}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary">₹{property.rent}/mo</span>
                      {available ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {property.availableRooms} room{property.availableRooms > 1 ? "s" : ""} left
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                          No rooms
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link to={`/property/${property._id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full" disabled={!available}>
                          View Details
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(property._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
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