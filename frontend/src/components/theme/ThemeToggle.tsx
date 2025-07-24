import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Determine the actual mode in use (system resolves to light/dark)
  const isDark = (() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    // system
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  })();

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button variant="outline" size="icon" onClick={handleToggle} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-blue-600" />
      )}
    </Button>
  );
}
