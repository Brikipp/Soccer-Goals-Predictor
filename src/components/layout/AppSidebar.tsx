import { TrendingUp, History, Settings, LogIn } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar.tsx";

const navItems = [
  { title: "Predictions", route: "/", icon: TrendingUp },
  { title: "History", route: "/history", icon: History },
  { title: "Settings", route: "/settings", icon: Settings },
  { title: "Login", route: "/auth", icon: LogIn },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-gray-200 bg-white"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-800 font-semibold">
            {open && "⚽ Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.route}
                      className={({ isActive }) =>
                        `flex items-center gap-3 transition-all rounded-md ${
                          isActive
                            ? "bg-green-600 text-white font-medium shadow-md"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
