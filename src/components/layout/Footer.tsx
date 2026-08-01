import React from "react";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 pt-12 pb-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white font-bold">
              G
            </div>
            <span className="text-xl font-bold tracking-tight text-surface-900 dark:text-white">GoldenGuard</span>
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm">
            AI-Powered Road Safety & Golden Hour Response Platform. Empowering communities to save lives.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-surface-900 dark:text-white mb-4">Emergency</h4>
          <ul className="space-y-2 text-sm text-surface-500 dark:text-surface-400">
            <li><span className="font-bold text-red-500">108</span> Ambulance</li>
            <li><span className="font-bold text-blue-500">112</span> Emergency</li>
            <li><span className="font-bold text-amber-500">100</span> Police</li>
            <li><span className="font-bold text-orange-500">101</span> Fire</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-surface-900 dark:text-white mb-4">Legal & Info</h4>
          <ul className="space-y-2 text-sm text-surface-500 dark:text-surface-400">
            <li><Link to="/community" className="hover:text-primary-500 transition-colors">Good Samaritan Info</Link></li>
            <li><a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary-500 transition-colors">Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-surface-200 dark:border-surface-800 text-xs text-surface-400">
        <p>&copy; {currentYear} GoldenGuard Platform. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span>Version 1.0.0</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Systems Operational</span>
        </div>
      </div>
    </footer>
  );
}
