import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl text-slate-900 mb-4">404</h1>
      <h2 className="text-2xl text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-slate-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="bg-blue-700 hover:bg-blue-800">
        <Link to="/">
          <Home className="w-4 h-4 mr-2" />
          Back to Community
        </Link>
      </Button>
    </div>
  );
}