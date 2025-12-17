import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import RecommendedAttractions from "@/components/RecommendedAttractions";

/* ---------------- TYPES ---------------- */
interface User {
  name: string;
  email: string;
  bio?: string;
  interests: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [bio, setBio] = useState("");
  const [interestsText, setInterestsText] = useState("");

  const token = localStorage.getItem("token");

  /* ---------------- Fetch profile ---------------- */
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData: User = {
        ...res.data.user,
        interests: res.data.user.interests || [],
      };

      setUser(userData);
      setBio(userData.bio || "");
      setInterestsText(userData.interests.join(", "));
    } catch {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ---------------- Save changes ---------------- */
  const handleSave = async () => {
    try {
      const updatedInterests = interestsText
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      await axios.put(
        `${API_BASE_URL}/api/auth/profile`,
        {
          bio,
          interests: updatedInterests,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Profile updated successfully");
      setEditMode(false);
      await fetchProfile();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (!user) return null;

  /* ---------------- Interests for Recommendations ---------------- */
  const interestsForRecommendations: string[] = editMode
    ? interestsText.split(",").map((i) => i.trim()).filter(Boolean)
    : user.interests;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 space-y-10">
      {/* ================= PROFILE CARD ================= */}
      <div className="flex justify-center">
        <Card className="max-w-2xl w-full shadow-elevated overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-hero h-32 relative">
            <div className="absolute -bottom-10 left-6">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-gradient-hero text-white text-3xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardContent className="pt-16 space-y-6">
            {/* Name */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>

              {!editMode ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditMode(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="icon" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditMode(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Bio */}
            <div>
              <h3 className="font-semibold mb-2">About Me</h3>
              {!editMode ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {user.bio || "No bio added yet."}
                </p>
              ) : (
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell something about yourself..."
                />
              )}
            </div>

            {/* Interests */}
            <div>
              <h3 className="font-semibold mb-2">Interests</h3>
              {!editMode ? (
                <div className="flex flex-wrap gap-2">
                  {user.interests.length > 0 ? (
                    user.interests.map((i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1">
                        {i}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No interests added yet.
                    </p>
                  )}
                </div>
              ) : (
                <Input
                  value={interestsText}
                  onChange={(e) => setInterestsText(e.target.value)}
                  placeholder="Nature, Temples, Food, Trekking"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= RECOMMENDATIONS ================= */}
      <div className="max-w-6xl mx-auto">
        <RecommendedAttractions interests={interestsForRecommendations} />
      </div>
    </div>
  );
}
