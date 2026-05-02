import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import DiseasePrediction from "@/pages/disease-prediction";
import DrugRecommendation from "@/pages/drug-recommendation";
import HeartAssessment from "@/pages/heart-assessment";
import MediBot from "@/pages/medibot";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/disease-prediction" component={DiseasePrediction} />
      <Route path="/drug-recommendation" component={DrugRecommendation} />
      <Route path="/heart-assessment" component={HeartAssessment} />
      <Route path="/medibot" component={MediBot} />
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
