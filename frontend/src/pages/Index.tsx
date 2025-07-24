import { useState, useEffect, useRef } from "react";
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
import { animate, createScope, createSpring, createDraggable, stagger } from 'animejs';
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<any>(null);

  useEffect(() => {
    scope.current = createScope({ root }).add(self => {
      // Animate hero text lines
      animate('.hero-text-line', {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(100, { start: 500 }),
        easing: 'easeOutQuad',
        duration: 800,
      });

      // Animate feature cards
      animate('.feature-card', {
        opacity: [0, 1],
        translateY: [50, 0],
        delay: stagger(150, { start: 1000 }),
        easing: 'easeOutQuad',
        duration: 900,
      });

      // Animate CTA section
      animate('.cta-section', {
        opacity: [0, 1],
        translateY: [50, 0],
        delay: 1500,
        easing: 'easeOutQuad',
        duration: 900,
      });
    });

    // Cleanup: revert all anime.js instances declared inside the scope
    return () => scope.current && scope.current.revert();
  }, []);

  return (
    <div ref={root} className="min-h-screen gradient-cozy font-sans text-foreground bg-background dark:bg-background-dark dark:text-foreground-dark">
      <Navbar />
      {/* ...no custom header, Navbar is used globally... */}

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden bg-background dark:bg-background-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-6xl font-crimson font-bold leading-tight">
                  <span className="hero-text-line block">Where Friends</span>
                  <span className="hero-text-line block text-accent text-glow"> Connect</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed hero-text-line">
                  Step into WhatUp, where every conversation feels like hanging out 
                  at your favorite coffee shop. Cozy chats, lasting friendships, 
                  and memories that matter.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 hero-text-line">
              <Button 
                onClick={() => navigate("/login")}
                size="lg"
                className="btn-accent text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Join the Conversation
              </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 border-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark hover:bg-primary/10 hover:text-primary-foreground dark:hover:bg-primary-dark/10 dark:hover:text-primary-foreground transition-all duration-300"
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
      <section className="py-20 px-6 bg-background/50 backdrop-blur-sm dark:bg-background-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-crimson font-bold text-foreground dark:text-foreground-dark mb-4">
              Made for Real Connections
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Just like your favorite hangout spot, WhatUp brings people together 
              in a warm, welcoming environment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-cozy text-center group feature-card">
              <MessageCircle className="h-12 w-12 text-accent dark:text-accent-dark mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-xl font-crimson font-semibold mb-2">Cozy Chats</h4>
              <p className="text-muted-foreground">
                Every message feels like a warm conversation over coffee. 
                No rush, just genuine connection.
              </p>
            </Card>

            <Card className="card-cozy text-center group feature-card">
              <Users className="h-12 w-12 text-accent dark:text-accent-dark mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-xl font-crimson font-semibold mb-2">Your Circle</h4>
              <p className="text-muted-foreground">
                Create intimate groups with your closest friends. 
                Like having your own private corner booth.
              </p>
            </Card>

            <Card className="card-cozy text-center group feature-card">
              <Heart className="h-12 w-12 text-accent dark:text-accent-dark mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="text-xl font-crimson font-semibold mb-2">Real Moments</h4>
              <p className="text-muted-foreground">
                Share the little things that matter. Because the best 
                conversations happen over shared experiences.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 gradient-sunset cta-section dark:gradient-sunset">
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
            onClick={() => navigate("/login")}
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-card/50 backdrop-blur-sm dark:bg-card-dark/50 dark:border-border-dark">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="h-6 w-6 text-accent dark:text-accent-dark" />
            <span className="font-crimson font-semibold text-lg">WhatUp</span>
          </div>
          <p className="text-muted-foreground">
            Where every conversation matters. Made with ❤️ for real connections. By <a href="https://oussemajaouadi.site/">Oussema Jaouadi</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
