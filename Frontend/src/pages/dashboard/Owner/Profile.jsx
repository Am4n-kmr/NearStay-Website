import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUpdateProfile } from "@workspace/api-client-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  bio: z.string().optional(),
  college: z.string().optional(),
  city: z.string().optional(),
});

export default function StudentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      bio: user?.bio ?? "",
      college: user?.college ?? "",
      city: user?.city ?? "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile.mutateAsync({ data });
      toast({ title: "Profile updated successfully" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

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
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{user?.name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <div className="flex gap-1.5 mt-1.5">
              <Badge variant="secondary" className="text-xs capitalize">{user?.role}</Badge>
              {user?.isEmailVerified && (
                <Badge className="text-xs bg-emerald-500 text-white border-0">Verified</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Personal Information</h2>

          <div className="space-y-1.5">
            <Label>Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input {...register("name")} className="pl-9" placeholder="Your full name" />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={user?.email ?? ""} readOnly className="pl-9 bg-muted cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input {...register("phone")} className="pl-9" placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>College / University</Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input {...register("college")} className="pl-9" placeholder="e.g. IIT Bombay" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>City</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input {...register("city")} className="pl-9" placeholder="Mumbai" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea {...register("bio")} placeholder="Tell property owners a bit about yourself" rows={3} />
          </div>

          <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
