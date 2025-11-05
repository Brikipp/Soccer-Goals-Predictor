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
          {/* Header */}
          <SidebarGroupLabel className="text-gray-900 dark:text-gray-100 font-bold text-base px-4 py-3">
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
              {/* Main navigation items */}
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.route}
                      className={({ isActive }) =>
                        `flex items-center gap-3 transition-colors rounded-md px-3 py-2.5 ${
                          isActive
                            ? "bg-primary text-black dark:text-white font-semibold shadow-sm"
                            : "text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-5 w-5 shrink-0 ${isActive ? '' : 'text-gray-700 dark:text-gray-400'}`} />
                          <span className={`font-medium ${isActive ? '' : 'text-gray-900 dark:text-gray-300'}`}>{item.title}</span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Separator */}
              <div className="px-2 py-2">
                <Separator className="bg-gray-300 dark:bg-gray-700" />
              </div>
              
              {/* Login button */}
              {!user && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Login"
                  >
                    <NavLink
                      to="/auth"
                      className="flex items-center gap-3 transition-colors rounded-md px-3 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary/20 dark:hover:bg-primary/30 dark:text-primary font-semibold"
                    >
                      <LogIn className="h-5 w-5 shrink-0" />
                      <span>Login</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {/* Logout button */}
              {user && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Logout" 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300 px-3 py-2.5 transition-colors font-semibold cursor-pointer"
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