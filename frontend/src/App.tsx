import { Route, Switch, Redirect } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// Import the TooltipProvider
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import ClassesView from "@/views/class-view";
import RoomsView from "@/views/room-view";
import RegistrationsView from "@/views/registration-view";
import ClassTypesView from "@/views/class-type-view";
import SubscriptionsView from "@/views/subscription-view";
import EquipmentView from "@/views/equipment-view";
import EntriesView from "@/views/entry-view";
import SalesView from "@/views/sales-view";
import EmployeeView from "@/views/employee-view";
import GymsView from "@/views/gym-view";
import AddressesView from "@/views/address-view";
import SponsorsView from "@/views/sponsor-view";
import ContractsView from "@/views/contract-view";
import ClientsView from "@/views/client-view";
import ArticlesView from "@/views/article-view";
import StocktakingsView from "@/views/stocktaking-view";
import TransactionsView from "@/views/transaction-view";
import EmployeeCreateView from "@/views/employee-create-view";
import ReceptionistCreateView from "@/views/receptionist-create-view";
import TrainerCreateView from "@/views/trainer-create-view";
import PersonalTrainingsView from "./views/personal-training-view";
import GymEmployeesDetailView from "./views/gym-employees-view";
import ClientAnalyticsDashboard from "./views/analytics/client-analytics-view";

export default function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex-1 overflow-hidden">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border" />
              <p className="text-sm text-muted-foreground font-medium">Gym Management</p>
            </header>

            <div className="mx-auto max-w-[1126px] min-h-[calc(100vh-3.5rem)] border-x border-border bg-card/30">
              <Switch>
                <Route path="/gyms" component={GymsView} />
                <Route path="/classes" component={ClassesView} />
                <Route path="/rooms" component={RoomsView}/>
                <Route path="/registrations" component={RegistrationsView}/>
                <Route path="/class-types" component={ClassTypesView}/>
                <Route path="/subscriptions" component={SubscriptionsView}/>
                <Route path="/equipment" component={EquipmentView}/>
                <Route path="/entries" component={EntriesView}/>
                <Route path="/sales" component={SalesView}/>
                <Route path="/clients" component={ClientsView}/>
                <Route path="/articles" component={ArticlesView}/>
                <Route path="/stocktakings" component={StocktakingsView}/>
                <Route path="/transactions" component={TransactionsView}/>
                <Route path="/employees" component={EmployeeView}/>
                <Route path="/addresses" component={AddressesView}/>
                <Route path="/sponsors" component={SponsorsView}/>
                <Route path="/contracts" component={ContractsView}/>
                <Route path="/personaltrainings" component={PersonalTrainingsView}/>
                <Route path="/employees/new" component={EmployeeCreateView}/>
                <Route path="/receptionists/new" component={ReceptionistCreateView}/>
                <Route path="/trainers/new" component={TrainerCreateView}/>
                <Route path="/gyms/:gym_id/employees" component={GymEmployeesDetailView} />
                <Route path="/analytics/clients" component={ClientAnalyticsDashboard} />
                <Route>
                  <Redirect to="/gyms" />
                </Route>
              </Switch>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}