import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import CreateBusiness from "@/pages/CreateBusiness";
import BusinessQR from "@/pages/BusinessQR";

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
      <Route path="/business/new" component={CreateBusiness} />
      <Route path="/business/:id/qr" component={BusinessQR} />
      
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
