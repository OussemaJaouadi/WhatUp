import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "../services/auth";
import Navbar from "@/components/Navbar";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

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
        title: "Registration Successful",
        description: response.detail || "Please check your email to confirm your account.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
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
            <Card className="card-cozy border border-border dark:border-border-dark shadow-[var(--shadow-cozy)] bg-card dark:bg-card-dark p-8 rounded-none" style={{ borderRadius: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-crimson font-bold mb-1 text-primary dark:text-white">Create Account</h2>
                <p className="text-base text-muted-foreground dark:text-gray-300">Join the conversation and make real connections.</p>
              </div>
              <form className="space-y-5" onSubmit={handleRegister}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground dark:text-gray-400" />
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="pl-12 pr-4 h-16 text-lg border border-border dark:border-border-dark rounded-none focus:ring-2 focus:ring-primary dark:bg-card-dark dark:text-white"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground dark:text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="pl-12 pr-4 h-16 text-lg border border-border dark:border-border-dark rounded-none focus:ring-2 focus:ring-primary dark:bg-card-dark dark:text-white"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground dark:text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 h-16 text-lg border border-border dark:border-border-dark rounded-none focus:ring-2 focus:ring-primary dark:bg-card-dark dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
                <Button className="w-full btn-cozy text-xl h-16 rounded-none mt-1 dark:bg-primary dark:text-white" type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <span className="text-muted-foreground dark:text-gray-300 text-base">Already have an account?</span>
                <Link to="/login" className="ml-2 text-accent hover:underline font-semibold text-base dark:text-accent">Login</Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
}
