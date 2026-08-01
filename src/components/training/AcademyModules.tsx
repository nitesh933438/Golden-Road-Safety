import React, { useState } from "react";
import { ACADEMY_MODULES } from "./data";
import { ChevronRight, ArrowLeft, CheckCircle2, Play, Award, FileText, Download, X } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export function AcademyModules() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  
  if (selectedModule) {
    return <ModuleView moduleId={selectedModule} onBack={() => setSelectedModule(null)} />;
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Interactive Learning Modules</h2>
        <p className="text-surface-500 text-sm">Master essential first aid skills with step-by-step guides and quizzes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACADEMY_MODULES.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setSelectedModule(mod.id)}
            className="flex flex-col text-left p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mod.bg} ${mod.color} mb-4 group-hover:scale-110 transition-transform`}>
              <mod.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-surface-900 dark:text-white mb-2">{mod.title}</h3>
            <p className="text-xs text-surface-500 mb-4 flex-1 line-clamp-2">{mod.description}</p>
            
            <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-surface-200 dark:border-surface-700">
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">Start Module</span>
              <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-primary-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ModuleView({ moduleId, onBack }: { moduleId: string; onBack: () => void }) {
  const mod = ACADEMY_MODULES.find(m => m.id === moduleId);
  const [step, setStep] = useState<"intro" | "guide" | "quiz" | "certificate">("intro");
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [userName, setUserName] = useState("John Doe"); // Could come from auth

  if (!mod) return null;

  const handleQuizAnswer = (selectedIndex: number) => {
    if (selectedIndex === mod.quiz[quizIndex].correctIndex) {
      setScore(prev => prev + 1);
    }
    
    if (quizIndex < mod.quiz.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setStep("certificate");
    }
  };

  const generatePDF = () => {
    const element = document.getElementById("certificate-view");
    if (element) {
      html2canvas(element, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${mod.title}_Certificate.pdf`);
      });
    }
  };

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-white dark:bg-surface-900 z-10">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.bg} ${mod.color}`}>
          <mod.icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-surface-900 dark:text-white leading-tight">{mod.title}</h2>
          <p className="text-xs text-surface-500">Academy Module</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          
          {step === "intro" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-4 mb-8">
                <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center ${mod.bg} ${mod.color}`}>
                  <mod.icon className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold">{mod.title}</h1>
                <p className="text-surface-500 max-w-lg mx-auto">{mod.description}</p>
              </div>

              <div className="bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-6 border border-surface-200 dark:border-surface-700">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-500" /> Learning Objectives
                </h3>
                <ul className="space-y-3">
                  {mod.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3 text-surface-700 dark:text-surface-300">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => setStep("guide")}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
              >
                <Play className="w-5 h-5" /> Start Learning
              </button>
            </div>
          )}

          {step === "guide" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Step-by-Step Guide</h3>
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">Study carefully</span>
              </div>
              
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-surface-200 dark:before:bg-surface-700">
                {mod.steps.map((s, i) => (
                  <div key={i} className="relative pl-12">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white dark:bg-surface-800 border-2 border-primary-500 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 shadow-sm">
                      {i + 1}
                    </div>
                    <div className="bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700">
                      <h4 className="font-bold text-lg mb-2">{s.title}</h4>
                      <p className="text-surface-600 dark:text-surface-300 leading-relaxed">{s.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  onClick={() => setStep("quiz")}
                  className="px-8 py-3 bg-surface-900 dark:bg-white text-white dark:text-surface-900 rounded-xl font-bold transition-colors"
                >
                  Take the Quiz
                </button>
              </div>
            </div>
          )}

          {step === "quiz" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Knowledge Check</h3>
                <p className="text-surface-500">Question {quizIndex + 1} of {mod.quiz.length}</p>
              </div>
              
              <div className="bg-white dark:bg-surface-800 rounded-3xl p-6 sm:p-8 border border-surface-200 dark:border-surface-700 shadow-lg">
                <h4 className="text-xl font-bold mb-6">{mod.quiz[quizIndex].question}</h4>
                <div className="space-y-3">
                  {mod.quiz[quizIndex].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      className="w-full text-left p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 font-medium transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "certificate" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-3xl mx-auto text-center">
              
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10" />
              </div>
              
              <h2 className="text-3xl font-bold mb-2">Module Completed!</h2>
              <p className="text-surface-500 mb-8">
                You scored {score} out of {mod.quiz.length}. You have earned your certificate.
              </p>

              {/* Certificate Preview */}
              <div 
                id="certificate-view" 
                className="relative bg-white border-[12px] border-surface-100 p-12 text-center shadow-xl mb-8 overflow-hidden"
                style={{ aspectRatio: "1.414/1" }} // A4 Landscape ratio
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600 opacity-10 rounded-br-full" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500 opacity-10 rounded-tl-full" />
                
                <div className="relative z-10 h-full flex flex-col items-center justify-center">
                  <Award className="w-16 h-16 text-amber-500 mb-6" />
                  <h1 className="text-4xl font-serif text-slate-900 mb-2 uppercase tracking-widest">Certificate of Completion</h1>
                  <p className="text-slate-500 mb-8 tracking-widest uppercase text-sm">GoldenGuard Academy</p>
                  
                  <p className="text-slate-600 mb-4 italic">This is to certify that</p>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4 border-b-2 border-slate-200 pb-2 px-12 inline-block">
                    {userName}
                  </h2>
                  <p className="text-slate-600 mb-6 italic">has successfully completed the training module for</p>
                  <h3 className="text-2xl font-bold text-blue-600 mb-12">{mod.title}</h3>
                  
                  <div className="flex justify-between w-full px-12 mt-auto">
                    <div className="text-center">
                      <div className="border-t border-slate-300 w-32 pt-2 mb-1">
                        <span className="text-xs text-slate-500 uppercase">Date</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-slate-300 w-32 pt-2 mb-1">
                        <span className="text-xs text-slate-500 uppercase">Certificate ID</span>
                      </div>
                      <span className="text-sm font-mono text-slate-800">GG-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={onBack}
                  className="px-6 py-3 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-900 dark:text-white rounded-xl font-bold transition-colors"
                >
                  Back to Modules
                </button>
                <button 
                  onClick={generatePDF}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download PDF
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Needed imports in AcademyModules.tsx
import { Target } from "lucide-react";
