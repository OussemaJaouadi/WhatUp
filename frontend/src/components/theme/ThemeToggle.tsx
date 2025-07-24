

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import anime from "animejs";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const isDark = (() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  })();

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
    
    // Cozy animation on toggle
    if (buttonRef.current) {
      anime({
        targets: buttonRef.current,
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
        duration: 600,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  };

  useEffect(() => {
    // Initial cozy entrance animation
    if (buttonRef.current) {
      anime({
        targets: buttonRef.current,
        translateY: [50, 0],
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 800,
        delay: 1000,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        ref={buttonRef}
        variant="outline" 
        size="lg"
        onClick={handleToggle} 
        className="h-14 w-14 p-0 btn-primary shadow-cozy-lg glow-warm hover:glow-yellow transition-all duration-300 group"
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

