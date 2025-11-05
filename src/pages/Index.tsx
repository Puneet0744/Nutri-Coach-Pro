import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Hero from "@/components/Hero";
import OnboardingFlow, { UserProfile } from "@/components/OnboardingFlow";
import Dashboard from "@/components/Dashboard";
import RecipeGenerator from "@/components/RecipeGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ChefHat, Calendar, TrendingUp, Settings } from "lucide-react";

type AppState =
  | "hero"
  | "onboarding"
  | "dashboard"
  | "recipes"
  | "planning"
  | "progress";

const API_BASE_URL = "http://localhost:4000";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AppState>("hero");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // 🧭 Sync current view with URL
  useEffect(() => {
    const rawPath = location.pathname.replace(/^\/+/, ""); // e.g. "dashboard", "recipes"
    if (["dashboard", "recipes", "planning", "progress"].includes(rawPath)) {
      setCurrentView(rawPath as AppState);
    } else if (rawPath === "" || rawPath === "home") {
      setCurrentView("hero");
    } else if (rawPath === "onboarding") {
      setCurrentView("onboarding");
    } else {
      setCurrentView("hero");
    }
  }, [location.pathname]);

  // 🔹 Fetch user profile if logged in (for recipes, dashboard, etc.)
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return; // user not logged in

      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const profileData = await res.json();
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // 🔸 Handle route navigation
  const handleNavigation = (view: AppState) => {
    setCurrentView(view);
    if (view === "hero") navigate("/");
    else navigate(`/${view}`);
  };

  const handleGetStarted = () => handleNavigation("onboarding");

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    handleNavigation("dashboard");
  };

  // 🔹 Navbar items
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "recipes", label: "Recipes", icon: ChefHat },
    { id: "planning", label: "Meal Plans", icon: Calendar },
    { id: "progress", label: "Progress", icon: TrendingUp },
  ];

  // 🔸 Navbar UI
  const renderNavigation = () => (
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

          {/* Nav Buttons */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  onClick={() => handleNavigation(item.id as AppState)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // 🔸 Page Rendering Logic
  const renderContent = () => {
    switch (currentView) {
      case "hero":
        return <Hero onGetStarted={handleGetStarted} />;
      case "onboarding":
        return <OnboardingFlow onComplete={handleOnboardingComplete} />;
      case "dashboard":
        return <Dashboard />;
      case "recipes":
        return userProfile ? (
          <RecipeGenerator profile={userProfile} />
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Loading recipes...
          </div>
        );
      case "planning":
        return <ComingSoonView title="Meal Planning" />;
      case "progress":
        return <ComingSoonView title="Progress Tracking" />;
      default:
        return <Hero onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <>
      {currentView !== "hero" && currentView !== "onboarding" && renderNavigation()}
      <div
        className={
          currentView !== "hero" && currentView !== "onboarding" ? "pt-16" : ""
        }
      >
        {renderContent()}
      </div>
    </>
  );
};

// 💡 Simple Coming Soon Component
const ComingSoonView = ({ title }: { title: string }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center shadow-soft">
        <CardContent className="p-8">
          <div className="bg-gradient-primary p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground mb-6">
            This feature is coming soon! We're working hard to bring you an
            amazing {title.toLowerCase()} experience.
          </p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
