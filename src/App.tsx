import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import OnboardingFlow from "./components/OnboardingFlow";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* The Index component now handles dashboard, recipes, planning, etc. */}
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingFlow onComplete={() => (window.location.href = "/dashboard")} />
                </ProtectedRoute>
              }
            />

            {/* All internal routes point to Index */}
            <Route path="/dashboard" element={<Index />} />
            <Route path="/recipes" element={<Index />} />
            <Route path="/planning" element={<Index />} />
            <Route path="/progress" element={<Index />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
