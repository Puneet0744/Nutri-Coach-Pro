// src/api/backend.js
const API_BASE_URL = "http://localhost:4000"; // change if your backend runs on a different port

// ------------------------
// Helper to get stored token
// ------------------------
function getAuthHeaders() {
  const token = localStorage.getItem("supabase_token");
  if (!token) throw new Error("Missing Supabase token in localStorage");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ------------------------
// PROFILE Endpoints
// ------------------------
export async function getProfile(userId) {
  const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
  if (!res.ok) throw new Error("Failed to get profile");
  return res.json();
}

export async function saveProfile(profile) {
  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to save profile: ${text}`);
  }
  return res.json();
}

// ------------------------
// DASHBOARD Endpoints
// ------------------------
export async function getDashboardData(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard?userId=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

// ------------------------
// RECIPES Endpoints
// ------------------------
export async function getRecipes() {
  const res = await fetch(`${API_BASE_URL}/api/recipes`);
  if (!res.ok) throw new Error("Failed to get recipes");
  return res.json();
}

export async function addRecipe(recipe) {
  const res = await fetch(`${API_BASE_URL}/api/recipes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(recipe),
  });
  if (!res.ok) throw new Error("Failed to add recipe");
  return res.json();
}

// ------------------------
// MEALS Endpoints (NEW 🍽️)
// ------------------------
export async function getMeals() {
  const res = await fetch(`${API_BASE_URL}/api/meals`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch meals: ${text}`);
  }
  return res.json();
}

export async function addMeal(meal) {
  const res = await fetch(`${API_BASE_URL}/api/meals`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(meal),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to add meal: ${text}`);
  }
  return res.json();
}
