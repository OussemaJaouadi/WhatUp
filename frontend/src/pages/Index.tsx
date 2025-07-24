
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Users, Shield, ArrowRight, CheckCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding border-b border-border">
        <div className="container-modern">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm bg-muted/50">
                  <Star className="h-4 w-4 mr-2 text-primary" />
                  Professional messaging platform
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-outfit font-bold tracking-tight text-balance">
                  Connect with your team{" "}
                  <span className="text-primary">professionally</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl">
                  A modern, secure messaging platform designed for teams who value 
                  clear communication and professional collaboration.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate("/register")}
                  size="lg"
                  className="btn-primary text-base px-8 py-3 h-12"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => navigate("/login")}
                  variant="outline" 
                  size="lg"
                  className="text-base px-8 py-3 h-12"
                >
                  Sign In
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Secure messaging</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Team collaboration</span>
                </div>
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-border p-8 shadow-lg">
                <div className="h-full bg-card rounded border border-border shadow-sm p-6 flex flex-col justify-center items-center">
                  <MessageCircle className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">WhatUp</h3>
                  <p className="text-muted-foreground text-center">
                    Professional messaging made simple
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-modern">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-outfit font-bold mb-4">
              Built for modern teams
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Everything you need to communicate effectively with your team, 
              without the clutter and distractions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-modern group hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <MessageCircle className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-xl font-semibold mb-3">Instant Messaging</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fast, reliable messaging with real-time delivery and 
                  read receipts for seamless communication.
                </p>
              </div>
            </Card>

            <Card className="card-modern group hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <Users className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create teams, organize conversations, and keep everyone 
                  aligned with powerful collaboration tools.
                </p>
              </div>
            </Card>

            <Card className="card-modern group hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <Shield className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enterprise-grade security with end-to-end encryption 
                  to keep your conversations private and secure.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding gradient-primary text-white">
        <div className="container-modern text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-outfit font-bold mb-6">
              Ready to transform your team communication?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/80 text-balance">
              Join thousands of teams who trust WhatUp for their daily communication needs.
            </p>
            <Button 
              onClick={() => navigate("/register")}
              size="lg"
              variant="secondary"
              className="text-base px-8 py-3 h-12 bg-white text-primary hover:bg-white/90"
            >
              Start your free account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted/20">
        <div className="container-modern">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-outfit font-semibold">WhatUp</span>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-right">
              Made with care for professional teams. By{" "}
              <a 
                href="https://oussemajaouadi.site/" 
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Oussema Jaouadi
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
