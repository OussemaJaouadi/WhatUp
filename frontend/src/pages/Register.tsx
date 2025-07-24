
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "../services/auth";
import Navbar from "@/components/Navbar";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = { username, email, password };
      const response = await authService.register(userData);
      toast({
        title: "Account created successfully!",
        description: response.detail || "Please check your email to confirm your account.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.detail || "Please try again with different details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-outfit font-bold tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Join WhatUp and start connecting with your team
            </p>
          </div>

          <Card className="card-modern">
            <div className="p-6 sm:p-8">
              <form className="space-y-6" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      className="input-modern pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="input-modern pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="input-modern pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  className="w-full btn-primary h-11 text-base font-medium" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                </span>
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
