import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Download, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface Attraction {
  id: string;
  attraction_id: string;  
  name: string;
  category: string;
  images: string[];
  best_season: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_BASE = `${API_BASE_URL}/api`;

const Itinerary = () => {
  const [itinerary, setItinerary] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load user itineraries from backend
  useEffect(() => {
    const fetchItineraries = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!user || !token) {
        toast.error("Please login to load itineraries");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/itineraries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load itineraries");
        }

        const data = await res.json();
        setItinerary(data);
      } catch (err) {
        console.error(err);
        toast.error("Couldn't load itineraries");
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  // ✅ Remove itinerary item
  const removeFromItinerary = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first");

    try {
      const res = await fetch(`${API_BASE}/itineraries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setItinerary((prev) => prev.filter((item) => item.id !== id));
      toast.success("Removed from itinerary");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove itinerary");
    }
  };

  

const downloadItinerary = () => {
  if (itinerary.length === 0) {
    toast.error("No itinerary to download");
    return;
  }

  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("My Karnataka Itinerary", 20, 20);

  doc.setFontSize(12);
  let y = 35;

  itinerary.forEach((item, index) => {
    doc.text(`${index + 1}. ${item.name}`, 20, y);
    y += 8;
    doc.text(`Category: ${item.category}`, 25, y);
    y += 6;
    doc.text(`Best Season: ${item.best_season}`, 25, y);
    y += 6;
    if (item.images?.[0]) {
      try {
        // Some browsers may block cross-origin images, so wrap in try
        doc.addImage(item.images[0], "JPEG", 150, y - 20, 40, 30);
      } catch {
        // silently skip if image can't be loaded
      }
    }
    y += 20;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("My_Itinerary.pdf");
  toast.success("Your itinerary has been downloaded!");
};


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading your itinerary...</p>
      </div>
    );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold">My Itinerary</h1>
          <p className="text-xl text-muted-foreground">
            Your personalized Karnataka travel plan
          </p>
        </div>

        {itinerary.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={downloadItinerary} className="shadow-elevated">
                <Download className="w-4 h-4 mr-2" />
                Download Itinerary
              </Button>
            </div>

            <div className="space-y-4 animate-slide-up">
              {itinerary.map((item, index) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-elevated transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={item.images?.[0] || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-full md:w-48 h-48 object-cover"
                    />
                    <CardContent className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl font-bold text-primary">
                              {index + 1}
                            </span>
                            <h3 className="text-xl font-bold">{item.name}</h3>
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {item.category}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>Best: {item.best_season}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromItinerary(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link to={`/attractions/${item.attraction_id}`}>
                         <Button variant="outline" size="sm">
                          View Details
                         </Button>
                       </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center shadow-card animate-scale-in">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Your itinerary is empty</h2>
              <p className="text-muted-foreground">
                Start exploring attractions and add them to your travel plan
              </p>
              <Link to="/attractions">
                <Button className="mt-4">Browse Attractions</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Itinerary;
