import { useEffect, useState } from "react";
import MapView from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Map as MapIcon, Award } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-karnataka.jpg";

interface Attraction {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  images: string[];
  eco_score: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);

  useEffect(() => {
  const fetchAttractions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attractions`);
      if (!res.ok) throw new Error("Failed to fetch attractions");
      const data = await res.json();
      setAttractions(data);
    } catch (err) {
      console.error("Error loading attractions:", err);
    }
  };
  fetchAttractions();
}, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-20 px-4">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Explore Karnataka
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Discover Eco & Cultural Tourism Like Never Before
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Journey through ancient heritage sites, lush coffee plantations, pristine beaches, and vibrant wildlife sanctuaries
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/attractions">
                <Button size="lg" variant="secondary" className="group">
                  <span>Explore Attractions</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/itinerary">
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white">
                  Plan Your Trip
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-elevated transition-all animate-slide-up">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Eco Tourism</h3>
              <p className="text-muted-foreground">
                Sustainable travel experiences in Karnataka's pristine natural landscapes
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-elevated transition-all animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cultural Heritage</h3>
              <p className="text-muted-foreground">
                Explore UNESCO sites, ancient temples, and royal palaces
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-elevated transition-all animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapIcon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Interactive Maps</h3>
              <p className="text-muted-foreground">
                Navigate with ease using our detailed attraction maps
              </p>
            </div>
          </div>

          {/* Map Section */}
          <div className="space-y-4 animate-scale-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Discover Attractions</h2>
              <p className="text-muted-foreground">
                Click on any marker to learn more about Karnataka's treasures
              </p>
            </div>
            <MapView attractions={attractions} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Build your personalized itinerary and explore Karnataka's hidden gems
          </p>
          <Link to="/attractions">
            <Button size="lg" className="shadow-elevated">
              Browse All Attractions
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
