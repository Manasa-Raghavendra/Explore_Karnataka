import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

// Fix default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Attraction {
  id?: string;      // frontend id
  _id?: string;     // MongoDB id
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  images: string[];
}

interface MapViewProps {
  attractions: Attraction[];
}

const MapView = ({ attractions }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();

  const center: [number, number] = [14.5, 75.5]; // Karnataka center

  /* ---------------- Initialize map once ---------------- */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  /* ---------------- Add / update markers ---------------- */
  useEffect(() => {
    if (!markersLayerRef.current || !mapRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    attractions.forEach((a) => {
      const lat = Number(a.latitude);
      const lon = Number(a.longitude);

      if (
        isNaN(lat) ||
        isNaN(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        console.warn("Skipping invalid coordinates:", a.name);
        return;
      }

      const attractionId = a.id || a._id;
      if (!attractionId) {
        console.warn("Missing attraction ID:", a.name);
        return;
      }

      const marker = L.marker([lat, lon]);

      const popupHtml = `
        <div style="min-width:220px">
          <img 
            src="${a.images?.[0] || ""}" 
            alt="${a.name}"
            style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;"
          />
          <h3 style="font-weight:600;margin-bottom:4px;font-size:14px;">
            ${a.name}
          </h3>
          <p style="font-size:12px;color:#666;margin-bottom:8px;">
            ${a.category}
          </p>
          <button 
            id="view-${attractionId}" 
            style="
              width:100%;
              padding:8px;
              border-radius:8px;
              border:none;
              background:#f97316;
              color:white;
              font-weight:600;
              cursor:pointer;
            "
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(layer);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`view-${attractionId}`);
        if (btn) {
          btn.onclick = () => navigate(`/attractions/${attractionId}`);
        }
      });
    });
  }, [attractions, navigate]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[500px] rounded-xl overflow-hidden shadow-elevated border border-border"
    />
  );
};

export default MapView;
