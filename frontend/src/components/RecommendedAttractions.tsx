import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Props {
  interests: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function RecommendedAttractions({ interests }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE_URL}/api/recommendations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData(res.data.recommendations || []);
      } catch (err) {
        console.error("Recommendation error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (interests.length > 0) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [interests]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No recommendations yet. Update your interests.
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {data.map((a) => (
        <Card key={a._id} className="hover:shadow-lg transition">
          <CardContent className="p-4 space-y-3">
            <img
              src={a.images?.[0]}
              alt={a.name}
              className="h-40 w-full object-cover rounded-lg"
            />

            <h3 className="font-semibold">{a.name}</h3>

            <Badge variant="secondary">{a.category}</Badge>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {a.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
