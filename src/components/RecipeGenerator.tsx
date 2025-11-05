import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Utensils, Star } from "lucide-react";
import { UserProfile } from "./OnboardingFlow";
import { useToast } from "@/hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { model } from "@/lib/gemini";

interface Recipe {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servings: number;
  cookTime: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  pantryMatch: number;
}

interface RecipeGeneratorProps {
  profile: UserProfile;
}

const RecipeGenerator = ({ profile }: RecipeGeneratorProps) => {
  const [availableIngredients, setAvailableIngredients] = useState(profile.pantryItems);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();


// ✅ Replace your existing generateRecipes function with this one
const generateRecipes = async () => {
  setIsGenerating(true);

  try {
    const prompt = `
    Generate 3 recipes in valid JSON format based on these available ingredients:
    ${availableIngredients || "no ingredients"}.

    Each recipe must follow this exact TypeScript interface:
    [
      {
        "id": "string",
        "name": "string",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fats": number,
        "servings": number,
        "cookTime": number,
        "difficulty": "Easy" | "Medium" | "Hard",
        "ingredients": ["string"],
        "instructions": ["string"],
        "tags": ["string"],
        "pantryMatch": number
      }
    ]
    Output *only pure JSON* (no markdown, explanations, or extra text).
    `;

    // Generate AI content
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Remove markdown formatting if Gemini adds it
    const cleanText = text.replace(/```json|```/g, "").trim();

    let parsed: Recipe[] = [];
    try {
      parsed = JSON.parse(cleanText);
    } catch (err) {
      console.error("Error parsing AI JSON:", err, cleanText);
      toast({
        title: "Error",
        description: "AI returned invalid JSON. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    // Keep your existing filtering logic
    let filteredRecipes = parsed;
    if (profile.dietType === "vegetarian" || profile.dietType === "vegan") {
      filteredRecipes = parsed.filter(
        (r) => r.tags.includes("Vegetarian") || r.tags.includes("Vegan")
      );
    }

    setRecipes(filteredRecipes);
    toast({
      title: "Recipes Generated!",
      description: `Found ${filteredRecipes.length} new recipes matching your preferences.`,
    });
  } catch (error) {
    console.error("Error generating recipes:", error);
    toast({
      title: "Error",
      description: "Failed to generate recipes. Please try again later.",
      variant: "destructive",
    });
  } finally {
    setIsGenerating(false);
  }
};


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-success-green";
      case "medium": return "bg-food-orange";
      case "hard": return "bg-food-red";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Recipe Generator
          </h1>
          <p className="text-muted-foreground">
            Get personalized recipes based on your pantry and preferences
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-food-orange" />
              Available Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <textarea
                className="w-full p-3 border rounded-md min-h-24 resize-none"
                value={availableIngredients}
                onChange={(e) => setAvailableIngredients(e.target.value)}
                placeholder="Enter ingredients you have: chicken, rice, onions, tomatoes..."
              />
              <Button 
                onClick={generateRecipes}
                disabled={isGenerating}
                className="bg-food-orange hover:bg-food-orange/90"
              >
                {isGenerating ? "Generating..." : "Generate Recipes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Results */}
        {recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="shadow-soft hover:shadow-deep transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`${getDifficultyColor(recipe.difficulty)} text-white`}
                    >
                      {recipe.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.cookTime}m
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {recipe.pantryMatch}% match
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Nutrition Info */}
                  <div className="mb-4 p-3 bg-gradient-card rounded-lg">
                    <div className="text-lg font-semibold text-center mb-2">
                      {recipe.calories} kcal
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{recipe.protein}g</div>
                        <div className="text-muted-foreground">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{recipe.carbs}g</div>
                        <div className="text-muted-foreground">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{recipe.fats}g</div>
                        <div className="text-muted-foreground">Fats</div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Ingredients */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <Utensils className="h-4 w-4" />
                      Ingredients
                    </h4>
                    <ul className="text-sm space-y-1">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {recipes.length === 0 && !isGenerating && (
          <Card className="text-center py-12 shadow-soft">
            <CardContent>
              <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Cook?</h3>
              <p className="text-muted-foreground mb-4">
                Add your available ingredients and let our AI generate personalized recipes for you.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecipeGenerator;