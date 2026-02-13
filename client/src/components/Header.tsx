import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, LayoutDashboard, Shield, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { homeCopy } from "@/content/homeCopy";

export default function Header() {
  const [location] = useLocation();
  const { user, isLoading } = useUser();
  const logoutMutation = useLogout();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (location.startsWith("/r/")) {
    return null;
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const isMarketing =
    location === "/" ||
    location === "/pricing" ||
    location === "/how-it-works" ||
    location === "/features" ||
    location === "/insights" ||
    location === "/about" ||
    location === "/articles" ||
    location.startsWith("/articles/") ||
    location === "/contact" ||
    location === "/privacy" ||
    location === "/terms";
  const isLanding = isMarketing;
  const isAppRoute = /^\/(dashboard|admin|business|settings)/.test(location);
  const { brand, nav } = homeCopy;

  const showCenterNav = isLanding;
  const userInitials = user?.username?.charAt(0).toUpperCase() ?? "U";
  const isAdmin = user?.role === "admin";

  const headerStyle =
    isLanding && !scrolled
      ? { background: "transparent", borderColor: "transparent" }
      : {
          background: "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
        };

  const navLinkClass =
    "text-sm font-normal text-slate-600 hover:text-slate-900 transition-colors no-underline";
  const primaryCtaClass =
    "inline-flex font-semibold rounded-lg px-5 py-2.5 text-sm bg-[#162C4E] text-white hover:bg-[#112240] transition-colors no-underline";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-md border-b ${
        isLanding && !scrolled ? "border-transparent" : "border-slate-200"
      }`}
      style={headerStyle}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center h-14 sm:h-16">
        {/* Logo — same spot everywhere */}
        <Link href="/" className="flex items-center gap-2 shrink-0 no-underline group">
          <img src="/revsboost-logo.png" alt="" className="h-9 w-auto object-contain" />
          <span className="font-bold text-lg text-slate-900">{brand.name}</span>
          <span className="w-1.5 h-4 rounded-sm shrink-0 bg-[#2EE8E6]" aria-hidden />
        </Link>

        {/* Center nav — landing only */}
        {showCenterNav && (
          <nav className="hidden sm:flex flex-1 justify-center items-center gap-6 lg:gap-8">
            {nav.links.map((link) => {
              const match = link.href.match(/#(.+)$/);
              const sectionId = match ? match[1] : null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (location === "/" && sectionId) {
                      e.preventDefault();
                      document.getElementById(sectionId)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  className={navLinkClass}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right — same spot everywhere: CTAs or user menu */}
        <div className="flex items-center gap-6 shrink-0 ml-auto">
          {!isLoading && user != null ? (
            <>
              {isAppRoute && (
                <Link
                  href="/dashboard"
                  className="text-sm font-normal text-slate-600 hover:text-slate-900 px-3 py-2.5 rounded-lg hover:bg-slate-100/80 transition-colors hidden sm:inline-flex items-center gap-2 no-underline"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-normal text-slate-600 hover:text-slate-900 px-3 py-2.5 rounded-lg hover:bg-slate-100/80 transition-colors hidden sm:inline-flex items-center gap-2 no-underline"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 h-9 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#162C4E] text-white text-sm font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate">
                      {user.username}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border border-slate-200 shadow-card-hover rounded-xl"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-500">{isAdmin ? "Admin" : "User"}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center cursor-pointer rounded-lg">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href={nav.ctas.secondary.href} className={navLinkClass}>
                {nav.ctas.secondary.label}
              </Link>
              <Link href={nav.ctas.primary.href} className={primaryCtaClass}>
                {nav.ctas.primary.label}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
