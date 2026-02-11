import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Star, 
  CreditCard,
  Settings,
  FileCheck,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, badge: "Beta" },
  { label: "My Accounts", path: "/accounts", icon: Building2 },
  { label: "My Businesses", path: "/businesses", icon: Building2 },
  { label: "Complaints", path: "/complaints", icon: FileText },
  { label: "Reviews", path: "/reviews", icon: Star },
  { label: "Subscriptions", path: "/subscriptions", icon: CreditCard },
  { label: "White Label Settings", path: "/white-label", icon: Settings },
  { label: "Privacy Policy", path: "/privacy", icon: Shield },
];

export default function CustomerSidebar() {
  const [location] = useLocation();
  const { user } = useUser();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <img 
            src="/revsboost-logo.png" 
            alt="RevsBoost Logo" 
            className="h-8 w-auto object-contain"
          />
          <span className="font-display font-bold text-lg revsboost-gradient-dark bg-clip-text text-transparent">
            RevsBoost
          </span>
        </Link>
      </div>

      {/* Account Selector */}
      <div className="p-4 border-b border-slate-200">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Account
        </div>
        <div className="text-sm font-medium text-slate-900">
          {user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user?.username || "Personal account"}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || 
              (item.path === "/dashboard" && location === "/") ||
              (item.path === "/businesses" && location.startsWith("/business/") && !location.includes("/qr"));
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:font-bold"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
