"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      saveToken(res.data.access_token);
      router.push("/restaurants");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center">
            Welcome Back 👋
          </h2>

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button onClick={handleLogin} disabled={loading}>
            {loading ? (
              <>
                <Spinner className="size-4" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
