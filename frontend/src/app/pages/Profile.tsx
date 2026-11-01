import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  FilePlus2,
  Heart,
  LogOut,
  Medal,
  UserRound,
} from "lucide-react";
import { api } from "../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Complaint } from "../types/complaint";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

interface ProfileData {
  user: { id: string; name: string; email: string; role: string };
  stats: {
    raised_complaints: number;
    upvoted_complaints: number;
    civic_score: number;
  };
  complaints: Complaint[];
}

export function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/profile/")
      .then(({ data }) => setProfile(data))
      .catch(() => setError("Unable to load your profile."));
  }, []);

  if (error)
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  if (!profile)
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Loading your profile…
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-muted p-4">
            <UserRound className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Your profile
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              {profile.user.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.user.email}
            </p>
            <p
              className="text-sm text-muted-foreground hover:underline cursor-pointer"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="mr-2 h-2 w-2" />
              Logout
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-5 py-4">
            <Medal className="h-7 w-7 text-amber-500" />
            <div>
              <p className="text-2xl font-semibold">
                {profile.stats.civic_score}
              </p>
              <p className="text-xs text-muted-foreground">Civic score</p>
            </div>
          </div>
        </div>
      </section>
      <p className="text-sm text-muted-foreground">
        Your score is calculated as{" "}
        <span className="font-medium text-foreground">
          1 point for every complaint raised + 1 point for every complaint
          upvoted
        </span>
        .
      </p>
      <section className="grid gap-3 sm:grid-cols-2">
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <FilePlus2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-semibold">
                {profile.stats.raised_complaints}
              </p>
              <p className="text-sm text-muted-foreground">Complaints raised</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <Heart className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-semibold">
                {profile.stats.upvoted_complaints}
              </p>
              <p className="text-sm text-muted-foreground">
                Complaints upvoted
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
      <Card className="shadow-none">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Complaints you raised</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Track every report submitted from your account.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/complaints/new">Raise new</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {profile.complaints.map((item) => (
            <Link
              key={item.id}
              to={`/complaints/${item.id}`}
              className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.ticket_number} ·{" "}
                  {new Date(item.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline">{item.status}</Badge>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
          {profile.complaints.length === 0 && (
            <div className="py-10 text-center">
              <p className="font-medium">
                You have not raised a complaint yet.
              </p>
              <Button variant="link" asChild>
                <Link to="/complaints/new">Create your first report</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
