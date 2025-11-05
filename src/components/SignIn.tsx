import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface SignInProps {
  onSignInSuccess?: () => void; // ✅ optional prop for Index.tsx integration
}

const SignIn = ({ onSignInSuccess }: SignInProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      alert("Signed in successfully!");

      // ✅ Case 1: Used inside Index.tsx → switch view
      if (onSignInSuccess) {
        onSignInSuccess();
      } else {
        // ✅ Case 2: Normal route-based navigation
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form
        onSubmit={handleSignIn}
        className="w-full max-w-md bg-card p-8 rounded-lg shadow-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-foreground text-center">Sign In</h2>

        {errorMessage && (
          <div className="text-red-500 text-sm text-center">{errorMessage}</div>
        )}

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Password</label>
          <Input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default SignIn;
