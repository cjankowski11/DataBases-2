import { Link, useRoute } from "wouter";
import { Building2, Dumbbell, DoorOpen, Flame, ClipboardList, LayoutDashboard, Layers, CreditCard, ToolCase, UserCheck, Users, MapPinHouse, CircleDollarSign, FileText,  Package, ClipboardCheck, ShoppingCart, ChartColumn } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Gyms", url: "/gyms", icon: Building2 },
  { title: "Classes", url: "/classes", icon: Dumbbell },
  { title: "Rooms", url: "/rooms", icon: DoorOpen },
  { title: "Registrations", url: "/registrations", icon: ClipboardList },
  { title: "Class Types", url: "/class-types", icon: Layers },

  {title: "Subscriptions", url: "/subscriptions", icon: CreditCard},
  {title: "Equipment", url: "/equipment", icon: ToolCase},
  {title: "Entries", url: "/entries", icon: DoorOpen},
  {title: "Client sales", url: "/sales", icon: UserCheck},
  {title: "Employees", url: "/employees", icon: Users},
  {title: "Addresses", url: "/addresses", icon: MapPinHouse},
  {title: "Sponsors", url: "/sponsors", icon: CircleDollarSign},
  {title: "Contracts", url: "/contracts", icon: FileText},
  {title: "Clients", url: "/clients", icon: Users},
  {title: "Articles", url: "/articles", icon: Package},
  {title: "Stocktakings", url: "/stocktakings", icon: ClipboardCheck},
  {title: "Transactions", url: "/transactions", icon: ShoppingCart},
  { title: "Personal trainings", url: "/personaltrainings", icon: Flame }

];

const navAnalyticsItems = [
  { title: "Client Analytics", url: "/analytics/clients", icon: ChartColumn },
  { title: "Profit", url: "/analytics/profit", icon: ChartColumn },

];

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b h-14 justify-center px-4">
        <div className="flex items-center gap-2 font-bold">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">Gym Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const [isActive] = useRoute(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navAnalyticsItems.map((item) => {
                const [isActive] = useRoute(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}