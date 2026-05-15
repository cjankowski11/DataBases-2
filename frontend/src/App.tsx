import { Route, Switch, Redirect } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// Import the TooltipProvider
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import ClassesView from "@/views/class-view";
import RoomsView from "@/views/room-view";
import RegistrationsView from "@/views/registration-view";
import ClassTypesView from "@/views/class-type-view";

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
                <Route path="/classes" component={ClassesView} />
                <Route path="/rooms" component={RoomsView}/>
                <Route path="/registrations" component={RegistrationsView}/>
                <Route path="/class-types" component={ClassTypesView}/>
                <Route>
                  <Redirect to="/classes" />
                </Route>
              </Switch>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}