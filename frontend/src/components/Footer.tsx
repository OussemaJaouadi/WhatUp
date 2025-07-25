import { MessageCircle, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-8 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-t border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Brand & Slogan */}
        <div className="flex items-center gap-3">
          <MessageCircle className="h-7 w-7 text-amber-400" />
          <a
            href="https://github.com/OussemaJaouadi/WhatUp"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-2xl tracking-tight hover:text-amber-400 transition-colors"
          >
            WhatUp
          </a>
        </div>
        {/* Right: Copyright & Links */}
        <div className="flex flex-col items-end text-xs text-slate-500">
          <span>
            &copy; 2025{" "}
            <a
              href="https://github.com/OussemaJaouadi/WhatUp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              WhatUp
            </a>
            .
          </span>
          <span className="flex items-center gap-1">
            Made with{" "}
            <Heart className="inline h-4 w-4 text-amber-400" /> by{" "}
            <a
              href="https://oussemajaouadi.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-amber-400 transition-colors"
            >
              OussemaJaouadi
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
