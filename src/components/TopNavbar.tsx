import { Button } from "@/components/ui/button";
import { Home, ChefHat, Calendar, TrendingUp, Settings, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const TopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "recipes", label: "Recipes", icon: ChefHat, path: "/recipes" },
    { id: "planning", label: "Meal Plans", icon: Calendar, path: "/planning" },
    { id: "progress", label: "Progress", icon: TrendingUp, path: "/progress" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">NutriCoach Pro</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
