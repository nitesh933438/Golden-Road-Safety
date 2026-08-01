import React from "react";
import { Shield, CheckCircle2, AlertTriangle, Scale, Info, HelpCircle } from "lucide-react";

export function GoodSamaritanHub() {
  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-12">
      
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold">The Good Samaritan Law</h2>
        <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
          You are legally protected when helping road accident victims or medical emergencies in good faith. Do not hesitate to save a life.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-50 dark:bg-surface-800/50 p-6 rounded-2xl border border-surface-200 dark:border-surface-700">
          <Scale className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="font-bold mb-2">Legal Protection</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">Bystanders who assist injured persons cannot be held liable for any civil or criminal action.</p>
        </div>
        <div className="bg-surface-50 dark:bg-surface-800/50 p-6 rounded-2xl border border-surface-200 dark:border-surface-700">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
          <h3 className="font-bold mb-2">No Police Harassment</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">You are not required to reveal your identity to police or medical personnel unless you choose to.</p>
        </div>
        <div className="bg-surface-50 dark:bg-surface-800/50 p-6 rounded-2xl border border-surface-200 dark:border-surface-700">
          <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
          <h3 className="font-bold mb-2">Hospital Mandates</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">All hospitals must immediately attend to victims brought in by Good Samaritans without demanding payment first.</p>
        </div>
      </div>

      {/* Myths vs Facts */}
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Info className="w-6 h-6 text-primary-500" /> Myths vs Facts
        </h3>
        <div className="space-y-4">
          {[
            { myth: "I will have to pay the hospital bill if I take them.", fact: "Hospitals cannot demand payment from the Good Samaritan. The victim's treatment is prioritized." },
            { myth: "I will have to go to court for years.", fact: "The law protects you from legal proceedings. You cannot be forced to become a witness." },
            { myth: "If I do CPR wrong, I can be sued.", fact: "If you act in good faith to save a life, you are protected from liability for unintentional harm." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-surface-800 p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm">
              <div className="flex-1">
                <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Myth</div>
                <p className="font-semibold text-surface-900 dark:text-white">"{item.myth}"</p>
              </div>
              <div className="w-px bg-surface-200 dark:bg-surface-700 hidden sm:block"></div>
              <div className="flex-1">
                <div className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Fact</div>
                <p className="text-surface-600 dark:text-surface-300">{item.fact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-primary-500" /> Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <details className="group bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700 open:bg-white dark:open:bg-surface-800 transition-colors">
            <summary className="font-bold p-5 cursor-pointer list-none flex justify-between items-center">
              What if the police ask for my details?
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-surface-600 dark:text-surface-300">
              You can choose to remain completely anonymous. The police are legally bound not to compel you to reveal your name or contact details.
            </div>
          </details>
          <details className="group bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700 open:bg-white dark:open:bg-surface-800 transition-colors">
            <summary className="font-bold p-5 cursor-pointer list-none flex justify-between items-center">
              Do I get a reward for helping?
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-surface-600 dark:text-surface-300">
              Many local governments have reward schemes in place to honor Good Samaritans who save lives, though this varies by region. Regardless, the true reward is saving a life.
            </div>
          </details>
        </div>
      </div>

    </div>
  );
}
