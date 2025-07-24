import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Users, Heart, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-cozy.jpg";
import { authService } from "../services/auth";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import anime from 'animejs';

const Index = () => {
  const [isAuthMode, setIsAuthMode] = useState(false);

  useEffect(() => {
    // Hero text animation
    anime({
      targets: '.hero-text-line',
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100, {start: 500}),
      easing: 'easeOutQuad',
    });

    // Feature cards animation
    anime({
      targets: '.feature-card',
      opacity: [0, 1],
      translateY: [50, 0],
      delay: anime.stagger(150, {start: 1000}),
      easing: 'easeOutQuad',
    });

    // CTA section animation
    anime({
      targets: '.cta-section',
      opacity: [0, 1],
      translateY: [50, 0],
      delay: 1500,
      easing: 'easeOutQuad',
    });
  }, []);

  if (isAuthMode) {
    return <AuthScreen onBack={() => setIsAuthMode(false)} />;
  }

  return (
    <div className="min-h-screen gradient-cozy font-sans text-foreground dark:text-foreground-dark bg-background dark:bg-background-dark">
      {/* Header */}
      <header className="relative z-10 p-6 bg-card/80 dark:bg-card-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-8 w-8 text-accent dark:text-accent-dark" />
            <h1 className="text-2xl font-crimson font-bold text-foreground dark:text-foreground-dark">
              WhatUp
            </h1>
          </div>
          <Button 
            onClick={() => setIsAuthMode(true)}
            className="btn-cozy"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-6xl font-crimson font-bold leading-tight">
                  <span className="hero-text-line block">Where Friends</span>
                  <span className="hero-text-line block text-accent dark:text-accent-dark text-glow"> Connect</span>
                </h2>
                <p className="text-xl text-muted-foreground dark:text-muted-foreground-dark leading-relaxed hero-text-line">
                  Step into WhatUp, where every conversation feels like hanging out 
                  at your favorite coffee shop. Cozy chats, lasting friendships, 
                  and memories that matter.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 hero-text-line">
                <Button 
                  onClick={() => setIsAuthMode(true)}
                  size="lg"
                  className="btn-accent text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Join the Conversation
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 border-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark hover:bg-primary/10 hover:text-primary-foreground dark:hover:bg-primary-dark/10 dark:hover:text-primary-foreground-dark transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src={heroImage}
                alt="Cozy coffee shop atmosphere"
                className="rounded-2xl shadow-[var(--shadow-cozy)] w-full h-auto transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background/50 dark:bg-background-dark/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-crimson font-bold text-foreground dark:text-foreground-dark mb-4">
              Made for Real Connections
            </h3>
            <p className="text-xl text-muted-foreground dark:text-muted-foreground-dark max-w-2xl mx-auto">
              Just like your favorite hangout spot, WhatUp brings people together 
              in a warm, welcoming environment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-cozy text-center group feature-card">
              <MessageCircle className="h-12 w-12 text-accent dark:text-accent-dark mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-xl font-crimson font-semibold mb-2">Cozy Chats</h4>
              <p className="text-muted-foreground dark:text-muted-foreground-dark">
                Every message feels like a warm conversation over coffee. 
                No rush, just genuine connection.
              </p>
            </Card>

            <Card className="card-cozy text-center group feature-card">
              <Users className="h-12 w-12 text-accent dark:text-accent-dark mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-xl font-crimson font-semibold mb-2">Your Circle</h4>
              <p className="text-muted-foreground dark:text-muted-foreground-dark">
                Create intimate groups with your closest friends. 
                Like having your own private corner booth.
              </p>
            </Card>

            <Card className="card-cozy text-center group feature-card">
              <Heart className="h-12 w-12 text-accent dark:text-accent-dark mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-xl font-crimson font-semibold mb-2">Real Moments</h4>
              <p className="text-muted-foreground dark:text-muted-foreground-dark">
                Share the little things that matter. Because the best 
                conversations happen over shared experiences.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 gradient-sunset cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <Coffee className="h-16 w-16 text-white mx-auto mb-6" />
          <h3 className="text-4xl font-crimson font-bold text-white mb-4">
            Ready to Join the Story?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Every great friendship starts with a simple "Hey, what's up?" 
            Your story begins here.
          </p>
          <Button 
            onClick={() => setIsAuthMode(true)}
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border dark:border-border-dark bg-card/50 dark:bg-card-dark/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="h-6 w-6 text-accent dark:text-accent-dark" />
            <span className="font-crimson font-semibold text-lg">WhatUp</span>
          </div>
          <p className="text-muted-foreground dark:text-muted-foreground-dark">
            Where every conversation matters. Made with ❤️ for real connections.
          </p>
        </div>
      </footer>
    </div>
  );
};

const AuthScreen = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFile, setRegisterFile] = useState<File | null>(null);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login(username, password);
      localStorage.setItem("jwt_token", response.access_token);
      // In a real app, you'd decode the JWT to get the role,
      // but for this example, we'll use the isAdminLogin flag for redirection.
      if (isAdminLogin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        file: registerFile,
      };
      const response = await authService.register(userData);
      toast({
        title: "Registration Successful",
        description: response.detail || "Please check your email to confirm your account.",
      });
      // Optionally, switch to login tab or redirect
      // navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen gradient-cozy flex items-center justify-center p-6 bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
      <div className="w-full max-w-md">
        <Card className="card-cozy bg-card dark:bg-card-dark">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <MessageCircle className="h-8 w-8 text-accent dark:text-accent-dark" />
              <h1 className="text-2xl font-crimson font-bold">WhatUp</h1>
            </div>
            <p className="text-muted-foreground dark:text-muted-foreground-dark">Welcome back to your cozy corner</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted dark:bg-muted-dark">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Join Us</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email or Username</Label>
                  <Input 
                    id="email" 
                    type="text" // Changed to text as it can be username or email
                    placeholder="Enter your email or username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="admin-login" 
                    checked={isAdminLogin}
                    onCheckedChange={(checked) => setIsAdminLogin(!!checked)}
                  />
                  <Label htmlFor="admin-login">Login as Admin</Label>
                </div>
                <Button type="submit" className="btn-cozy w-full">
                  Sign In
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-sm text-muted-foreground dark:text-muted-foreground-dark hover:text-foreground dark:hover:text-foreground-dark"
                >
                  Forgot your password?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form className="space-y-4" onSubmit={handleRegistration}>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="Choose a username" 
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password" 
                    type="password" 
                    placeholder="Create a password" 
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-picture">Profile Picture (Optional)</Label>
                  <Input 
                    id="profile-picture" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setRegisterFile(e.target.files ? e.target.files[0] : null)}
                    className="bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark"
                  />
                </div>
                <Button type="submit" className="btn-accent w-full">
                  Join WhatUp
                </Button>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark text-center">
                  By joining, you agree to our Terms and Privacy Policy
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-sm text-muted-foreground dark:text-muted-foreground-dark hover:text-foreground dark:hover:text-foreground-dark"
            >
              ← Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
