import { useEffect, useState } from "react";
import AttractionCard from "@/components/AttractionCard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface Attraction {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  videos: string[];
  audio_story_url: string;
  map_url: string;
  ar_model_url: string;
  best_season: string;
  eco_score: number;
  tags: string[];
  festival_ids: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_BASE = `${API_BASE_URL}/api`;


const Attractions = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttractions = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/attractions`);
        if (!res.ok) throw new Error("Failed to reach backend");
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Invalid response format");

        // Ensure each attraction has an `id` key (from _id if needed)
        const formatted = data.map((a) => ({
          ...a,
          id: a.id || a._id, // <-- ensure id is never undefined
        }));

        setAttractions(formatted);
        setFilteredAttractions(formatted);
      } catch (err: any) {
        console.error("Error loading attractions:", err);
        setError("Unable to load attractions from server.");
      } finally {
        setLoading(false);
      }
    };

    loadAttractions();
  }, []);

  const categories = ["All", "Eco", "Cultural", "Adventure"];

  const handleFilter = (category: string) => {
    setActiveFilter(category);
    if (category === "All") {
      setFilteredAttractions(attractions);
    } else {
      setFilteredAttractions(attractions.filter((attr) => attr.category === category));
    }
  };

  if (loading)
    return <div className="text-center py-12 text-lg">Loading...</div>;
  if (error)
    return <div className="text-center py-12 text-red-500 text-lg">{error}</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold">
            Discover Karnataka's Treasures
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From ancient heritage sites to pristine natural wonders
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-slide-up">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter by:</span>
          </div>
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeFilter === category ? "default" : "outline"}
              onClick={() => handleFilter(category)}
              className="transition-all"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
          {filteredAttractions.map((attraction, index) => (
  <AttractionCard
    key={index}
    id={attraction.id || String(index)}   // 👈 fallback id based on index
    name={attraction.name}
    category={attraction.category}
    image={attraction.images?.[0] || "/placeholder.jpg"}
    eco_score={attraction.eco_score}
  />
))}
        </div>

        {filteredAttractions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No attractions found for this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attractions;
