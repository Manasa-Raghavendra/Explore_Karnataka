// src/pages/Admin.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Users,
  Activity,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"];
const API_BASE = `${API_BASE_URL}/api`;

interface Attraction {
  _id?: string;
  id?: string;
  name: string;
  category?: string;
  description?: string;
  eco_score?: number;
  images?: string[];
  videos?: string[];
  audio_story_url?: string;
  tags?: string[];
  best_season?: string;
  map_url?: string;
  ar_model_url?: string;
  created_at?: string;
}

interface Festival {
  _id?: string;
  id?: string;
  name: string;
  date?: string;
  location?: string;
  description?: string;
}

interface AnalyticsData {
  total_visitors: number;
  attractions_count: number;
  festivals_count: number;
  avg_eco_score: number;
  visitor_trends: { month: string; visitors: number }[];
  category_distribution: Record<string, number>;
}

type EndpointMap = {
  attractions: {
    list: string;
    fetchSingle: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
  festivals: {
    list: string;
    fetchSingle: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
};




const Admin = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMgmt, setLoadingMgmt] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endpoints, setEndpoints] = useState<EndpointMap | null>(null);
  const navigate = useNavigate();

  // Dialog & edit states
  const [addAttractionOpen, setAddAttractionOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [addFestivalOpen, setAddFestivalOpen] = useState(false);
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null);

  // Helper to include token
  const getAuthHeaders = (isJson = true) => {
    const token = localStorage.getItem("token");
    return {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
  const candidates: EndpointMap = {
    attractions: {
      list: `${API_BASE}/attractions`,
      fetchSingle: (id: string) => `${API_BASE}/attractions/${id}`,
      create: `${API_BASE}/attractions`,  // ✅ correct
      update: (id: string) => `${API_BASE}/attractions/${id}`,
      delete: (id: string) => `${API_BASE}/attractions/${id}`,
    },
    festivals: {
      list: `${API_BASE}/festivals`,
      fetchSingle: (id: string) => `${API_BASE}/festivals/${id}`,
      create: `${API_BASE}/festivals`,   // ✅ correct
      update: (id: string) => `${API_BASE}/festivals/${id}`,
      delete: (id: string) => `${API_BASE}/festivals/${id}`,
    },
  };

  setEndpoints(candidates);
}, []);



   

  // Verify admin access and fetch analytics
  useEffect(() => {
    const verifyAdminAndLoadAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        // Admin check
        const checkRes = await fetch(`${API_BASE}/admin/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!checkRes.ok) {
          navigate("/");
          return;
        }

        // Analytics
        const res = await fetch(`${API_BASE}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch analytics");
        setAnalytics(data);
      } catch (err: any) {
        console.error("Admin verification / analytics load failed:", err);
        setError(err?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndLoadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch management lists (attractions + festivals)
  const fetchManagementLists = useCallback(async () => {
    if (!endpoints) return;
    setLoadingMgmt(true);
    try {
      const [aRes, fRes] = await Promise.all([
        fetch(endpoints.attractions.list),
        fetch(endpoints.festivals.list),
      ]);
      const [aData, fData] = await Promise.all([aRes.json(), fRes.json()]);

      // convert variations of _id vs id
      const normalizeAttractions = (arr: any[]) =>
        (arr || []).map((it) => ({
          ...it,
          _id: it._id ?? it.id ?? it._id,
          id: it.id ?? it._id ?? undefined,
        }));
      const normalizeFestivals = (arr: any[]) =>
        (arr || []).map((it) => ({
          ...it,
          _id: it._id ?? it.id ?? it._id,
          id: it.id ?? it._id ?? undefined,
        }));

      setAttractions(Array.isArray(aData) ? normalizeAttractions(aData) : []);
      setFestivals(Array.isArray(fData) ? normalizeFestivals(fData) : []);
    } catch (err) {
      console.error("Failed to load management lists:", err);
      toast.error("Failed to load attractions/festivals");
    } finally {
      setLoadingMgmt(false);
    }
  }, [endpoints]);

  useEffect(() => {
    if (!endpoints) return;
    fetchManagementLists();
  }, [endpoints, fetchManagementLists]);

  // ---------- Attractions CRUD ----------
  const handleSaveAttraction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!endpoints) {
      toast.error("Server endpoints not ready");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload: any = {
      name: (fd.get("name") as string) || "",
      category: (fd.get("category") as string) || "",
      description: (fd.get("description") as string) || "",
      eco_score: Number(fd.get("eco_score")) || 0,
      images: ((fd.get("images") as string) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      videos: ((fd.get("videos") as string) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      audio_story_url: (fd.get("audio_story_url") as string) || "",
      tags: ((fd.get("tags") as string) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      best_season: (fd.get("best_season") as string) || "",
      map_url: (fd.get("map_url") as string) || "",
      ar_model_url: (fd.get("ar_model_url") as string) || "",
    };

    try {
      // Update mode
      if (editingAttraction && (editingAttraction._id || editingAttraction.id)) {
        const id = editingAttraction._id || editingAttraction.id!;
        // Determine update URL
        const updateUrl = endpoints.attractions.update(id);
        const res = await fetch(updateUrl, {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || data.message || "Failed to update attraction");
        toast.success("Attraction updated");
        setEditingAttraction(null);
        setAddAttractionOpen(false);
        await fetchManagementLists();
        form.reset();
        return;
      }

      // Create mode - determine create URL
      const createUrl = endpoints.attractions.create;
      const res = await fetch(createUrl, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      // Some backends respond with 201 and message only -> fallback to refresh
      if (!res.ok) throw new Error(data.error || data.message || "Failed to add attraction");

      // If backend returned the new doc, append; otherwise refresh list
      if (data && (data._id || data.id || data.data)) {
        // backend variations: might respond {message, data: new_doc} or new_doc itself
        const newDoc = data.data ?? data;
        // normalize _id/id
        const normalized = {
          ...newDoc,
          _id: newDoc._id ?? newDoc.id,
          id: newDoc.id ?? newDoc._id,
        };
        setAttractions((prev) => [...prev, normalized]);
      } else {
        // fallback refresh
        await fetchManagementLists();
      }

      toast.success("Attraction added");
      form.reset();
      setAddAttractionOpen(false);
    } catch (err: any) {
      console.error("Save attraction error:", err);
      toast.error(err.message || "Failed to save attraction");
    }
  };

  const handleEditAttraction = (a: Attraction) => {
    setEditingAttraction(a);
    setAddAttractionOpen(true);
  };

  const handleDeleteAttraction = async (id: string) => {
    if (!endpoints) {
      toast.error("Server endpoints not ready");
      return;
    }
    if (!window.confirm("Delete this attraction?")) return;
    try {
      const deleteUrl = endpoints.attractions.delete(id);
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: getAuthHeaders(true),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Failed to delete attraction");
      setAttractions((prev) => prev.filter((it) => (it._id ?? it.id) !== id));
      toast.success("Attraction deleted");
    } catch (err: any) {
      console.error("Delete attraction error:", err);
      toast.error(err.message || "Failed to delete attraction");
    }
  };

  // ---------- Festivals CRUD ----------
  const handleSaveFestival = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!endpoints) {
      toast.error("Server endpoints not ready");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload: any = {
      name: (fd.get("name") as string) || "",
      date: (fd.get("date") as string) || "",
      location: (fd.get("location") as string) || "",
      description: (fd.get("description") as string) || "",
    };

    try {
      if (editingFestival && (editingFestival._id || editingFestival.id)) {
        const id = editingFestival._id || editingFestival.id!;
        const updateUrl = endpoints.festivals.update(id);
        const res = await fetch(updateUrl, {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || data.message || "Failed to update festival");
        toast.success("Festival updated");
        setEditingFestival(null);
        setAddFestivalOpen(false);
        await fetchManagementLists();
        form.reset();
        return;
      }

      // Create
      const createUrl = endpoints.festivals.create;
      const res = await fetch(createUrl, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Failed to add festival");

      if (data && (data._id || data.id || data.data)) {
        const newDoc = data.data ?? data;
        const normalized = { ...newDoc, _id: newDoc._id ?? newDoc.id, id: newDoc.id ?? newDoc._id };
        setFestivals((prev) => [...prev, normalized]);
      } else {
        await fetchManagementLists();
      }

      toast.success("Festival added");
      setAddFestivalOpen(false);
      form.reset();
    } catch (err: any) {
      console.error("Save festival error:", err);
      toast.error(err.message || "Failed to save festival");
    }
  };

  const handleEditFestival = (f: Festival) => {
    setEditingFestival(f);
    setAddFestivalOpen(true);
  };

  const handleDeleteFestival = async (id: string) => {
    if (!endpoints) {
      toast.error("Server endpoints not ready");
      return;
    }
    if (!window.confirm("Delete this festival?")) return;
    try {
      const deleteUrl = endpoints.festivals.delete(id);
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: getAuthHeaders(true),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Failed to delete festival");
      setFestivals((prev) => prev.filter((it) => (it._id ?? it.id) !== id));
      toast.success("Festival deleted");
    } catch (err: any) {
      console.error("Delete festival error:", err);
      toast.error(err.message || "Failed to delete festival");
    }
  };

  // ---------- Render ----------
  if (loading) return <div className="text-center py-12">Loading admin dashboard...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!analytics) return <div className="text-center py-12">No analytics available</div>;

  const categoryData = Object.entries(analytics.category_distribution || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const attractionInitial = (a?: Attraction) => ({
    name: a?.name ?? "",
    category: a?.category ?? "",
    description: a?.description ?? "",
    eco_score: a?.eco_score ?? 50,
    images: (a?.images ?? []).join(", "),
    videos: (a?.videos ?? []).join(", "),
    audio_story_url: a?.audio_story_url ?? "",
    tags: (a?.tags ?? []).join(", "),
    best_season: a?.best_season ?? "",
    map_url: a?.map_url ?? "",
    ar_model_url: a?.ar_model_url ?? "",
  });

  const festivalInitial = (f?: Festival) => ({
    name: f?.name ?? "",
    date: f?.date ?? "",
    location: f?.location ?? "",
    description: f?.description ?? "",
  });

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8 animate-fade-in">
          <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center shadow-elevated">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage Karnataka Tourism Platform</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="attractions">Attractions</TabsTrigger>
            <TabsTrigger value="festivals">Festivals</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Visitors</p>
                      <p className="text-2xl font-bold mt-1">{analytics.total_visitors.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-xs text-secondary mt-2">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Attractions</p>
                      <p className="text-2xl font-bold mt-1">{analytics.attractions_count}</p>
                    </div>
                    <MapPin className="w-8 h-8 text-secondary" />
                  </div>
                  <p className="text-xs text-secondary mt-2">Active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Festivals</p>
                      <p className="text-2xl font-bold mt-1">{analytics.festivals_count}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-xs text-secondary mt-2">Upcoming events</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Eco Score</p>
                      <p className="text-2xl font-bold mt-1">{analytics.avg_eco_score}</p>
                    </div>
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-xs text-secondary mt-2">Sustainability rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Tourist Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.visitor_trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="visitors" stroke="#4CAF50" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Popular Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attractions Management Tab */}
          <TabsContent value="attractions" className="space-y-4 animate-fade-in">
            <Card className="shadow-card">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Manage Attractions</CardTitle>

                {/* Add Attraction Dialog */}
                <Dialog
                  open={addAttractionOpen}
                  onOpenChange={(open) => {
                    if (!open) setEditingAttraction(null);
                    setAddAttractionOpen(open);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingAttraction(null);
                        setAddAttractionOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Attraction
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl p-6 bg-background shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold mb-2">
                        {editingAttraction ? "Edit Attraction" : "Add New Attraction"}
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        Fill in all details about the attraction below. Fields marked * are required.
                      </p>
                    </DialogHeader>

                    <form onSubmit={handleSaveAttraction} className="space-y-4 mt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" name="name" defaultValue={editingAttraction ? editingAttraction.name : ""} placeholder="e.g., Hampi Heritage Site" required />
                          </div>

                          <div>
                            <Label htmlFor="category">Category *</Label>
                            <Input id="category" name="category" defaultValue={editingAttraction ? editingAttraction.category : ""} placeholder="e.g., Temple, Beach..." required />
                          </div>

                          <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea id="description" name="description" defaultValue={editingAttraction ? editingAttraction.description : ""} className="w-full border rounded-md p-2 text-sm" rows={4} placeholder="Short description of the attraction..." />
                          </div>

                          <div>
                            <Label htmlFor="eco_score">Eco Score</Label>
                            <Input id="eco_score" name="eco_score" type="number" min="0" max="100" defaultValue={editingAttraction ? editingAttraction.eco_score ?? 50 : 50} />
                          </div>

                          <div>
                            <Label htmlFor="best_season">Best Season</Label>
                            <Input id="best_season" name="best_season" defaultValue={editingAttraction ? editingAttraction.best_season : ""} placeholder="October to February" />
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="images">Images (comma-separated URLs)</Label>
                            <Input id="images" name="images" defaultValue={editingAttraction ? (editingAttraction.images || []).join(", ") : ""} placeholder="https://img1.jpg, https://img2.jpg" />
                          </div>

                          <div>
                            <Label htmlFor="videos">Videos (comma-separated URLs)</Label>
                            <Input id="videos" name="videos" defaultValue={editingAttraction ? (editingAttraction.videos || []).join(", ") : ""} placeholder="https://video1.mp4, https://video2.mp4" />
                          </div>

                          <div>
                            <Label htmlFor="audio_story_url">Audio Story URL</Label>
                            <Input id="audio_story_url" name="audio_story_url" defaultValue={editingAttraction ? editingAttraction.audio_story_url : ""} placeholder="https://audio.mp3" />
                          </div>

                          <div>
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input id="tags" name="tags" defaultValue={editingAttraction ? (editingAttraction.tags || []).join(", ") : ""} placeholder="heritage, architecture, nature" />
                          </div>

                          <div>
                            <Label htmlFor="map_url">Map URL</Label>
                            <Input id="map_url" name="map_url" defaultValue={editingAttraction ? editingAttraction.map_url : ""} placeholder="https://maps.google.com?q=..." />
                          </div>

                          <div>
                            <Label htmlFor="ar_model_url">AR Model URL</Label>
                            <Input id="ar_model_url" name="ar_model_url" defaultValue={editingAttraction ? editingAttraction.ar_model_url : ""} placeholder="https://model.glb" />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="w-full">
                          {editingAttraction ? "Save Changes" : "Save Attraction"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingAttraction(null);
                            setAddAttractionOpen(false);
                          }}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {loadingMgmt ? (
                    <p className="text-center text-muted-foreground py-4">Loading attractions...</p>
                  ) : attractions.length > 0 ? (
                    attractions.map((a) => (
                      <div key={a._id || a.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                        <div>
                          <h4 className="font-semibold">{a.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{a.category}</Badge>
                            <span className="text-sm text-muted-foreground">Eco: {a.eco_score ?? "—"}/100</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditAttraction(a)}>
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteAttraction(a._id || a.id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No attractions added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Festivals Management Tab */}
          <TabsContent value="festivals" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Manage Festivals</CardTitle>

                <Dialog
                  open={addFestivalOpen}
                  onOpenChange={(open) => {
                    if (!open) setEditingFestival(null);
                    setAddFestivalOpen(open);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => { setEditingFestival(null); setAddFestivalOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" /> Add Festival
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-md rounded-xl p-6 bg-background shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold mb-2">{editingFestival ? "Edit Festival" : "Add Festival"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSaveFestival} className="space-y-4 mt-2">
                      <div>
                        <Label htmlFor="fest_name">Name</Label>
                        <Input id="fest_name" name="name" defaultValue={editingFestival?.name ?? ""} required />
                      </div>

                      <div>
                        <Label htmlFor="fest_date">Date</Label>
                        <Input id="fest_date" name="date" defaultValue={editingFestival?.date ?? ""} placeholder="YYYY-MM-DD or description" />
                      </div>

                      <div>
                        <Label htmlFor="fest_location">Location</Label>
                        <Input id="fest_location" name="location" defaultValue={editingFestival?.location ?? ""} />
                      </div>

                      <div>
                        <Label htmlFor="fest_description">Description</Label>
                        <textarea id="fest_description" name="description" defaultValue={editingFestival?.description ?? ""} className="w-full border rounded-md p-2 text-sm" rows={3} />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="w-full">{editingFestival ? "Save Changes" : "Create Festival"}</Button>
                        <Button type="button" variant="outline" onClick={() => { setEditingFestival(null); setAddFestivalOpen(false); }} className="w-full">Cancel</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {loadingMgmt ? (
                    <p className="text-center text-muted-foreground py-4">Loading festivals...</p>
                  ) : festivals.length > 0 ? (
                    festivals.map((f) => (
                      <div key={f._id || f.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{f.name}</h4>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-muted-foreground">
                            <span>{f.date}</span>
                            <span>•</span>
                            <span>{f.location}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditFestival(f)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteFestival(f._id || f.id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No festivals added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
