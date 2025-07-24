import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "../services/auth";
import Navbar from "@/components/Navbar";
import { User, Lock, Eye, EyeOff } from "lucide-react";

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
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cozy dark:bg-gradient-cozy flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl px-8">
          <Card className="card-cozy rounded-2xl shadow-[var(--shadow-cozy)] bg-card dark:bg-card-dark p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-crimson font-bold mb-2 text-primary dark:text-primary-foreground">Sign In</h2>
              <p className="text-muted-foreground dark:text-muted-foreground-dark">Welcome back! Please login to continue.</p>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid grid-cols-2 h-12 bg-muted/60 dark:bg-muted-dark/60 rounded-xl p-1 mb-6">
                <TabsTrigger value="user" className="text-lg font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:rounded-lg transition-all duration-300">User Login</TabsTrigger>
                <TabsTrigger value="admin" className="text-lg font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:rounded-lg transition-all duration-300">Admin Login</TabsTrigger>
              </TabsList>
            </Tabs>
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={activeTab === "admin" ? "Admin Username" : "Username"}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="pl-12 pr-5 py-4 text-lg"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 py-4 text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
                <Button className="w-full btn-cozy text-xl py-4 rounded-xl mt-2" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
            </form>
            <div className="mt-6 text-center">
              <span className="text-muted-foreground dark:text-muted-foreground-dark">Don't have an account?</span>
              <Link to="/register" className="ml-2 text-accent hover:underline font-medium">Register</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
