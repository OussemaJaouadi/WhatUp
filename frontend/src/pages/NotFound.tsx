import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Coffee } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen gradient-cozy flex flex-col items-center justify-center p-6 text-center">
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className="h-12 w-12 text-accent" />
        <h1 className="text-4xl font-crimson font-bold text-foreground">WhatUp</h1>
      </div>
      <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
      <h2 className="text-5xl font-crimson font-bold text-foreground mb-4">404 - Not Found</h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Oops! It looks like you've wandered off the cozy path. The page you're looking for doesn't exist.
      </p>
      <Button 
        onClick={() => navigate("/dashboard")}
        className="btn-cozy text-lg px-8 py-4"
      >
        Back to Dashboard
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate("/")}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground"
      >
        Or return to Home
      </Button>
    </div>
  );
};

export default NotFound;
