
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
      if (heroRef.current?.children) {
        animate(Array.from(heroRef.current.children), {
          translateY: [40, 0],
          opacity: [0, 1],
          delay: (el, i) => i * 120,
          duration: 600,
          ease: 'out(2)'
        });
      }

      if (featuresRef.current?.children) {
        animate(Array.from(featuresRef.current.children), {
          translateY: [30, 0],
          opacity: [0, 1],
          delay: (el, i) => i * 80 + 300,
          duration: 500,
          ease: 'out(2)'
        });
      }

      if (ctaRef.current?.children) {
        animate(Array.from(ctaRef.current.children), {
          scale: [0.95, 1],
          opacity: [0, 1],
          delay: (el, i) => i * 80 + 600,
          duration: 500,
          ease: 'out(2)'
        });
      }
    });

    return () => scope.current?.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center" ref={heroRef}>
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full shadow-lg">
              <MessageCircle className="h-16 w-16 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Welcome to{" "}
            <span className="text-amber-600 dark:text-amber-400">WhatUp</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Where conversations become legendary. Connect with your gang in our professional platform 
            that brings the best of modern communication to every interaction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8 py-4 shadow-lg group">
                <Heart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Start Your Journey
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-slate-300 dark:border-slate-600">
                <Coffee className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Built for Legendary Connections
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Every feature designed to make your conversations more meaningful and your connections stronger.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" ref={featuresRef}>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Smart Connections
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Find and connect with people who share your interests and values, just like finding your perfect wingman.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Secure & Private
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your conversations stay between you and your friends. Privacy isn't just a feature, it's our promise.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Lightning Fast
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Real-time messaging that keeps up with your thoughts. No delays, no lag, just pure conversation flow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center" ref={ctaRef}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Write Your Story?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join WhatUp today and start building the kind of connections 
            that make every conversation legendary.
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-amber-600 hover:bg-slate-50 text-lg px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <MessageCircle className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Begin Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="h-6 w-6 text-amber-400" />
            <span className="font-bold text-xl text-white">WhatUp</span>
          </div>
          <p className="text-slate-400">
            Making conversations legendary, one chat at a time. 🍻
          </p>
        </div>
      </footer>
    </div>
  );
}
