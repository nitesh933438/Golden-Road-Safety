import React from "react";
import {
  Users,
  Shield,
  Code,
  GraduationCap,
  Mail,
  Github,
  Linkedin,
  Globe,
  Award,
  Sparkles,
  PhoneCall,
  MapPin
} from "lucide-react";

export function Team() {
  const LEADER = {
    name: "Alex Rivera",
    role: "Project Leader & Product Architect",
    bio: "Passionate product designer and system architect driving the GoldenGuard vision of zero-downtime Golden Hour emergency dispatch.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    skills: ["Product Strategy", "System Architecture", "AI Integration", "UX Engineering"],
    email: "alex.rivera@goldenguard.org"
  };

  const DEVELOPERS = [
    {
      name: "Marcus Chen",
      role: "Lead Full-Stack Developer",
      bio: "Specializes in React, TypeScript, and Firebase Firestore optimization for sub-second emergency response applications.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      skills: ["React 18", "Firebase", "TypeScript", "Google Maps API"]
    },
    {
      name: "Priya Sharma",
      role: "AI & ML Engineer",
      bio: "Engineers real-time Gemini 1.5 prompt pipelines, medical triage models, and audio metronome synchronization.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
      skills: ["Gemini AI SDK", "Natural Language Triage", "Web Audio API", "Python"]
    },
    {
      name: "Carlos Rossi",
      role: "UI/UX & Mobile Specialist",
      bio: "Crafts intuitive emergency UI design systems, accessibility-first interfaces, and responsive PWA layouts.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
      skills: ["Tailwind CSS", "Design Systems", "PWA Architecture", "Framer Motion"]
    }
  ];

  const GUIDES = [
    {
      name: "Dr. Sarah Jenkins",
      role: "Chief Medical Advisor & ER Trauma Lead",
      organization: "St. Jude Metropolitan Hospital",
      bio: "Board-certified Emergency Medicine Specialist evaluating GoldenGuard's CPR protocols and hospital bed triage sync.",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300"
    },
    {
      name: "Officer David Miller",
      role: "Public Safety & Municipal Traffic Advisor",
      organization: "City Emergency Services Division",
      bio: "Advising on municipal 911 integration, police unit dispatch protocols, and road blackspot hazard verification.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-surface-900 via-surface-900 to-amber-950 text-white p-8 sm:p-12 border border-surface-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
            <Users className="w-3.5 h-3.5" /> Hackathon Founders & Engineers
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Meet Team GoldenGuard
          </h1>
          <p className="text-lg text-surface-300 leading-relaxed">
            A multidisciplinary team of product architects, AI engineers, full-stack developers, and ER medical advisors dedicated to saving lives.
          </p>
        </div>
      </div>

      {/* Team Leader */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wider text-xs">
          <Award className="w-4 h-4" /> Team Leader
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-center gap-8">
          <img
            src={LEADER.avatar}
            alt={LEADER.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Alex+Rivera&background=f59e0b&color=fff";
            }}
            className="w-36 h-36 rounded-3xl object-cover ring-4 ring-amber-500/30 shadow-lg"
          />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase">
                Project Lead
              </span>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white mt-2">{LEADER.name}</h2>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">{LEADER.role}</p>
            </div>
            <p className="text-xs text-surface-600 dark:text-surface-300 max-w-2xl leading-relaxed">
              {LEADER.bio}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
              {LEADER.skills.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Developers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-wider text-xs">
          <Code className="w-4 h-4" /> Developers & Engineers
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEVELOPERS.map((dev, i) => (
            <div key={i} className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-xl space-y-4 flex flex-col items-center text-center hover:border-blue-500/40 transition-colors">
              <img
                src={dev.avatar}
                alt={dev.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=3b82f6&color=fff`;
                }}
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-surface-200 dark:ring-surface-700 shadow-md"
              />
              <div>
                <h3 className="font-bold text-lg text-surface-900 dark:text-white">{dev.name}</h3>
                <p className="text-xs font-semibold text-blue-500">{dev.role}</p>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed flex-1">
                {dev.bio}
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center pt-2">
                {dev.skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-[10px] font-medium text-surface-600 dark:text-surface-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide & Advisors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-purple-500 font-bold uppercase tracking-wider text-xs">
          <GraduationCap className="w-4 h-4" /> Project Guide & Medical Advisors
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GUIDES.map((guide, i) => (
            <div key={i} className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-xl flex items-center gap-6">
              <img
                src={guide.avatar}
                alt={guide.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}&background=a855f7&color=fff`;
                }}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-purple-500/30 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold text-purple-500 uppercase">{guide.organization}</span>
                <h3 className="font-bold text-base text-surface-900 dark:text-white truncate">{guide.name}</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400">{guide.role}</p>
                <p className="text-xs text-surface-600 dark:text-surface-300 pt-1 leading-relaxed">
                  {guide.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-surface-900 text-white rounded-3xl p-8 sm:p-12 border border-surface-800 shadow-2xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Get in Touch</span>
          <h2 className="text-3xl font-extrabold">Contact & Hackathon Inquiries</h2>
          <p className="text-sm text-surface-300">Interested in deploying GoldenGuard in your municipality or joining our emergency network?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-surface-800/80 border border-surface-700 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm">Email Support</h4>
            <p className="text-xs text-amber-300 font-mono">contact@goldenguard.org</p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-800/80 border border-surface-700 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm">Emergency Hotdesk</h4>
            <p className="text-xs text-blue-300 font-mono">+1 (800) 555-GOLDEN</p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-800/80 border border-surface-700 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm">Headquarters</h4>
            <p className="text-xs text-emerald-300">Google AI Studio Build Center</p>
          </div>

        </div>
      </div>

    </div>
  );
}
