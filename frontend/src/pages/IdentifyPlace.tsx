import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const IdentifyPlace = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{
    name: string;
    confidence: number;
    id: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setPrediction(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const predictPlace = async () => {
  if (!selectedImage) {
    toast.error("Please upload an image first");
    return;
  }

  setIsLoading(true);

  try {
    // Convert base64 back to a file blob
    const res = await fetch(selectedImage);
    const blob = await res.blob();

    // Prepare form data
    const formData = new FormData();
    formData.append("file", blob, "uploaded_image.jpg");

    // Send to your Flask backend
    const response = await fetch(`${API_BASE_URL}/api/image/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Prediction failed");
    }

    const data = await response.json();

    // Update frontend state
    setPrediction({
      name: data.predicted_place,
      confidence: data.confidence,
      id: data.predicted_place.toLowerCase().replace(/\s+/g, "-"), // optional id
    });

    toast.success("Place identified!");
  } catch (error) {
    console.error(error);
    toast.error("Error identifying the place.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto shadow-elevated">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Identify Place</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload an image and let AI identify Karnataka attractions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="shadow-card animate-slide-up">
            <CardContent className="p-6 space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                {selectedImage ? (
                  <div className="space-y-4">
                    <img
                      src={selectedImage}
                      alt="Uploaded"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(null);
                        setPrediction(null);
                      }}
                    >
                      Clear Image
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Upload an image</p>
                        <p className="text-sm text-muted-foreground">
                          Click to browse or drag and drop
                        </p>
                      </div>
                    </div>
                  </label>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={predictPlace}
                disabled={!selectedImage || isLoading}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Predict Place
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

        <Card className="shadow-card h-full flex flex-col justify-center items-center text-center">
  <CardContent className="p-6 w-full">
    {prediction ? (
      <>
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Prediction Result</h3>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Identified Place</p>
          <p className="text-xl font-bold capitalize">{prediction.name}</p>
        </div>

        <Link to={`/attractions/${prediction.name.toLowerCase()}`}>
          <Button className="w-full" size="lg">View Details</Button>
        </Link>
      </>
    ) : (
      <div className="text-muted-foreground">
        <Camera className="w-12 h-12 mx-auto mb-4" />
        <p>Upload an image to see prediction results</p>
      </div>
    )}
  </CardContent>
</Card>


        </div>
      </div>
    </div>
  );
};

export default IdentifyPlace;