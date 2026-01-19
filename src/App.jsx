import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterCollege from "@/pages/RegisterCollege";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import GuardDashboard from "@/pages/GuardDashboard";
import SeminarDetailsPage from "@/pages/SeminarDetailsPage";
import StudentRegisterPage from "@/pages/StudentRegisterPage";
import SeatSelectionPage from "@/pages/SeatSelectionPage";
function Router() {
    return (<Switch>
      <Route path="/" component={LandingPage}/>
      <Route path="/login" component={LoginPage}/>
      <Route path="/register" component={RegisterCollege}/>
      
      {/* Role Protected Routes (handled by navigation logic inside pages) */}
      <Route path="/superadmin/dashboard" component={SuperAdminDashboard}/>
      <Route path="/:collegeSlug/admin" component={AdminDashboard}/>
      <Route path="/:collegeSlug/admin/dashboard" component={AdminDashboard}/>
      <Route path="/:collegeSlug/admin/seminars" component={AdminDashboard}/>
      <Route path="/:collegeSlug/admin/seminars/:seminarSlug" component={AdminDashboard}/>
      <Route path="/:collegeSlug/admin/halls" component={AdminDashboard}/>
      <Route path="/:collegeSlug/guard/dashboard" component={GuardDashboard}/>
      
      {/* Public Student Routes */}
      <Route path="/:collegeSlug/:seminarSlug" component={SeminarDetailsPage}/>
      <Route path="/:collegeSlug/:seminarSlug/register" component={StudentRegisterPage}/>
      <Route path="/:collegeSlug/:seminarSlug/seats" component={SeatSelectionPage}/>

      <Route component={NotFound}/>
    </Switch>);
}
function App() {
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PWARegister />
        <InstallBanner />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>);
}
export default App;
