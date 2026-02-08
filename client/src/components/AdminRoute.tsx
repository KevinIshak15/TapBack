import { useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard component that ensures only admin users can access protected routes
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  return <>{children}</>;
}
