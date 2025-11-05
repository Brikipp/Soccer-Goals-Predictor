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
import { Separator } from '@/components/ui/separator';

const publicNavItems = [
  { title: "Predictions", route: "/", icon: TrendingUp },
  { title: "History", route: "/history", icon: History },
  { title: "Profile", route: "/settings", icon: User },
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
      await new Promise(resolve => setTimeout(resolve, 100));
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
          {/* Improved header with better visibility */}
          <SidebarGroupLabel className="text-gray-900 dark:text-gray-50 font-bold text-base px-4 py-3">
            {open ? (
              <div className="flex items-center gap-2">
                <span className="text-xl">⚽</span>
                <span>Navigation</span>
              </div>
            ) : (
              <span className="text-xl mx-auto">⚽</span>
            )}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Main navigation items with improved contrast */}
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.route}
                      className={({ isActive }) =>
                        `flex items-center gap-3 transition-all rounded-md px-3 py-2 ${
                          isActive
                            ? "bg-primary text-primary-foreground font-medium shadow-md"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Separator for better visual organization */}
              {(user || !user) && (
                <div className="px-2 py-2">
                  <Separator className="bg-gray-200 dark:bg-gray-800" />
                </div>
              )}
              
              {/* Login button for non-authenticated users with distinct styling */}
              {!user && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Login"
                    className="bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                  >
                    <NavLink
                      to="/auth"
                      className="flex items-center gap-3 transition-all rounded-md px-3 py-2 text-primary dark:text-primary-foreground font-medium"
                    >
                      <LogIn className="h-5 w-5 shrink-0" />
                      <span>Login</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {/* Logout button with improved visibility and feedback */}
              {user && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Logout" 
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300 px-3 py-2 transition-all font-medium"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Logout</span>
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