import { useEffect } from "react";
import { Switch, Route, useLocation, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import AdminRoute from "@/components/AdminRoute";

import Landing from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ManageUsers from "@/pages/admin/ManageUsers";
import ManageBusinesses from "@/pages/admin/ManageBusinesses";
import CreateBusiness from "@/pages/CreateBusiness";
import BusinessQR from "@/pages/BusinessQR";
import BusinessDetails from "@/pages/BusinessDetails";
import Settings from "@/pages/Settings";

// Review Flow — single page at /r/:slug (old /review and /feedback redirect here)
import ReviewLanding from "@/pages/review/ReviewLanding";
import NotFound from "@/pages/not-found";

function RedirectToReviewSlug({ path }: { path: string }) {
  const [, params] = useRoute(path);
  const [, setLocation] = useLocation();
  const slug = params?.slug ?? "";
  useEffect(() => {
    if (slug) setLocation(`/r/${slug}`);
  }, [slug, setLocation]);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Public Marketing Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={() => <AuthPage mode="login" />} />
      <Route path="/signup" component={() => <AuthPage mode="signup" />} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* App Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin">
        {() => (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/businesses">
        {() => (
          <AdminRoute>
            <ManageBusinesses />
          </AdminRoute>
        )}
      </Route>
      <Route path="/settings" component={Settings} />
      <Route path="/business/new" component={CreateBusiness} />
      <Route path="/business/:slug/qr" component={BusinessQR} />
      <Route path="/business/:slug/:tab?" component={BusinessDetails} />
      
      {/* Customer Review Flow — single page; old URLs redirect */}
      <Route path="/r/:slug" component={ReviewLanding} />
      <Route path="/r/:slug/review">{(params) => <RedirectToReviewSlug path="/r/:slug/review" />}</Route>
      <Route path="/r/:slug/feedback">{(params) => <RedirectToReviewSlug path="/r/:slug/feedback" />}</Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAppRoute = /^\/(dashboard|admin|business|settings)/.test(location);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!isAppRoute && <Header />}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
