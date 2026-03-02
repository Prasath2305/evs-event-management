// src/components/layout/Footer.tsx
import Link from 'next/link';
import { Leaf, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-emerald-400" />
              <span className="font-bold text-xl text-white">EVS Portal</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Empowering environmental awareness through technology. 
              Manage and discover sustainability events on your campus.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/events" className="hover:text-emerald-400 transition-colors">All Events</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Analytics</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-emerald-400 transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="hover:text-emerald-400 transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} EVS Event Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}