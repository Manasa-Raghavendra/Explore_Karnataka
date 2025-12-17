import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Map,
  Calendar,
  BookOpen,
  Camera,
  User,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.clear();
    setIsOpen(false);
    navigate("/auth");
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Map },
    { name: "Attractions", path: "/attractions", icon: BookOpen },
    { name: "Itinerary", path: "/itinerary", icon: Calendar },
    { name: "Festivals", path: "/festivals", icon: Calendar },
    { name: "Identify Place", path: "/identify", icon: Camera },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Explore Karnataka
            </span>
          </Link>

          {/* ---------------- Desktop Navigation ---------------- */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={isActive(link.path) ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Button>
                </Link>
              );
            })}

            {!isLoggedIn && (
              <Link to="/auth">
                <Button variant="ghost">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}

            {role === "admin" && (
              <Link to="/admin">
                <Button variant="ghost">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}

            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-1">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-hero text-white">
                        {role === "admin" ? "A" : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40">
                  {role === "user" && (
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* ---------------- Mobile Menu Button ---------------- */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* ---------------- Mobile Menu ---------------- */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant={isActive(link.path) ? "default" : "ghost"}
                    className="w-full justify-start space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Button>
                </Link>
              );
            })}

            {!isLoggedIn && (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}

            {role === "admin" && (
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}

            {isLoggedIn && (
              <>
                {role === "user" && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/profile");
                      setIsOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
