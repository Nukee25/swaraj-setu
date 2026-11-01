import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  FileText,
  Home,
  Plus,
  Menu,
  Shield,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import logoImage from "figma:asset/98f3f2f79a2b40306096f605e1f0bbbea5c3ac7e.png";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const isPublic = user?.role === "public";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    ...(isPublic
      ? [{ name: "Raise a Complaint", href: "/complaints/new", icon: Plus }]
      : []),
    { name: "All Complaints", href: "/complaints", icon: FileText },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              active ? "bg-blue-700 text-white" : "text-white hover:bg-blue-800"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="SwarajSetu Logo"
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <h1 className="text-lg text-white leading-tight">SwarajSetu</h1>
                <p className="text-xs text-blue-200">
                  Citizen Complaint Portal
                </p>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLinks />
            </nav>

            {/* Right side: role badge + logout */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-800/60 border border-blue-600">
                {user?.role === "admin" ? (
                  <Shield className="w-3.5 h-3.5 text-orange-300" />
                ) : (
                  <User className="w-3.5 h-3.5 text-blue-200" />
                )}
                <span className="text-xs text-white capitalize">
                  {user?.role}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-800"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-800"
                onClick={() => navigate("/profile")}
                aria-label="Open profile"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:bg-blue-800"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-6 pt-2">
                    {user?.role === "admin" ? (
                      <Shield className="w-4 h-4 text-orange-500" />
                    ) : (
                      <User className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm text-slate-600 capitalize">
                      {user?.role} · {user?.email}
                    </span>
                  </div>
                  <nav className="flex flex-col gap-2">
                    <NavLinks onNavigate={() => setIsOpen(false)} />
                  </nav>
                  <div className="mt-auto pt-6 border-t border-slate-200">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-slate-600"
                      onClick={toggleTheme}
                    >
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                      {theme === "dark" ? "Light mode" : "Dark mode"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-slate-600"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
