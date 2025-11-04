import * as Icons from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  name: string;
  route: string;
  icon: string;
  open: boolean;
}

export default function SidebarItem({ name, route, icon, open }: SidebarItemProps) {
  const IconComponent =
    typeof Icons[icon as keyof typeof Icons] === "function" &&
    // LucideIcon components have a displayName property
    (Icons[icon as keyof typeof Icons] as any).displayName
      ? (Icons[icon as keyof typeof Icons] as React.ElementType)
      : null;

  return (
    <NavLink
      to={route}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-md mx-2 mt-1 transition ${
          isActive
            ? "bg-blue-500 text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`
      }
    >
      {IconComponent ? (
        <IconComponent size={20} />
      ) : (
        <span className="w-5 h-5" />
      )}
      {open && <span>{name}</span>}
    </NavLink>
  );
}
