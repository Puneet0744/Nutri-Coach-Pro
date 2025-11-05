require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------
// Authentication Middleware
// ------------------------
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });

  req.user = data.user;
  next();
}

// ------------------------
// Health Check
// ------------------------
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ------------------------
// PROFILE Endpoints
// ------------------------

// GET profile (by logged-in user)
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') return res.status(400).json({ error: error.message });
    res.json(data || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST profile (create or update)
app.post('/api/profile', authenticate, async (req, res) => {
  const profile = { ...req.body, user_id: req.user.id };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// ------------------------
// RECIPES Endpoints
// ------------------------

// GET recipes for logged-in user
app.get('/api/recipes', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST create recipe
app.post('/api/recipes', authenticate, async (req, res) => {
  const recipe = { ...req.body, user_id: req.user.id };
  if (!recipe.name) return res.status(400).json({ error: 'missing recipe.name' });

  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipe])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// ------------------------
// DASHBOARD Endpoints
// ------------------------

// GET dashboard for logged-in user
app.get("/api/dashboard", authenticate, async (req, res) => {
  try {
    console.log("✅ /api/dashboard called");
    console.log("req.user:", req.user);

    const { data, error } = await supabase
      .from("dashboard")
      .select("*")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });

    // ✅ If no record exists, create a default one automatically
    if (!data) {
      console.log("🆕 No dashboard found for user:", req.user.id, "- creating one...");

      const { data: newData, error: insertError } = await supabase
        .from("dashboard")
        .insert([{
          user_id: req.user.id,
          caloriesconsumed: 0,
          steps: 0,
          waterintake: 0,
          sleep: 0,
          mood: 3,
        }])
        .select()
        .single();

      if (insertError) {
        console.error("❌ Insert error:", insertError);
        return res.status(400).json({ error: insertError.message });
      }

      return res.json(newData);
    }

    // ✅ Otherwise return the existing record
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});


// POST update dashboard for logged-in user
app.post('/api/dashboard', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('dashboard')
      .upsert({ user_id: req.user.id, ...req.body });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// ------------------------
// MEALS Endpoints
// ------------------------

// GET all meals for logged-in user
app.get('/api/meals', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST add new meal
app.post('/api/meals', authenticate, async (req, res) => {
  try {
    const { meal_time, meal_name, calories, protein, carbs, fiber } = req.body;

    if (!meal_time || !meal_name) {
      return res.status(400).json({ error: 'meal_time and meal_name are required' });
    }

    const { data, error } = await supabase
      .from('meals')
      .insert([{
        user_id: req.user.id,
        meal_time,
        meal_name,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fiber: fiber || 0,
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// DELETE meal by id
app.delete('/api/meals/:id', authenticate, async (req, res) => {
  try {
    const mealId = req.params.id;
    if (!mealId) return res.status(400).json({ error: 'Missing meal id' });

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});


// ------------------------
// Start Server
// ------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
