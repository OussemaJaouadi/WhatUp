
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { animate, createScope } from "animejs";

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
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        ref={buttonRef}
        variant="outline" 
        size="lg"
        onClick={handleToggle} 
        className="theme-toggle-btn h-14 w-14 p-0 btn-primary shadow-cozy-lg glow-warm hover:glow-yellow transition-all duration-300 group"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <Sun className="h-6 w-6 text-primary-foreground transition-transform group-hover:rotate-12" />
        ) : (
          <Moon className="h-6 w-6 text-primary-foreground transition-transform group-hover:-rotate-12" />
        )}
      </Button>
    </div>
  );
}

