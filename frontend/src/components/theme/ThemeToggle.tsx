
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const isDark = (() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  })();

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleToggle} 
      className="h-9 w-9 p-0 hover:bg-accent focus-ring"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-foreground transition-colors" />
      ) : (
        <Moon className="h-4 w-4 text-foreground transition-colors" />
      )}
    </Button>
  );
}
