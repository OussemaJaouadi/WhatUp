import { Link } from "react-router-dom";
import { MessageCircle, Users, Shield, Zap, Heart, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { animate, createScope } from "animejs";

export default function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scope = useRef<any>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    
    scope.current = createScope({ root: document.body }).add(() => {
      // Hero section animation
      if (heroRef.current?.children) {
        animate(Array.from(heroRef.current.children), {
          translateY: [60, 0],
          opacity: [0, 1],
          delay: (el, i) => i * 150,
          duration: 800,
          ease: 'out(3)'
        });
      }

      // Features section animation
      if (featuresRef.current?.children) {
        animate(Array.from(featuresRef.current.children), {
          translateY: [40, 0],
          opacity: [0, 1],
          delay: (el, i) => i * 100 + 400,
          duration: 600,
          ease: 'out(3)'
        });
      }

      // CTA section animation
      if (ctaRef.current?.children) {
        animate(Array.from(ctaRef.current.children), {
          scale: [0.8, 1],
          opacity: [0, 1],
          delay: (el, i) => i * 100 + 700,
          duration: 600,
          ease: 'out(3)'
        });
      }
    });

    return () => scope.current?.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-cozy">
      {/* Hero Section */}
      <section className="section-cozy pt-32">
        <div className="container-cozy text-center" ref={heroRef}>
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary/10 rounded-3xl shadow-cozy">
              <MessageCircle className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-outfit font-bold text-foreground mb-6 text-balance">
            Welcome to{" "}
            <span className="text-primary glow-warm">WhatUp</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance leading-relaxed">
            Where conversations feel like home. Connect with friends in our cozy digital space 
            that brings the warmth of your favorite coffee shop to every chat.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="btn-primary text-lg px-8 py-4 shadow-cozy-lg group">
                <Heart className="mr-2 h-5 w-5 group-hover:text-destructive transition-colors" />
                Start Your Story
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="btn-outline text-lg px-8 py-4">
                <Coffee className="mr-2 h-5 w-5" />
                Welcome Back
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-cozy bg-card/30">
        <div className="container-cozy">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-outfit font-bold text-foreground mb-4">
              Your Cozy Corner of the Internet
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for meaningful connections, just like the gang at MacLaren's Pub
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8" ref={featuresRef}>
            <div className="card-cozy text-center group hover:bg-primary/5 transition-all duration-300">
              <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-outfit font-semibold mb-4 text-foreground">
                Your Circle
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Create intimate group chats where every conversation feels like 
                you're all sitting around the same table sharing stories.
              </p>
            </div>

            <div className="card-cozy text-center group hover:bg-secondary/5 transition-all duration-300">
              <div className="p-3 bg-secondary/10 rounded-2xl w-fit mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-outfit font-semibold mb-4 text-foreground">
                Safe Space
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your conversations are protected with love and care. 
                What happens in WhatUp, stays in WhatUp.
              </p>
            </div>

            <div className="card-cozy text-center group hover:bg-accent/10 transition-all duration-300">
              <div className="p-3 bg-accent/20 rounded-2xl w-fit mx-auto mb-6 group-hover:bg-accent/30 transition-colors">
                <Zap className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-2xl font-outfit font-semibold mb-4 text-foreground">
                Instant Magic
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time conversations that flow naturally, 
                like the perfect evening with your best friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-cozy bg-gradient-warm text-primary-foreground">
        <div className="container-cozy text-center" ref={ctaRef}>
          <h2 className="text-4xl md:text-5xl font-outfit font-bold mb-6">
            Ready to Find Your People?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join WhatUp today and start building the kind of friendships 
            that make every day feel like an adventure.
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="secondary"
              className="btn-secondary text-lg px-12 py-4 shadow-cozy-lg hover:shadow-xl transition-all duration-300 group"
            >
              <MessageCircle className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Begin Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card/50 border-t border-border/50">
        <div className="container-cozy text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="font-outfit font-semibold text-xl">WhatUp</span>
          </div>
          <p className="text-muted-foreground">
            Making conversations legendary, one chat at a time. 🍻
          </p>
        </div>
      </footer>
    </div>
  );
}

