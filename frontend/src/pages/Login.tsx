
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "../services/auth";
import Navbar from "@/components/Navbar";
import { User, Lock, Eye, EyeOff, Crown, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      localStorage.setItem("jwt_token", response.access_token);
      if (activeTab === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      toast({ 
        title: "Welcome back!", 
        description: "You've been successfully signed in." 
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.response?.data?.detail || "Please check your credentials and try again.",
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
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Card className="card-modern">
            <div className="p-6 sm:p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-2 h-11 bg-muted/50">
                  <TabsTrigger 
                    value="user" 
                    className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                  >
                    <User className="h-4 w-4 mr-2" />
                    User
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    {activeTab === "admin" ? "Admin Username" : "Username"}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder={activeTab === "admin" ? "Enter admin username" : "Enter your username"}
                      value={username}
                      onChange={e => setUsername(e.target.value)}
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
                      placeholder="Enter your password"
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                </span>
                <Link 
                  to="/register" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Create one now
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
