import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Heart } from "lucide-react";

const INTERESTS = [
  "Nature",
  "Eco Tourism",
  "Heritage",
  "Adventure",
  "Wildlife",
  "Temples",
  "Beaches",
  "Hill Stations",
  "Culture",
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProfileSetup() {
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async () => {
    if (interests.length === 0) {
      return toast.error("Please select at least one interest");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/api/auth/profile`,
        { bio, interests },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Profile completed successfully!");
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-xl shadow-elevated animate-scale-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-hero flex items-center justify-center">
            <User className="text-white w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Complete Your Profile
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Tell us what you love so we can personalize your experience
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bio */}
          <div className="space-y-2">
            <Label>Short Bio</Label>
            <Textarea
              placeholder="I love exploring nature, heritage places..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Your Interests
            </Label>

            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((interest) => (
                <label
                  key={interest}
                  className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted"
                >
                  <Checkbox
                    checked={interests.includes(interest)}
                    onCheckedChange={() => toggleInterest(interest)}
                  />
                  <span className="text-sm">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
