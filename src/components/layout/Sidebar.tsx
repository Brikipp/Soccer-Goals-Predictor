import { useState } from "react";
import SidebarItem from "./SidebarItem";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Predictions", route: "/", icon: "TrendingUp" },
  { name: "History", route: "/history", icon: "History" },
  { name: "Settings", route: "/settings", icon: "Settings" },
  { name: "Login", route: "/auth", icon: "LogIn" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`${
        open ? "w-60" : "w-16"
      } bg-white dark:bg-gray-900 border-r dark:border-gray-700 min-h-screen flex flex-col transition-all`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {open ? <X /> : <Menu />}
      </button>

      <nav className="flex-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.name}
            name={item.name}
            icon={item.icon}
            route={item.route}
            open={open}
          />
        ))}
      </nav>
    </aside>
  );
}
