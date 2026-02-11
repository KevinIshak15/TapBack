import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import AdminRoute from "@/components/AdminRoute";

import Landing from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ManageUsers from "@/pages/admin/ManageUsers";
import ManageBusinesses from "@/pages/admin/ManageBusinesses";
import CreateBusiness from "@/pages/CreateBusiness";
import BusinessQR from "@/pages/BusinessQR";
import BusinessPosters from "@/pages/BusinessPosters";
import BusinessDetails from "@/pages/BusinessDetails";
import Settings from "@/pages/Settings";

// Review Flow Pages
import ReviewLanding from "@/pages/review/ReviewLanding";
import ReviewGenerator from "@/pages/review/ReviewGenerator";
import ReviewFeedback from "@/pages/review/ReviewFeedback";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Marketing Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={() => <AuthPage mode="login" />} />
      <Route path="/signup" component={() => <AuthPage mode="signup" />} />

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
      <Route path="/business/:slug/posters" component={BusinessPosters} />
      <Route path="/business/:slug" component={BusinessDetails} />
      
      {/* Customer Review Flow */}
      <Route path="/r/:slug" component={ReviewLanding} />
      <Route path="/r/:slug/review" component={ReviewGenerator} />
      <Route path="/r/:slug/feedback" component={ReviewFeedback} />

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
        <Toaster />
        {!isAppRoute && <Header />}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
