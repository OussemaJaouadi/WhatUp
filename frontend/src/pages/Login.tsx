
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { animate, createScope } from "animejs/lib/anime.es.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const scope = useRef<any>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    scope.current = createScope({ root: cardRef.current }).add(() => {
      animate('.login-card', {
        translateY: [40, 0],
        opacity: [0, 1],
        scale: [0.98, 1],
        duration: 600,
        ease: 'out(2)'
      });

      animate('.form-field', {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: (el, i) => i * 80 + 200,
        duration: 500,
        ease: 'out(2)'
      });
    });

    return () => scope.current?.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      
      if (response.token) {
        localStorage.setItem("jwt_token", response.token);
        
        animate('.login-card', {
          scale: [1, 1.02, 1],
          duration: 300,
          ease: 'out(2)',
          complete: () => {
            toast({
              title: "Welcome back! 🎯",
              description: "Ready to catch up with the gang?",
            });
            navigate("/dashboard");
          }
        });
      }
    } catch (error: any) {
      animate('.login-card', {
        translateX: [-6, 6, -4, 4, -2, 2, 0],
        duration: 400,
        ease: 'out(2)'
      });

      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.response?.data?.detail || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Coming Soon! 🚧",
      description: "Google authentication will be available soon. Stay tuned!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card ref={cardRef} className="login-card bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full w-fit">
              <MessageCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                Sign in to continue your legendary journey
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button 
              onClick={handleGoogleLogin}
              variant="outline" 
              className="form-field w-full h-11 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="form-field relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-field space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md"
                  required
                />
              </div>
              
              <div className="form-field space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 pr-10 rounded-md"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="form-field w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                New to WhatUp?{" "}
                <Link 
                  to="/register" 
                  className="font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  Create an account
                </Link>
              </p>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  "The best stories are yet to be told" 📖
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
