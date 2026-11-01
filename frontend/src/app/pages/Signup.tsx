import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (requestError: unknown) {
      const detail =
        requestError &&
        typeof requestError === "object" &&
        "response" in requestError
          ? (requestError.response as { data?: { detail?: string } })?.data
              ?.detail
          : undefined;
      setError(detail || "Unable to create the account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your Swaraj Setu account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Use at least 8 characters.
              </p>
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link className="text-blue-700 underline" to="/login">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
