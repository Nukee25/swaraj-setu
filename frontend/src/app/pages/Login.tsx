import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Shield, User } from "lucide-react";
import logoImage from "figma:asset/98f3f2f79a2b40306096f605e1f0bbbea5c3ac7e.png";
import { api } from "../utils/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check if user is already authenticated on mount
  useEffect(() => {
    api
      .get("/auth/check")
      .then((response) => {
        if (response?.authenticated === true) {
          login(response.email ?? "user", response.role ?? "public");
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.error("Auth check failed:", error);
      });
  }, [login, navigate]);

  const handleMockLogin = (role: "public" | "admin") => {
    const mockEmail = role === "admin" ? "admin@swarajsetu.gov.in" : "citizen@example.com";
    login(mockEmail, role);
    navigate("/dashboard");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    api
      .get(`/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
      .then((response) => {
        if (response?.token) {
          if (api) api.Token = response.token;
          localStorage.setItem("authToken", response.token);
        }
        login(response?.email ?? email, response?.role ?? "public");
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Login failed:", error);
        alert(error?.message ?? "Login failed. Please try again.");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src={logoImage} alt="SwarajSetu Logo" className="w-20 h-20 rounded-2xl shadow-lg" />
          <div>
            <h1 className="text-3xl text-white">SwarajSetu</h1>
            <p className="text-blue-300 text-sm mt-1">Citizen Complaint Portal</p>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Access the grievance redressal portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800">
                Sign In
              </Button>
            </form>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400">
                Quick access for testing
              </span>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => handleMockLogin("public")}
              >
                <User className="w-4 h-4" />
                Login as Public User
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => handleMockLogin("admin")}
              >
                <Shield className="w-4 h-4" />
                Login as Admin
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-blue-300 text-xs">
          © 2024 SwarajSetu · Public Grievance Redressal System
        </p>
      </div>
    </div>
  );
}
