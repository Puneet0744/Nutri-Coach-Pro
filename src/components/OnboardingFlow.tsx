import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, User, Target, ChefHat, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:4000";

export interface UserProfile {
  age: number;
  sex: string;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
  timeframe: string;
  cuisine: string;
  dietType: string;
  allergies: string[];
  pantryItems: string;
  timePerMeal: string;
  budget: string;
  calorieTarget?: number;
}

// ✅ onComplete no longer passes the profile, just signals redirect
const OnboardingFlow = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    age: 0,
    sex: "",
    height: 0,
    weight: 0,
    activityLevel: "",
    goal: "",
    timeframe: "",
    cuisine: "",
    dietType: "",
    allergies: [],
    pantryItems: "",
    timePerMeal: "",
    budget: ""
  });

  const steps = [
    { icon: User, title: "Personal Info", description: "Tell us about yourself" },
    { icon: Target, title: "Goals", description: "What do you want to achieve?" },
    { icon: ChefHat, title: "Preferences", description: "Your food preferences" },
    { icon: ShoppingCart, title: "Pantry & Budget", description: "What you have and spend" }
  ];

  const calculateCalories = () => {
    let bmr;
    if (profile.sex === "male") {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    let tdee = bmr * (activityMultipliers[profile.activityLevel as keyof typeof activityMultipliers] || 1.2);

    if (profile.goal === "loss") tdee *= 0.8;
    else if (profile.goal === "gain") tdee *= 1.2;

    return Math.round(tdee);
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // final profile
      const finalProfile = { ...profile, calorieTarget: calculateCalories() };

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.access_token) throw new Error("User is not authenticated");

        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(finalProfile),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText);
        }

        toast({
          title: "Profile Complete!",
          description: "Your personalized nutrition plan is ready.",
        });

        // ✅ Call onComplete to redirect user to dashboard
        // ✅ Call onComplete and pass the profile
        onComplete(finalProfile);
      } catch (error) {
        console.error("Error saving profile:", error);
        toast({
          title: "Error",
          description: "Failed to save your profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      allergies: checked
        ? [...prev.allergies, allergy]
        : prev.allergies.filter(a => a !== allergy)
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        // Step 1: Personal Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select onValueChange={(value) => setProfile({ ...profile, sex: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                  placeholder="175"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight || ''}
                  onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) || 0 })}
                  placeholder="70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select onValueChange={(value) => setProfile({ ...profile, activityLevel: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (desk job, no exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (physical job + exercise)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        // Step 2: Goals
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Primary Goal</Label>
              <Select onValueChange={(value) => setProfile({ ...profile, goal: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="What's your main goal?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loss">Weight Loss</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain">Weight Gain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select onValueChange={(value) => setProfile({ ...profile, timeframe: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="How long do you want to work on this goal?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_month">1 Month</SelectItem>
                  <SelectItem value="3_months">3 Months</SelectItem>
                  <SelectItem value="6_months">6 Months</SelectItem>
                  <SelectItem value="1_year">1 Year</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        // Step 3: Preferences
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Preferred Cuisine</Label>
              <Select onValueChange={(value) => setProfile({ ...profile, cuisine: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="What cuisine do you enjoy most?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Diet Type</Label>
              <Select onValueChange={(value) => setProfile({ ...profile, dietType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Any dietary restrictions?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No restrictions</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                  <SelectItem value="gluten_free">Gluten-Free</SelectItem>
                  <SelectItem value="low_fodmap">Low-FODMAP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Allergies & Intolerances</Label>
              <div className="grid grid-cols-2 gap-3">
                {["Nuts", "Lactose", "Shellfish", "Eggs", "Soy", "Fish"].map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy}
                      checked={profile.allergies.includes(allergy)}
                      onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                    />
                    <Label htmlFor={allergy}>{allergy}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        // Step 4: Pantry & Budget
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pantry">Current Pantry Items</Label>
              <textarea
                className="w-full p-3 border rounded-md min-h-24 resize-none"
                id="pantry"
                value={profile.pantryItems}
                onChange={(e) => setProfile({ ...profile, pantryItems: e.target.value })}
                placeholder="Rice, chicken breast, onions, tomatoes, olive oil..."
              />
            </div>
            <div className="space-y-2">
              <Label>Time Per Meal</Label>
              <Select onValueChange={(value) => setProfile({ ...profile, timePerMeal: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="How much time do you have for cooking?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick (under 15 minutes)</SelectItem>
                  <SelectItem value="moderate">Moderate (15-30 minutes)</SelectItem>
                  <SelectItem value="elaborate">Elaborate (over 30 minutes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget Level</Label>
              <Select onValueChange={(value) => setProfile({ ...profile, budget: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="What's your grocery budget like?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-deep">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-gradient-primary p-3 rounded-full">
              {React.createElement(steps[step - 1].icon, { className: "w-8 h-8 text-white" })}
            </div>
          </div>
          <CardTitle className="text-2xl">{steps[step - 1].title}</CardTitle>
          <p className="text-muted-foreground">{steps[step - 1].description}</p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${index + 1 <= step ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* renderStep() implementation remains same */}
          {renderStep()}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              {step === 4 ? 'Complete Setup' : 'Next'}
              {step < 4 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
