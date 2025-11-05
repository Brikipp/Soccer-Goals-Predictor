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
import { supabase } from '@/services/supabaseClient';
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
  
  const navItems = user ? authenticatedNavItems : publicNavItems;

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await signOut();
      console.log('Sign out successful');
      // Small delay to ensure storage is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      // Force full page reload to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border bg-white dark:bg-gray-950"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-900 dark:text-gray-100 font-bold text-base px-4 py-3">
            {open && (
              <div className="flex items-center gap-2">
                <span className="text-xl">⚽</span>
                <span>Navigation</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.route}
                      className={({ isActive }) =>
                        `flex items-center gap-3 transition-all rounded-md px-3 py-2 ${
                          isActive
                            ? "bg-primary text-white font-medium shadow-md"
                            : "text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
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
                  <SidebarMenuButton 
                    tooltip="Logout" 
                    onClick={handleLogout}
                    className="w-full text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800 px-3 py-2"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="font-medium">Logout</span>
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
