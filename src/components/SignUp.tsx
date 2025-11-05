import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignUp = async () => {
    setErrorMsg("");

    // 1. Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // 2. Redirect to onboarding flow, pass the user ID
    navigate("/onboarding", { state: { userId: data.user?.id } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-3xl font-bold mb-6">Create an Account</h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded border"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded border"
        />
        {errorMsg && <div className="text-red-500">{errorMsg}</div>}

        <Button onClick={handleSignUp} className="w-full">
          Sign Up
        </Button>
      </div>
    </div>
  );
};

export default SignUp;
