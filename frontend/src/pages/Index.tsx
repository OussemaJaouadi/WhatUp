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
          easing: 'easeOutExpo'
        });
      }

      if (featuresRef.current?.children) {
        animate(Array.from(featuresRef.current.children), {
          translateY: [30, 0],
          opacity: [0, 1],
          delay: (el, i) => i * 80 + 300,
          duration: 500,
          easing: 'easeOutExpo'
        });
      }

      if (ctaRef.current?.children) {
        animate(Array.from(ctaRef.current.children), {
          scale: [0.92, 1],
          opacity: [0, 1],
          translateY: [20, 0],
          delay: (el, i) => i * 60 + 500,
          duration: 500,
          easing: 'easeOutExpo'
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

      {/* CTA Section - Improved, smaller, animated, dark mode uses vibrant colors, light mode uses lighter colors */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r dark:from-amber-700 dark:via-orange-700 dark:to-pink-700 from-amber-200 via-orange-200 to-pink-200 text-white dark:text-white text-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10" ref={ctaRef}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 drop-shadow-lg dark:text-amber-300 text-amber-700">
            Join the Conversation Revolution
          </h2>
          <p className="text-lg mb-6 opacity-95 max-w-xl mx-auto leading-relaxed dark:text-slate-200 text-slate-700">
            Become part of a vibrant community where every message matters.<br className="hidden md:inline" /> Sign up now and make your mark in legendary chats!
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-amber-600 hover:bg-slate-50 dark:bg-amber-950 dark:text-amber-300 text-base px-8 py-3 shadow-xl hover:scale-105 transition-all duration-300 group font-semibold"
            >
              <MessageCircle className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Get Started
            </Button>
          </Link>
          <div className="mt-4 text-sm text-slate-700 dark:text-amber-200">
            Already have an account? <Link to="/login" className="underline hover:text-amber-600 dark:hover:text-amber-300">Sign In</Link>
          </div>
        </div>
      </section>

      {/* ...footer is now a shared component... */}
    </div>
  );
}
