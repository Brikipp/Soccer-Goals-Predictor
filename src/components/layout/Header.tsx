import { useTheme } from "../../ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 shadow">
      <h1 className="text-xl font-semibold dark:text-white">⚽ Soccer Goals Predictor</h1>
      
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
      </button>
    </header>
  );
}
