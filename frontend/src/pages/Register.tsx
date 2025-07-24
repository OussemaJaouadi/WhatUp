
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MessageCircle, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import anime from "animejs";

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Cozy entrance animation
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        translateY: [50, 0],
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 800,
        easing: 'easeOutExpo'
      });
    }

    if (formRef.current?.children) {
      anime({
        targets: formRef.current.children,
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(80, {start: 300}),
        duration: 600,
        easing: 'easeOutExpo'
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      anime({
        targets: cardRef.current,
        translateX: [-8, 8, -6, 6, -4, 4, -2, 2, 0],
        duration: 400,
        easing: 'easeOutExpo'
      });
      
      toast({
        variant: "destructive",
        title: "Password Mismatch 😅",
        description: "Make sure both passwords match!",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password
      });

      // Success animation
      anime({
        targets: cardRef.current,
        scale: [1, 1.05, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .8)',
        complete: () => {
          toast({
            title: "Welcome to the gang! 🎉",
            description: "Your story begins now. Check your email to get started!",
          });
          navigate("/login");
        }
      });
    } catch (error: any) {
      // Error shake animation
      anime({
        targets: cardRef.current,
        translateX: [-10, 10, -8, 8, -6, 6, -4, 4, -2, 2, 0],
        duration: 500,
        easing: 'easeOutExpo'
      });

      toast({
        variant: "destructive",
        title: "Oops! 😅",
        description: error.response?.data?.detail || "Something went wrong. Try again?",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cozy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card ref={cardRef} className="card-cozy shadow-cozy-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto p-3 bg-primary/10 rounded-2xl w-fit">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-outfit font-bold text-foreground">
                Join the Story
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                Every great adventure starts with hello
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-foreground">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="Ted"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-cozy"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Mosby"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-cozy"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-cozy"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-cozy pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-14 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-cozy pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-14 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-primary text-lg py-4 shadow-cozy hover:shadow-cozy-lg group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Creating your story...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Join WhatUp
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Already part of the story?{" "}
                <Link 
                  to="/login" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors underline decoration-2 underline-offset-4"
                >
                  Sign in here
                </Link>
              </p>
              
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground italic">
                  "The best things in life are the people we love" 💛
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

