"use client";


import Link from "next/link";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onLogin?: () => void;
}

export default function Header({ onLogin }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-200/90 backdrop-blur-md border-b border-slate-300 shadow-sm">
  <nav className="w-full px-2 md:px-0 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Positioned Left */}
          <Link href="/" className="flex items-center group md:pl-16">
            <img
              src="/netkrida.png"
              alt="Netkrida Logo"
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              draggable="false"
              onError={e => e.currentTarget.style.display = 'none'}
            />
          </Link>

          {/* Desktop Navigation - Positioned Right */}
          <div className="hidden md:flex items-center gap-6 ml-auto pr-6">
            <Link
              href="/"
              className="text-slate-700 hover:text-green-600 font-medium transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/#features"
              scroll={true}
              className="text-slate-700 hover:text-green-600 font-medium transition-colors"
            >
              Fitur
            </Link>
            <Link
              href="/#roles"
              scroll={true}
              className="text-slate-700 hover:text-green-600 font-medium transition-colors"
            >
              Role Akses
            </Link>
            <button
              type="button"
              onClick={onLogin}
              className="px-6 py-2.5 rounded-lg font-semibold text-base bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-green-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-green-800" />
            ) : (
              <Menu className="w-6 h-6 text-green-800" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-green-200 space-y-3">
            <Link
              href="/#features"
              className="block px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Fitur
            </Link>
            <Link
              href="/#roles"
              className="block px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Role Akses
            </Link>
            <button
              type="button"
              className="block w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center rounded-lg font-semibold shadow-lg"
              onClick={() => {
                setIsMenuOpen(false);
                if (onLogin) onLogin();
              }}
            >
              Login
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
