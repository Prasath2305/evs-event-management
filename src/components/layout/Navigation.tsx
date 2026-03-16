// src/components/layout/Navigation.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Menu, X, Leaf, BarChart3, Calendar, Plus, LogIn, UserPlus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setIsAuthenticated(!!user);
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const navLinks = [
    { href: '/', label: 'Home', icon: Leaf },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/dashboard', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 hidden sm:block">EVS Portal</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            <Link href="/admin/events/create">
              <Button size="sm" icon={Plus}>
                Add Event
              </Button>
            </Link>
            {isAuthenticated ? (
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="sm" icon={LogOut}>
                  Logout
                </Button>
              </form>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" size="sm" icon={LogIn}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" icon={UserPlus}>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-emerald-100">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin/events/create"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="w-4 h-4" />
              Add Event
            </Link>
            {isAuthenticated ? (
              <form action="/auth/signout" method="post" className="px-3 py-2">
                <button
                  type="submit"
                  className="w-full text-left flex items-center gap-2 text-slate-600 hover:text-emerald-600"
                  onClick={() => setIsOpen(false)}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                  onClick={() => setIsOpen(false)}
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

