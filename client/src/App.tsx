import { useEffect } from "react";
import { Switch, Route, useLocation, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import AdminRoute from "@/components/AdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

import Home from "@/pages/Home";
import HowItWorks from "@/pages/HowItWorks";
import Features from "@/pages/Features";
import Insights from "@/pages/Insights";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import Articles from "@/pages/Articles";
import ArticleDetail from "@/pages/ArticleDetail";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import AuthPage from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import ManageUsers from "@/pages/admin/ManageUsers";
import ManageBusinesses from "@/pages/admin/ManageBusinesses";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminBusinessDetail from "@/pages/admin/AdminBusinessDetail";
import AdminSystemErrors from "@/pages/admin/AdminSystemErrors";
import AdminFeatureFlags from "@/pages/admin/AdminFeatureFlags";
import AdminSettings from "@/pages/admin/AdminSettings";
import ComingSoonPage from "@/pages/admin/ComingSoonPage";
import CreateBusiness from "@/pages/CreateBusiness";
import BusinessQR from "@/pages/BusinessQR";
import BusinessDetails from "@/pages/BusinessDetails";
import Settings from "@/pages/Settings";

// Review Flow — single page at /r/:slug (old /review and /feedback redirect here)
import ReviewLanding from "@/pages/review/ReviewLanding";
import NotFound from "@/pages/not-found";

function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}

function RedirectAdminToOverview() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/admin/overview");
  }, [setLocation]);
  return null;
}

function RedirectToReviewSlug({ path }: { path: string }) {
  const [, params] = useRoute(path);
  const [, setLocation] = useLocation();
  const slug = params?.slug ?? "";
  useEffect(() => {
    if (slug) setLocation(`/r/${slug}`);
  }, [slug, setLocation]);
  return null;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      {/* Public Marketing Routes */}
      <Route path="/" component={Home} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/features" component={Features} />
      <Route path="/insights" component={Insights} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/articles" component={Articles} />
      <Route path="/articles/:slug" component={ArticleDetail} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/login" component={() => <AuthPage mode="login" />} />
      <Route path="/signup" component={() => <AuthPage mode="signup" />} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* App Routes */}
      <Route path="/dashboard" component={Dashboard} />
      {/* Admin: redirect /admin to /admin/overview */}
      <Route path="/admin">
        {() => <RedirectAdminToOverview />}
      </Route>
      <Route path="/admin/overview">
        {() => (
          <AdminPage>
            <AdminOverview />
          </AdminPage>
        )}
      </Route>
      <Route path="/admin/businesses/:businessId">
        {() => (
          <AdminPage>
            <AdminBusinessDetail />
          </AdminPage>
        )}
      </Route>
      <Route path="/admin/businesses">
        {() => (
          <AdminPage>
            <ManageBusinesses />
          </AdminPage>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <AdminPage>
            <ManageUsers />
          </AdminPage>
        )}
      </Route>
      <Route path="/admin/integrations/google">
        {() => (
          <AdminPage>
            <ComingSoonPage
              title="Google Business Profile"
              description="Connect and manage Google Business Profile integrations."
              flag="google_integration_enabled"
            />
          </AdminPage>
        )}
      </Route>
      <Route path="/admin/billing/subscriptions">
        {() => (
          <AdminPage>
            <ComingSoonPage
              title="Subscriptions"
              description="Manage Stripe subscriptions and billing."
              flag="billing_enabled"
            />
          </AdminPage>
        )}
      </Route>
      <Route path="/admin/system/jobs">
        {() => (
          <AdminPage>
            <ComingSoonPage
              title="Jobs & Sync"
              description="Background jobs and sync status."
              flag="jobs_sync_enabled"
            />
          </AdminPage>
        )}
      </Route>
      <Route path="/admin/system/errors">
        {() => (
          <AdminPage>
            <AdminSystemErrors />
          </AdminPage>
        )}
      </Route>
      <Route path="/admin/system/feature-flags">
        {() => (
          <AdminPage>
            <AdminFeatureFlags />
          </AdminPage>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <AdminPage>
            <AdminSettings />
          </AdminPage>
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
    </>
  );
}

function App() {
  const [location] = useLocation();
  const showHeader = !location.startsWith("/r/");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showHeader && <Header />}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
