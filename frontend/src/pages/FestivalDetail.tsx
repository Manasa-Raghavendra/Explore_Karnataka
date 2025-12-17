// src/pages/FestivalDetail.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RawFestival { id?: string; _id?: any; name?: string; date?: string; description?: string; location?: string; images?: string[]; image?: string; }

interface Festival {
  id: string;
  name: string;
  date: string;
  description: string;
  location: string;
  images: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_BASE = `${API_BASE_URL}/api`;

function normalizeFestival(raw: RawFestival, fallbackId?: string): Festival {
  const id = (raw.id || raw._id || fallbackId || "").toString();
  const images = Array.isArray(raw.images)
    ? raw.images
    : raw.image
    ? [raw.image]
    : [];
  return {
    id,
    name: raw.name || "Unknown Festival",
    date: raw.date || "Date not available",
    description: raw.description || "",
    location: raw.location || "",
    images,
  };
}

const FestivalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [festival, setFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchFestival = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try single endpoint first
        const res = await fetch(`${API_BASE}/festivals/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFestival(normalizeFestival(data, id));
          return;
        }

        // Fallback: fetch list and find
        const listRes = await fetch(`${API_BASE}/festivals`);
        if (!listRes.ok) throw new Error("Failed to fetch festivals list");
        const list = await listRes.json();
        const found = Array.isArray(list)
          ? list.find((f: any) => f.id === id || f._id === id || String(f._id) === id)
          : null;
        if (!found) throw new Error("Festival not found");
        setFestival(normalizeFestival(found, id));
      } catch (err: any) {
        console.error("Error fetching festival:", err);
        setError(err.message || "Could not load festival details");
      } finally {
        setLoading(false);
      }
    };

    fetchFestival();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center py-12">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center py-12 text-red-500">{error}</div>;
  if (!festival) return <div className="min-h-screen flex items-center justify-center py-12">Festival not found</div>;

  // ensure at least one image (placeholder)
  const images = festival.images.length ? festival.images : ["/placeholder.jpg"];

  return (
    <div className="min-h-screen py-12 px-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Slider */}
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <img
            src={images[index]}
            alt={`${festival.name} ${index + 1}`}
            className="w-full h-[420px] object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
                aria-label="Previous image"
              >‹</button>

              <button
                onClick={() => setIndex((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
                aria-label="Next image"
              >›</button>

              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`w-3 h-3 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{festival.name}</h1>

          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm">{festival.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm">{festival.location}</span>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-muted-foreground">{festival.description}</p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalDetail;
