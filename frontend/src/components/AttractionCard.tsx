import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Star } from "lucide-react";

interface AttractionCardProps {
  id: string;
  name: string;
  category: string;
  image: string;
  eco_score: number;
}

const AttractionCard = ({ id, name, category, image, eco_score }: AttractionCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border">
      <div className="relative overflow-hidden h-48">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-card/90 backdrop-blur-sm border-border">
            {category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{name}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>Karnataka</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-semibold text-foreground">{eco_score}/100</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/attractions/${id}`} className="w-full">
          <Button className="w-full">Explore More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default AttractionCard;