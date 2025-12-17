// src/pages/AttractionDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import "@google/model-viewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Music,
  Map,
  Box,
  Plus,
  Star,
  Calendar,
  Tag,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface Attraction {
  id: string;
  name: string;
  category: string;
  description: string;
  eco_score: number;
  images: string[];
  videos: string[];
  audio_story_url: string;
  tags: string[];
  best_season: string;
  map_url: string;
  ar_model_url: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api`;

function normalizeAttraction(raw: any, fallbackId?: string): Attraction {
  const id = raw.id ?? raw._id ?? fallbackId ?? String(raw.id ?? raw._id ?? "");
  const images = Array.isArray(raw.images) ? raw.images : raw.images ? [raw.images] : [];
  const videos = Array.isArray(raw.videos) ? raw.videos : raw.videos ? [raw.videos] : [];
  const tags = Array.isArray(raw.tags) ? raw.tags : raw.tags ? [raw.tags] : [];

  return {
    id,
    name: raw.name ?? "Unknown",
    category: raw.category ?? "Unknown",
    description: raw.description ?? "",
    eco_score: Number(raw.eco_score ?? 0) || 0,
    images,
    videos,
    audio_story_url: raw.audio_story_url ?? raw.audio ?? "",
    tags,
    best_season: raw.best_season ?? "All Year",
    map_url: raw.map_url ?? raw.mapUrl ?? "#",
    ar_model_url: raw.ar_model_url ?? raw.arModelUrl ?? "",
  };
}

const AttractionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInItinerary, setIsInItinerary] = useState(false);

  useEffect(() => {
    const fetchAttraction = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/attractions/${id}`);
        if (res.ok) {
          const data = await res.json();
          const parsed = normalizeAttraction(data, id);
          setAttraction(parsed);
          return;
        }

        const listRes = await fetch(`${API_BASE}/attractions`);
        if (listRes.ok) {
          const list = await listRes.json();
          const found = Array.isArray(list)
            ? list.find((a: any) => a.id === id || a._id === id || String(a._id) === id)
            : null;
          if (found) {
            setAttraction(normalizeAttraction(found, id));
            return;
          }
        }

        setError("Attraction not found.");
      } catch (err: any) {
        console.error("[AttractionDetail] Unexpected error", err);
        setError("Unable to load attraction details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttraction();
  }, [id]);

  useEffect(() => {
    const fetchUserItinerary = async () => {
      const token = localStorage.getItem("token");
      if (!token || !attraction) return;
      try {
        const res = await fetch("http://localhost:5000/api/itineraries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsInItinerary(data.some((item: any) => item.attraction_id === attraction.id));
        }
      } catch (err) {
        console.error("Error checking itinerary:", err);
      }
    };

    fetchUserItinerary();
  }, [attraction]);

  const addToItinerary = async () => {
    if (!attraction) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to add an itinerary.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/itineraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attraction_id: attraction.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsInItinerary(true);
        toast.success("Added to your itinerary!");
      } else {
        toast.error(data.error || "Failed to add itinerary");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while adding itinerary");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-muted-foreground">Loading...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-red-500">{error}</p></div>;
  if (!attraction) return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-muted-foreground">Attraction not found.</p></div>;

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={attraction.images?.[0] || "/placeholder.jpg"}
          alt={attraction.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Link to="/attractions">
              <Button variant="secondary" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Attractions
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{attraction.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary text-primary-foreground">{attraction.category}</Badge>
              <Badge className="bg-card/90 backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1 fill-primary text-primary" />
                {attraction.eco_score}/100 Eco Score
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">About</h2>
                <p className="text-muted-foreground leading-relaxed">{attraction.description}</p>
              </CardContent>
            </Card>

            {/* Media Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Images */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-sm">View Images</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader><DialogTitle>Gallery</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                    {(attraction.images || []).map((img, idx) => (
                      <img key={idx} src={img} alt={`${attraction.name} ${idx + 1}`} className="w-full h-64 object-cover rounded-lg" />
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Videos */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Video className="w-6 h-6" />
                    <span className="text-sm">Watch Videos</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader><DialogTitle>Videos</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    {(attraction.videos || []).map((video, idx) => (
                      <iframe key={idx} src={video} className="w-full aspect-video rounded-lg" allowFullScreen title={`video-${idx}`}></iframe>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Audio */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Music className="w-6 h-6" />
                    <span className="text-sm">Listen Story</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Audio Story</DialogTitle></DialogHeader>
                  <audio controls className="w-full">
                    <source src={attraction.audio_story_url} type="audio/mpeg" />
                    Your browser does not support audio playback.
                  </audio>
                </DialogContent>
              </Dialog>

              {/* Map */}
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                <a href={attraction.map_url} target="_blank" rel="noopener noreferrer">
                  <Map className="w-6 h-6" />
                  <span className="text-sm">Open Map</span>
                </a>
              </Button>

              {/* AR Model Viewer */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Box className="w-6 h-6" />
                    <span className="text-sm">View in AR</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>AR Model Viewer</DialogTitle>
                    <DialogDescription>Rotate, zoom or view in Augmented Reality</DialogDescription>
                  </DialogHeader>

                  {attraction.ar_model_url ? (
                  <model-viewer
                      src={attraction.ar_model_url}
                      alt={attraction.name}
                      ar
                      ar-modes="scene-viewer webxr quick-look"
                      ar-placement="floor"
                      ar-scale="auto"
                      camera-controls
                      shadow-intensity="1"
                      exposure="1"
                      touch-action="pan-y"
                      autoplay
                      style={{ width: "100%", height: "420px", background: "transparent" }}
                    ></model-viewer>
                  ) : (
                    <p className="text-muted-foreground text-center py-10">AR model not available.</p>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardContent className="p-6 space-y-4">
                <Button className="w-full" size="lg" onClick={addToItinerary} disabled={isInItinerary}>
                  {isInItinerary ? (<><Check className="w-5 h-5 mr-2" />Added to Itinerary</>) : (<><Plus className="w-5 h-5 mr-2" />Add to Itinerary</>)}
                </Button>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Best Season</p>
                      <p className="text-sm text-muted-foreground">{attraction.best_season}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {(attraction.tags || []).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetail;
