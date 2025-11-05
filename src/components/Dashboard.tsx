import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "./TopNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import {
  Activity,
  Target,
  Droplets,
  Moon,
  ChefHat,
  Calendar,
  Plus,
} from "lucide-react";

const API_BASE_URL = "http://localhost:4000";

interface Meal {
  id?: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  meal_time: "breakfast" | "lunch" | "dinner" | string;
}

interface Profile {
  name?: string;
  goal?: string;
  dietType?: string;
  cuisine?: string;
  calorieTarget?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyData, setDailyData] = useState({
    caloriesConsumed: 0,
    steps: 0,
    waterIntake: 0,
    sleep: 0,
    mood: 3,
  });
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState<Meal>({
    meal_name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fiber: 0,
    meal_time: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch profile, dashboard and meals
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        navigate("/signin");
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${session.access_token}` };

        // profile
        const profileRes = await fetch(`${API_BASE_URL}/api/profile`, { headers });
        if (profileRes.status === 404) {
          navigate("/onboarding");
          return;
        }
        const profileData = await profileRes.json();
        setProfile(profileData);

        // dashboard
        const dashboardRes = await fetch(`${API_BASE_URL}/api/dashboard`, { headers });
        const dashboardData = await dashboardRes.json();
        setDailyData({
          caloriesConsumed: dashboardData.caloriesConsumed || 0,
          steps: dashboardData.steps || 0,
          waterIntake: dashboardData.waterIntake || 0,
          sleep: dashboardData.sleep || 0,
          mood: dashboardData.mood || 3,
        });

        // meals
        const mealsRes = await fetch(`${API_BASE_URL}/api/meals`, { headers });
        const mealsData = await mealsRes.json();
        setMeals(Array.isArray(mealsData) ? mealsData : []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Add meal
  const handleAddMeal = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      navigate("/signin");
      return;
    }

    // validation
    if (!newMeal.meal_time || !["breakfast", "lunch", "dinner"].includes(newMeal.meal_time)) {
      alert("Please select a valid meal time.");
      return;
    }
    if (!newMeal.meal_name || newMeal.meal_name.trim() === "") {
      alert("Please enter the meal name.");
      return;
    }

    try {
      const payload = {
        meal_time: newMeal.meal_time,
        meal_name: newMeal.meal_name,
        calories: Number(newMeal.calories) || 0,
        protein: Number(newMeal.protein) || 0,
        carbs: Number(newMeal.carbs) || 0,
        fiber: Number(newMeal.fiber) || 0,
      };

      const res = await fetch(`${API_BASE_URL}/api/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to add meal");
      }

      const added = await res.json();
      // Prepend so newest appears first (or change to append)
      setMeals((prev) => [added, ...prev]);
      // reset
      setShowAddMealModal(false);
      setNewMeal({
        meal_name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fiber: 0,
        meal_time: "",
      });
    } catch (err) {
      console.error("Add meal error:", err);
      alert("Failed to add meal. See console for details.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No profile found.
      </div>
    );
  }

  const caloriesRemaining = (profile.calorieTarget || 2000) - dailyData.caloriesConsumed;
  const caloriesProgress = (dailyData.caloriesConsumed / (profile.calorieTarget || 2000)) * 100;
  const stepsProgress = (dailyData.steps / 10000) * 100;
  const waterProgress = (dailyData.waterIntake / 2.5) * 100;

  const getMoodEmoji = (mood: number) =>
    ["😢", "😕", "😐", "😊", "😄"][mood - 1] || "😐";

  return (
    <>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, {profile.name || "User"} 👋
            </h1>
            <p className="text-muted-foreground">Here’s your nutrition and fitness overview for today</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Calories</CardTitle>
                <Target className="h-4 w-4 text-food-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailyData.caloriesConsumed}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  {caloriesRemaining > 0 ? `${caloriesRemaining} remaining` : `${Math.abs(caloriesRemaining)} over`}
                </div>
                <Progress value={caloriesProgress} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Steps</CardTitle>
                <Activity className="h-4 w-4 text-fitness-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailyData.steps.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mb-2">Goal: 10,000</div>
                <Progress value={stepsProgress} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Water</CardTitle>
                <Droplets className="h-4 w-4 text-fitness-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailyData.waterIntake}L</div>
                <div className="text-xs text-muted-foreground mb-2">Goal: 2.5L</div>
                <Progress value={waterProgress} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Wellness</CardTitle>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {getMoodEmoji(dailyData.mood)}
                  <span className="text-lg">{dailyData.sleep}h</span>
                </div>
                <div className="text-xs text-muted-foreground">Mood & Sleep</div>
              </CardContent>
            </Card>
          </div>

          {/* Meals & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-food-orange" />
                    Today's Meals
                  </CardTitle>
                  <Button size="sm" className="bg-food-orange hover:bg-food-orange/90" onClick={() => setShowAddMealModal(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Meal
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {meals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No meals added yet.</p>
                  ) : (
                    meals.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                        <div>
                          <h4 className="font-semibold capitalize">{m.meal_time}</h4>
                          <p className="text-sm text-muted-foreground capitalize mb-1">{m.meal_name}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{m.calories} kcal</div>
                          <div className="text-xs text-muted-foreground">
                            P:{m.protein}g C:{m.carbs}g F:{m.fiber}g
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Goal</span>
                      <Badge variant="secondary">{profile.goal || "—"}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Diet</span>
                      <Badge variant="outline">{profile.dietType || "—"}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cuisine</span>
                      <Badge variant="outline">{profile.cuisine || "—"}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Target</span>
                      <span className="font-semibold">{profile.calorieTarget || 2000} kcal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-food-green" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">Generate Weekly Plan</Button>
                    <Button variant="outline" className="w-full justify-start">Find Recipes</Button>
                    <Button variant="outline" className="w-full justify-start">Track Workout</Button>
                    <Button variant="outline" className="w-full justify-start">Shopping List</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Simple modal (no external Dialog) */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddMealModal(false)} />

          {/* modal box */}
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add a New Meal</h3>
              <button
                onClick={() => setShowAddMealModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Meal Name</label>
                <input
                  className="mt-1 block w-full border rounded-md p-2"
                  value={newMeal.meal_name}
                  onChange={(e) => setNewMeal({ ...newMeal, meal_name: e.target.value })}
                  placeholder="e.g., Grilled chicken salad"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calories</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fiber (g)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={newMeal.fiber}
                    onChange={(e) => setNewMeal({ ...newMeal, fiber: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Meal Time</label>
                <select
                  className="mt-1 block w-full border rounded-md p-2"
                  value={newMeal.meal_time}
                  onChange={(e) => setNewMeal({ ...newMeal, meal_time: e.target.value })}
                >
                  <option value="">Select Meal Time</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddMealModal(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMeal}
                className="px-4 py-2 rounded bg-food-orange text-white"
              >
                Add Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
