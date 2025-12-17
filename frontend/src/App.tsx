import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Attractions from "@/pages/Attractions";
import AttractionDetail from "@/pages/AttractionDetail";
import Itinerary from "@/pages/Itinerary";
import Festivals from "@/pages/Festivals";
import FestivalDetail from "./pages/FestivalDetail";
import IdentifyPlace from "@/pages/IdentifyPlace";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import ProfileSetup from "@/pages/ProfileSetup";
import NotFound from "@/pages/NotFound";
import FloatingChatbot from "@/components/Chatbot/FloatingChatbot";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <FloatingChatbot />  
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/attractions" element={<Attractions />} />
          <Route path="/attractions/:id" element={<AttractionDetail />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/festivals" element={<Festivals />} />
          <Route path="/festivals/:id" element={<FestivalDetail />} />
          <Route path="/identify" element={<IdentifyPlace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile-setup" element={<ProfileSetup />} /> 
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;