import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
export function Login() {
  const { login } = useAuth(); const navigate = useNavigate(); const [email, setEmail] = useState("citizen@swarajsetu.local"); const [password, setPassword] = useState("demo1234"); const [error, setError] = useState("");
  const submit = async (event: FormEvent) => { event.preventDefault(); try { await login(email, password); navigate("/dashboard"); } catch { setError("Unable to sign in. Check your credentials."); } };
  return <div className="min-h-screen grid place-items-center bg-slate-100 p-4"><Card className="w-full max-w-md"><CardHeader><CardTitle>Sign in to Swaraj Setu</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div><div><Label>Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></div>{error && <p className="text-sm text-red-600">{error}</p>}<Button className="w-full" type="submit">Sign in</Button><p className="text-xs text-slate-500">Demo admin: admin@swarajsetu.local / admin1234</p></form></CardContent></Card></div>;
}
