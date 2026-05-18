import { Link, useRoute } from "wouter";
import { Dumbbell, DoorOpen, ClipboardList, LayoutDashboard, Layers, CreditCard, ToolCase, UserCheck } from "lucide-react";
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
  { title: "Classes", url: "/classes", icon: Dumbbell },
  { title: "Rooms", url: "/rooms", icon: DoorOpen },
  { title: "Registrations", url: "/registrations", icon: ClipboardList },
  { title: "Class Types", url: "/class-types", icon: Layers },

  {title: "Subscriptions", url: "/subscriptions", icon: CreditCard},
  {title: "Equipment", url: "/equipment", icon: ToolCase},
  {title: "Entries", url: "/entries", icon: DoorOpen},
  {title: "Client sales", url: "/sales", icon: UserCheck},

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
      </SidebarContent>
    </Sidebar>
  );
}