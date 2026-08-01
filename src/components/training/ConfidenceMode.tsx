import React, { useState } from "react";
import { Target, CheckCircle2, XCircle, ArrowRight, RefreshCcw } from "lucide-react";

const SCENARIOS = [
  {
    id: 1,
    text: "You witness a motorcycle accident. The rider is lying on the road, unresponsive, and cars are still driving by. What is your VERY FIRST action?",
    options: [
      { text: "Run directly to the victim and check their pulse.", correct: false, feedback: "Danger! If cars are still driving by, you could become the second victim. Always secure the scene first." },
      { text: "Ensure the scene is safe (hazard lights, warning triangles, wave traffic to slow down).", correct: true, feedback: "Correct! Your safety is the absolute priority. Never rush into an unsafe scene." },
      { text: "Call emergency services.", correct: false, feedback: "Calling for help is crucial, but making sure you aren't hit by traffic comes first." },
      { text: "Remove their helmet.", correct: false, feedback: "Never remove a motorcyclist's helmet unless their airway is blocked. You could worsen a spinal injury." }
    ]
  },
  {
    id: 2,
    text: "The scene is safe. You approach the victim. They are not responding to your voice or a tap on the shoulder. What is your next step?",
    options: [
      { text: "Start chest compressions.", correct: false, feedback: "Wait! You haven't checked if they are breathing yet or called for help." },
      { text: "Call emergency services (or tell a specific bystander to do it) and check for breathing.", correct: true, feedback: "Excellent. Get professional help on the way immediately, then look at their chest to see if it's rising and falling (check for 5-10 seconds)." },
      { text: "Give them water.", correct: false, feedback: "Never give an unresponsive person anything by mouth. They could choke." },
      { text: "Move them to the side of the road.", correct: false, feedback: "Do not move them unless there is immediate danger (like a fire). Moving them can worsen spinal injuries." }
    ]
  },
  {
    id: 3,
    text: "You notice the victim is breathing normally, but they are bleeding heavily from their arm. What do you do?",
    options: [
      { text: "Apply direct, firm pressure to the wound with a clean cloth.", correct: true, feedback: "Spot on! Direct pressure is the most effective way to stop severe bleeding." },
      { text: "Wash the wound with water.", correct: false, feedback: "Washing is for minor cuts. Severe bleeding needs immediate pressure to stop blood loss." },
      { text: "Wait for the ambulance to deal with it.", correct: false, feedback: "Severe bleeding can become fatal in minutes. You must act during the Golden Hour." },
      { text: "Tie a string loosely above the wound.", correct: false, feedback: "A loose string won't stop arterial bleeding. Use direct pressure instead." }
    ]
  }
];

export function ConfidenceMode() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    setSelectedOption(idx);
  };

  const handleNext = () => {
    if (currentScenario < SCENARIOS.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsCompleted(true);
    }
  };

  const reset = () => {
    setCurrentScenario(0);
    setSelectedOption(null);
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
          <Target className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Confidence Boosted!</h2>
        <p className="text-surface-600 dark:text-surface-400 max-w-md mx-auto mb-8">
          You handled the emergency scenario perfectly. Mental rehearsal is key to overcoming hesitation in real life.
        </p>
        <button 
          onClick={reset}
          className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <RefreshCcw className="w-5 h-5" /> Practice Again
        </button>
      </div>
    );
  }

  const scenario = SCENARIOS[currentScenario];

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto flex flex-col h-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" /> Scenario Practice
          </h2>
          <span className="text-sm font-bold text-surface-500">
            {currentScenario + 1} / {SCENARIOS.length}
          </span>
        </div>
        <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 transition-all duration-500"
            style={{ width: `${((currentScenario) / SCENARIOS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-2xl font-semibold leading-relaxed mb-8">{scenario.text}</h3>
        
        <div className="space-y-3">
          {scenario.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = opt.correct;
            
            let btnClass = "border-surface-200 dark:border-surface-700 hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-800/50";
            if (selectedOption !== null) {
              if (isSelected && isCorrect) btnClass = "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400";
              else if (isSelected && !isCorrect) btnClass = "border-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400";
              else if (isCorrect) btnClass = "border-green-500 border-dashed opacity-50"; // Show correct answer if they got it wrong
              else btnClass = "border-surface-200 dark:border-surface-700 opacity-50";
            }

            return (
              <div key={idx} className="space-y-2">
                <button
                  onClick={() => handleSelect(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-5 rounded-2xl border-2 font-medium transition-all ${btnClass}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>{opt.text}</span>
                    {isSelected && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />}
                    {isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                  </div>
                </button>
                
                {/* Feedback Box */}
                {isSelected && (
                  <div className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 ${isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {opt.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedOption !== null && (
        <div className="pt-8 flex justify-end animate-in fade-in">
          <button 
            onClick={handleNext}
            className="px-8 py-3 bg-surface-900 dark:bg-white text-white dark:text-surface-900 rounded-xl font-bold transition-colors flex items-center gap-2 hover:bg-surface-800 dark:hover:bg-surface-100"
          >
            {currentScenario < SCENARIOS.length - 1 ? "Next Step" : "Complete"} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
