import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, TrendingUp, Heart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface HeroProps {
  onGetStarted: () => void;
}
const Hero = ({ onGetStarted }: HeroProps) => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/signup"); // new signup route
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 animate-bounce">
          <ChefHat className="w-12 h-12 text-white" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce delay-1000">
          <Zap className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            NutriCoach Pro
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered nutrition and fitness companion. Get personalized meal plans, 
            track your progress, and achieve your health goals with intelligent coaching.
          </p>
          <Button 
            onClick={handleSignUp}
            size="lg"
            className="bg-white text-food-orange hover:bg-white/90 shadow-glow px-8 py-6 text-lg font-semibold flex-auto mr-4 mb-1"
          >
            Start Your Journey
          </Button>
          <Button 
            onClick={handleSignIn}
            size="lg"
            className="bg-white text-food-orange hover:bg-white/90 shadow-glow px-8 py-6 text-lg font-semibold"
          >
            Sign In
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-soft">
            <CardContent className="p-6 text-center">
              <ChefHat className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Smart Meal Planning
              </h3>
              <p className="text-white/80">
                AI-generated recipes based on your pantry, preferences, and nutritional goals
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-soft">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Progress Tracking
              </h3>
              <p className="text-white/80">
                Monitor calories, macros, workouts, mood, and hydration in one place
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-soft">
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Personalized Coaching
              </h3>
              <p className="text-white/80">
                Adaptive recommendations and habit formation to keep you motivated
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Hero;