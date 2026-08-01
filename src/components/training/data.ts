import { HeartPulse, Droplets, Bone, Flame, UserMinus, Activity, Car, CheckCircle2 } from "lucide-react";

export const ACADEMY_MODULES = [
  {
    id: "cpr_basics",
    title: "CPR Basics",
    icon: HeartPulse,
    color: "text-red-500",
    bg: "bg-red-500/10",
    description: "Learn how to perform Hands-Only CPR to save a life.",
    objectives: [
      "Recognize cardiac arrest",
      "Understand the correct hand placement",
      "Learn the correct compression depth and rate"
    ],
    steps: [
      { title: "Check for Safety", content: "Ensure the scene is safe for you and the victim." },
      { title: "Check Responsiveness", content: "Tap their shoulder and shout, 'Are you okay?'" },
      { title: "Call for Help", content: "Call emergency services immediately if no response." },
      { title: "Check Breathing", content: "Look for normal chest rise and fall for 5-10 seconds." },
      { title: "Begin Compressions", content: "Place hands in center of chest. Push hard and fast (100-120 bpm, 2 inches deep)." }
    ],
    quiz: [
      {
        question: "What is the recommended rate of chest compressions?",
        options: ["60-80 per minute", "100-120 per minute", "150-180 per minute", "As fast as possible"],
        correctIndex: 1
      },
      {
        question: "How deep should your compressions be for an adult?",
        options: ["1 inch", "At least 2 inches", "3 inches", "Half an inch"],
        correctIndex: 1
      }
    ]
  },
  {
    id: "severe_bleeding",
    title: "Severe Bleeding Control",
    icon: Droplets,
    color: "text-red-600",
    bg: "bg-red-600/10",
    description: "Learn how to stop life-threatening bleeding.",
    objectives: [
      "Identify severe, life-threatening bleeding",
      "Apply direct pressure correctly",
      "Know when and how to use a tourniquet (if trained)"
    ],
    steps: [
      { title: "Ensure Safety", content: "Ensure the scene is safe and wear gloves if available." },
      { title: "Find the Source", content: "Expose the wound to find where the bleeding is coming from." },
      { title: "Apply Direct Pressure", content: "Use a clean cloth and apply firm, continuous pressure directly on the wound." },
      { title: "Maintain Pressure", content: "Do not remove the cloth. If blood soaks through, add more on top." }
    ],
    quiz: [
      {
        question: "What is the first step when treating severe bleeding?",
        options: ["Apply a tourniquet", "Apply direct pressure with a clean cloth", "Elevate the limb", "Wash the wound"],
        correctIndex: 1
      }
    ]
  },
  {
    id: "fracture_care",
    title: "Fracture Care",
    icon: Bone,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    description: "Learn how to stabilize a suspected broken bone.",
    objectives: [
      "Identify signs of a fracture",
      "Understand the importance of immobilization",
      "Provide basic comfort while waiting for help"
    ],
    steps: [
      { title: "Keep Still", content: "Do not try to realign the bone or push a bone that's sticking out back in." },
      { title: "Immobilize", content: "Support the injured area in the position it was found. You can use rolled-up newspapers or blankets as a splint if trained." },
      { title: "Apply Ice", content: "Apply an ice pack wrapped in a cloth to reduce swelling." },
      { title: "Treat for Shock", content: "Keep the person calm and warm." }
    ],
    quiz: [
      {
        question: "Should you try to push an exposed bone back into place?",
        options: ["Yes, immediately", "Only if you have gloves", "No, never", "Yes, if they are in pain"],
        correctIndex: 2
      }
    ]
  },
  {
    id: "burns",
    title: "Burns",
    icon: Flame,
    color: "text-orange-600",
    bg: "bg-orange-600/10",
    description: "Provide immediate care for different types of burns.",
    objectives: [
      "Stop the burning process",
      "Cool the burn effectively",
      "Know what NOT to apply to a burn"
    ],
    steps: [
      { title: "Stop the Burning", content: "Remove the person from the source of the burn." },
      { title: "Cool the Burn", content: "Hold the burned area under cool (not cold) running water for 10-20 minutes." },
      { title: "Remove Constrictions", content: "Remove rings or tight items from the burned area before it swells." },
      { title: "Cover the Burn", content: "Cover lightly with a sterile, non-fluffy dressing or cling film." }
    ],
    quiz: [
      {
        question: "What should you use to cool a burn?",
        options: ["Ice", "Butter", "Cool running water for 10-20 mins", "Ointment"],
        correctIndex: 2
      }
    ]
  },
  {
    id: "choking",
    title: "Choking",
    icon: UserMinus,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    description: "Help someone who is choking and cannot breathe.",
    objectives: [
      "Recognize the universal sign of choking",
      "Perform back blows",
      "Perform abdominal thrusts (Heimlich maneuver)"
    ],
    steps: [
      { title: "Encourage Coughing", content: "If they can cough loudly, encourage them to keep coughing." },
      { title: "5 Back Blows", content: "Stand to the side/behind. Support their chest, lean them forward, and give 5 sharp blows between the shoulder blades with the heel of your hand." },
      { title: "5 Abdominal Thrusts", content: "Stand behind, make a fist above their navel, grasp with the other hand, and pull inward and upward 5 times." },
      { title: "Alternate", content: "Continue alternating 5 back blows and 5 abdominal thrusts until the object is dislodged." }
    ],
    quiz: [
      {
        question: "What should you do if the choking person can cough loudly?",
        options: ["Start back blows", "Do abdominal thrusts", "Encourage them to keep coughing", "Give them water"],
        correctIndex: 2
      }
    ]
  },
  {
    id: "recovery_position",
    title: "Recovery Position",
    icon: Activity,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    description: "Keep an unconscious, breathing person's airway clear.",
    objectives: [
      "Determine when to use the recovery position",
      "Safely roll a person onto their side",
      "Ensure their airway remains open"
    ],
    steps: [
      { title: "Arm Placement", content: "Place the arm nearest to you at a right angle to their body." },
      { title: "Hand to Cheek", content: "Bring the other arm across their chest and hold the back of their hand against their opposite cheek." },
      { title: "Bend the Knee", content: "With your other hand, pull the far knee up so the foot is flat on the ground." },
      { title: "Roll", content: "Keep their hand on their cheek, pull on the far leg to roll them towards you onto their side. Tilt the head back to keep the airway open." }
    ],
    quiz: [
      {
        question: "Why do we use the recovery position?",
        options: ["To make them comfortable", "To keep the airway clear and prevent choking on vomit", "To wake them up", "To stretch their muscles"],
        correctIndex: 1
      }
    ]
  },
  {
    id: "head_injury",
    title: "Head Injury",
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: "Respond safely to suspected head, neck, or spinal injuries.",
    objectives: [
      "Recognize signs of concussion or severe head injury",
      "Understand the importance of spinal immobilization",
      "Monitor responsiveness"
    ],
    steps: [
      { title: "Do Not Move Them", content: "Unless they are in immediate danger, do not move someone with a suspected head or spinal injury." },
      { title: "Stabilize the Head", content: "Hold the person's head and neck in the position you found them to prevent movement." },
      { title: "Control Bleeding", content: "If bleeding, apply firm pressure with a clean cloth, but do not apply direct pressure to a suspected skull fracture." },
      { title: "Monitor", content: "Keep them calm and monitor their breathing and level of response." }
    ],
    quiz: [
      {
        question: "If someone has a suspected spinal injury, should you move them?",
        options: ["Yes, to a softer surface", "No, unless they are in immediate danger", "Yes, to sit them up", "Only if they ask you to"],
        correctIndex: 1
      }
    ]
  },
  {
    id: "road_accident",
    title: "Road Accident Response",
    icon: Car,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    description: "Learn how to secure a scene and help victims safely.",
    objectives: [
      "Assess scene safety",
      "Triage multiple victims",
      "Provide immediate life-saving care"
    ],
    steps: [
      { title: "Secure the Scene", content: "Turn on hazard lights. Set up warning triangles. Do not put yourself in danger." },
      { title: "Call for Help", content: "Call emergency services immediately and provide the exact location." },
      { title: "Check Vehicles", content: "Turn off the ignition of the crashed vehicles if possible and safe to do so." },
      { title: "Assess Victims", content: "Check who is unresponsive or bleeding severely. Prioritize life-threatening conditions. Do not move them unless there is immediate danger (like fire)." }
    ],
    quiz: [
      {
        question: "What is the VERY FIRST thing you should do when arriving at a road accident?",
        options: ["Pull victims out of the car", "Ensure the scene is safe (hazard lights, warning triangles)", "Start CPR on the closest person", "Offer them water"],
        correctIndex: 1
      }
    ]
  }
];
