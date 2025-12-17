// src/pages/Festivals.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

interface Festival {
  id?: string;
  _id?: any;
  name: string;
  date: string;
  description: string;
  location: string;
  images?: string[];
  image?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Festivals = () => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/festivals`);
        if (!res.ok) throw new Error("Failed to fetch festivals");
        const data = await res.json();
        console.log("fetched festivals:", data);
        setFestivals(data);
      } catch (err: any) {
        console.error("Error loading festivals:", err);
        setError("Could not load festivals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Karnataka Festivals</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the vibrant cultural celebrations of Karnataka
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {festivals.map((festival) => {
            // robust: prefer festival.images[0], else festival.image, else placeholder
            const cover = festival.images?.[0] || festival.image || "/placeholder.jpg";
            const fid = festival.id || festival._id || festival._id?.$oid || festival.name;
            return (
              <Card key={fid} className="overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={cover}
                    alt={festival.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{festival.name}</h3>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <Badge variant="secondary">{festival.date}</Badge>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{festival.location}</span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed line-clamp-4">{festival.description}</p>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Link to={`/festivals/${fid}`}>
                    <Button className="w-full">Explore More</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Festivals;
