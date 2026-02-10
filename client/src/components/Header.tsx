import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, LayoutDashboard, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const { user, isLoading } = useUser();
  const logoutMutation = useLogout();

  // Don't show header on customer review flow pages
  if (location.startsWith("/r/")) {
    return null;
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const userInitials = user?.username?.charAt(0).toUpperCase() || "U";
  const userRole = user?.role || "user";
  const roleLabel = userRole === "admin" ? "Admin" : "User";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo/Brand */}
          <Link href={user ? "/dashboard" : "/"}>
            <div className="flex items-center gap-3 cursor-pointer group">
              <img 
                src="/tapback-logo.png" 
                alt="TapBack Logo" 
                className="h-9 w-auto object-contain"
              />
              <span className="font-display font-bold text-lg text-slate-900">
                TapBack
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/dashboard">
                    <Button
                      variant={location === "/dashboard" ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  {userRole === "admin" && (
                    <Link href="/admin">
                      <Button
                        variant={location === "/admin" ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 h-auto py-2 px-3 hover:bg-slate-100 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-sm font-medium text-slate-700">
                        {user.username}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 shadow-lg">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user.username}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{roleLabel}</p>
                    </div>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 mt-1 mx-1 mb-1 rounded-md"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Public Navigation */}
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">
                      Sign up
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
