
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { animate, createScope } from "animejs/lib/anime.es.js";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scope = useRef<any>(null);
  
  const isDark = (() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  })();

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
    
    // Cozy animation on toggle
    animate('.theme-toggle-btn', {
      scale: [1, 1.1, 1],
      rotate: [0, 180, 360],
      duration: 600,
      ease: 'outElastic(1, .8)'
    });
  };

  useEffect(() => {
    if (!buttonRef.current) return;

    scope.current = createScope({ root: buttonRef.current }).add(() => {
      // Initial cozy entrance animation
      animate('.theme-toggle-btn', {
        translateY: [50, 0],
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 800,
        delay: 1000,
        ease: 'outElastic(1, .8)'
      });
    });

    return () => scope.current?.revert();
  }, []);

  return (
    <Button 
      ref={buttonRef}
      variant="ghost" 
      size="sm"
      onClick={handleToggle} 
      className="theme-toggle-btn h-9 w-9 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group border border-slate-200 dark:border-slate-700"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
        {isDark ? (
        <Sun className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-12" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-transform group-hover:-rotate-12" />
      )}
    </Button>
  );
}

