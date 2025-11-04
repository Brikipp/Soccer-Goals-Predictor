import { TrendingUp, History, User, LogIn, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const publicNavItems = [
  { title: "Predictions", route: "/", icon: TrendingUp },
  { title: "History", route: "/history", icon: History },
  { title: "Profile", route: "/settings", icon: User },
  { title: "Login", route: "/auth", icon: LogIn },
];

const authenticatedNavItems = [
  { title: "Predictions", route: "/", icon: TrendingUp },
  { title: "History", route: "/history", icon: History },
  { title: "Profile", route: "/settings", icon: User },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const navItems = user ? authenticatedNavItems : publicNavItems;

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
              
              {/* Logout button for authenticated users */}
              {user && (
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Logout">
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <LogOut className="h-5 w-5 shrink-0" />
                      <span className="font-medium">Logout</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
