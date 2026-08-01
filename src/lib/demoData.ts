export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "volunteer" | "responder" | "admin";
  bloodType: string;
  emergencyContact: string;
  phone: string;
  cprCertified: boolean;
  avatar: string;
}

export interface DemoVolunteer {
  id: string;
  name: string;
  distanceKm: number;
  etaMinutes: number;
  skills: string[];
  rating: number;
  phone: string;
  status: "available" | "en_route" | "on_scene";
  lat: number;
  lng: number;
}

export interface DemoHospital {
  id: string;
  name: string;
  vicinity: string;
  distanceKm: number;
  traumaLevel: string;
  bedsAvailable: number;
  phone: string;
  lat: number;
  lng: number;
  isOpen: boolean;
}

export interface DemoPoliceStation {
  id: string;
  name: string;
  vicinity: string;
  unitsAvailable: number;
  phone: string;
  lat: number;
  lng: number;
}

export interface DemoHazard {
  id: string;
  type: "accident" | "blackspot" | "flood" | "debris" | "pothole" | "construction";
  description: string;
  lat: number;
  lng: number;
  timestamp: string;
  reportedBy: string;
  votes: number;
  status: "active" | "cleared" | "verifying";
}

export interface DemoEmergency {
  id: string;
  patientName: string;
  type: string;
  severity: "critical" | "high" | "moderate";
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: "dispatched" | "volunteer_en_route" | "hospital_assigned" | "completed";
  assignedVolunteer?: string;
  assignedHospital?: string;
  etaMinutes: number;
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "alert" | "info" | "success" | "warning";
  read: boolean;
}

export interface DemoAIChat {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  options?: string[];
}

export interface DemoCertificate {
  id: string;
  title: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  certificateId: string;
  badgeUrl: string;
}

export interface DemoCommunityPost {
  id: string;
  author: string;
  role: string;
  timeAgo: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  category: "Story" | "Tip" | "Event" | "Alert";
}

// 15 Users
export const DEMO_USERS: DemoUser[] = [
  { id: "u1", name: "Alex Rivera", email: "alex.rivera@example.com", role: "citizen", bloodType: "O+", emergencyContact: "555-0192", phone: "555-0101", cprCertified: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
  { id: "u2", name: "Dr. Sarah Jenkins", email: "s.jenkins@generalhosp.org", role: "responder", bloodType: "A-", emergencyContact: "555-0193", phone: "555-0102", cprCertified: true, avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150" },
  { id: "u3", name: "Marcus Chen", email: "marcus.chen@example.com", role: "volunteer", bloodType: "B+", emergencyContact: "555-0194", phone: "555-0103", cprCertified: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { id: "u4", name: "Priya Sharma", email: "priya.s@example.com", role: "volunteer", bloodType: "AB+", emergencyContact: "555-0195", phone: "555-0104", cprCertified: true, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  { id: "u5", name: "Officer David Miller", email: "d.miller@citypolice.gov", role: "admin", bloodType: "O-", emergencyContact: "555-0196", phone: "555-0105", cprCertified: true, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  { id: "u6", name: "Emily Watson", email: "emily.w@example.com", role: "citizen", bloodType: "A+", emergencyContact: "555-0197", phone: "555-0106", cprCertified: false, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" },
  { id: "u7", name: "Carlos Rossi", email: "carlos.r@example.com", role: "volunteer", bloodType: "O+", emergencyContact: "555-0198", phone: "555-0107", cprCertified: true, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  { id: "u8", name: "Aisha Patel", email: "aisha.p@example.com", role: "citizen", bloodType: "B-", emergencyContact: "555-0199", phone: "555-0108", cprCertified: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
  { id: "u9", name: "James Wilson", email: "j.wilson@example.com", role: "volunteer", bloodType: "A+", emergencyContact: "555-0200", phone: "555-0109", cprCertified: true, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150" },
  { id: "u10", name: "Elena Rostova", email: "elena.r@example.com", role: "responder", bloodType: "AB-", emergencyContact: "555-0201", phone: "555-0110", cprCertified: true, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
  { id: "u11", name: "Liam O'Connor", email: "liam.oc@example.com", role: "citizen", bloodType: "O+", emergencyContact: "555-0202", phone: "555-0111", cprCertified: false, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150" },
  { id: "u12", name: "Mei Ling", email: "mei.ling@example.com", role: "volunteer", bloodType: "A-", emergencyContact: "555-0203", phone: "555-0112", cprCertified: true, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" },
  { id: "u13", name: "Robert Taylor", email: "rob.taylor@example.com", role: "citizen", bloodType: "B+", emergencyContact: "555-0204", phone: "555-0113", cprCertified: true, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150" },
  { id: "u14", name: "Sophia Martinez", email: "sophia.m@example.com", role: "volunteer", bloodType: "O-", emergencyContact: "555-0205", phone: "555-0114", cprCertified: true, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150" },
  { id: "u15", name: "Tariq Al-Mansoor", email: "tariq.a@example.com", role: "volunteer", bloodType: "AB+", emergencyContact: "555-0206", phone: "555-0115", cprCertified: true, avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150" }
];

// 8 Volunteers
export const DEMO_VOLUNTEERS: DemoVolunteer[] = [
  { id: "v1", name: "Marcus Chen", distanceKm: 0.4, etaMinutes: 2, skills: ["CPR Certified", "AED Qualified", "Bleeding Control"], rating: 4.9, phone: "555-0103", status: "en_route", lat: 37.7755, lng: -122.4180 },
  { id: "v2", name: "Priya Sharma", distanceKm: 0.9, etaMinutes: 4, skills: ["BLS Certified", "Pediatric First Aid"], rating: 4.95, phone: "555-0104", status: "available", lat: 37.7760, lng: -122.4210 },
  { id: "v3", name: "Carlos Rossi", distanceKm: 1.2, etaMinutes: 5, skills: ["Trauma First Responder", "CPR"], rating: 4.8, phone: "555-0107", status: "available", lat: 37.7730, lng: -122.4150 },
  { id: "v4", name: "James Wilson", distanceKm: 1.5, etaMinutes: 7, skills: ["Firefighter / EMT", "Hazmat Basic"], rating: 5.0, phone: "555-0109", status: "on_scene", lat: 37.7780, lng: -122.4190 },
  { id: "v5", name: "Mei Ling", distanceKm: 1.8, etaMinutes: 8, skills: ["Red Cross Certified", "Triage"], rating: 4.88, phone: "555-0112", status: "available", lat: 37.7710, lng: -122.4220 },
  { id: "v6", name: "Sophia Martinez", distanceKm: 2.1, etaMinutes: 9, skills: ["ER Nurse", "CPR Specialist"], rating: 4.97, phone: "555-0114", status: "available", lat: 37.7795, lng: -122.4160 },
  { id: "v7", name: "Tariq Al-Mansoor", distanceKm: 2.5, etaMinutes: 11, skills: ["Paramedic Volunteer", "AED Expert"], rating: 4.92, phone: "555-0115", status: "available", lat: 37.7700, lng: -122.4250 },
  { id: "v8", name: "Elena Rostova", distanceKm: 2.8, etaMinutes: 13, skills: ["Wilderness First Aid", "CPR"], rating: 4.85, phone: "555-0110", status: "available", lat: 37.7810, lng: -122.4120 }
];

// 5 Hospitals
export const DEMO_HOSPITALS: DemoHospital[] = [
  { id: "h1", name: "St. Jude Metropolitan Trauma Center", vicinity: "123 Medical Plaza, Downtown", distanceKm: 1.2, traumaLevel: "Level I Trauma", bedsAvailable: 14, phone: "555-9111", lat: 37.7849, lng: -122.4094, isOpen: true },
  { id: "h2", name: "Valley Health General Hospital", vicinity: "456 Recovery Boulevard", distanceKm: 2.8, traumaLevel: "Level II Trauma", bedsAvailable: 8, phone: "555-9112", lat: 37.7600, lng: -122.4294, isOpen: true },
  { id: "h3", name: "City Center Emergency & Cardiac Care", vicinity: "789 Heart Avenue", distanceKm: 3.4, traumaLevel: "Cardiac Specialty", bedsAvailable: 5, phone: "555-9113", lat: 37.7890, lng: -122.4250, isOpen: true },
  { id: "h4", name: "University Memorial Hospital", vicinity: "101 Academic Way", distanceKm: 4.1, traumaLevel: "Level I Trauma", bedsAvailable: 22, phone: "555-9114", lat: 37.7650, lng: -122.4400, isOpen: true },
  { id: "h5", name: "Sunrise Community Medical Center", vicinity: "555 Hope Street", distanceKm: 5.2, traumaLevel: "Urgent Care & ER", bedsAvailable: 11, phone: "555-9115", lat: 37.7950, lng: -122.4000, isOpen: true }
];

// 3 Police Stations
export const DEMO_POLICE_STATIONS: DemoPoliceStation[] = [
  { id: "p1", name: "Central Police Precinct", vicinity: "789 Justice Avenue", unitsAvailable: 6, phone: "555-0911", lat: 37.7799, lng: -122.4294 },
  { id: "p2", name: "Northside Highway Patrol Hub", vicinity: "321 Expressway Way", unitsAvailable: 4, phone: "555-0912", lat: 37.7920, lng: -122.4100 },
  { id: "p3", name: "South District Police Station", vicinity: "888 Safety Drive", unitsAvailable: 5, phone: "555-0913", lat: 37.7580, lng: -122.4180 }
];

// 6 Hazard Reports
export const DEMO_HAZARDS: DemoHazard[] = [
  { id: "hz1", type: "accident", description: "Multi-vehicle collision blocking 2 lanes on Highway 101 N", lat: 37.7780, lng: -122.4150, timestamp: "12 mins ago", reportedBy: "Alex Rivera", votes: 24, status: "active" },
  { id: "hz2", type: "flood", description: "Severe water pooling under 4th Street Underpass", lat: 37.7710, lng: -122.4220, timestamp: "28 mins ago", reportedBy: "Marcus Chen", votes: 18, status: "active" },
  { id: "hz3", type: "blackspot", description: "Blind intersection with malfunctioning traffic light at Oak & 12th", lat: 37.7830, lng: -122.4280, timestamp: "45 mins ago", reportedBy: "Sophia Martinez", votes: 31, status: "active" },
  { id: "hz4", type: "debris", description: "Large construction timber fallen across right lane", lat: 37.7690, lng: -122.4110, timestamp: "1 hour ago", reportedBy: "Carlos Rossi", votes: 12, status: "active" },
  { id: "hz5", type: "pothole", description: "Deep 8-inch asphalt collapse creating tire blowout hazard", lat: 37.7890, lng: -122.4050, timestamp: "2 hours ago", reportedBy: "Priya Sharma", votes: 45, status: "active" },
  { id: "hz6", type: "construction", description: "Unmarked nocturnal roadwork with missing warning flares", lat: 37.7620, lng: -122.4350, timestamp: "3 hours ago", reportedBy: "James Wilson", votes: 9, status: "verifying" }
];

// 4 Active Emergencies
export const DEMO_EMERGENCIES: DemoEmergency[] = [
  { id: "em1", patientName: "Alex Rivera", type: "Severe Motorbike Crash / Unconscious", severity: "critical", location: "Market St & 5th Ave", lat: 37.7830, lng: -122.4080, timestamp: "3 mins ago", status: "volunteer_en_route", assignedVolunteer: "Marcus Chen (0.4km away)", assignedHospital: "St. Jude Metropolitan Trauma Center", etaMinutes: 2 },
  { id: "em2", patientName: "John Doe (Bystander SOS)", type: "Cardiac Arrest / CPR In Progress", severity: "critical", location: "Civic Center Plaza", lat: 37.7790, lng: -122.4180, timestamp: "6 mins ago", status: "hospital_assigned", assignedVolunteer: "Sophia Martinez (0.8km away)", assignedHospital: "City Center Emergency", etaMinutes: 4 },
  { id: "em3", patientName: "Emily Watson", type: "Pedestrian Collision / Arterial Bleed", severity: "high", location: "Mission St & 16th", lat: 37.7650, lng: -122.4190, timestamp: "11 mins ago", status: "dispatched", assignedVolunteer: "Priya Sharma", assignedHospital: "Valley Health Hospital", etaMinutes: 5 },
  { id: "em4", patientName: "Robert Taylor", type: "Severe Allergic Anaphylaxis", severity: "high", location: "Embarcadero Plaza", lat: 37.7930, lng: -122.3940, timestamp: "18 mins ago", status: "completed", assignedVolunteer: "James Wilson", assignedHospital: "Sunrise Community Hospital", etaMinutes: 0 }
];

// Notifications
export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  { id: "n1", title: "🚨 SOS Dispatch Alert", message: "Emergency reported 0.4km away. Marcus Chen accepted responder dispatch.", timestamp: "Just now", type: "alert", read: false },
  { id: "n2", title: "🏥 Hospital Bed Reserved", message: "St. Jude Trauma Center Level I Trauma Unit reserved for incoming patient.", timestamp: "2 mins ago", type: "success", read: false },
  { id: "n3", title: "🤖 GoldenGuard AI First Aid", message: "Step 2 CPR Rhythms activated (100-120 BPM audio metronome live).", timestamp: "4 mins ago", type: "info", read: true },
  { id: "n4", title: "⚠️ Hazard Verified nearby", message: "Multi-vehicle collision verified on Highway 101 N by 24 community members.", timestamp: "15 mins ago", type: "warning", read: true }
];

// AI Chats
export const DEMO_AI_CHATS: DemoAIChat[] = [
  { id: "c1", sender: "ai", text: "🚨 **EMERGENCY DISPATCH ACTIVATED.** I am GoldenGuard AI First Aid. I have dispatched emergency medical services and alerted 3 nearby CPR-certified volunteers. Is the patient breathing?", timestamp: "12:30:01 PM", options: ["Yes, breathing normally", "No / Struggling to breathe", "Unconscious / Not responding"] },
  { id: "c2", sender: "user", text: "No / Struggling to breathe. The patient is on the road.", timestamp: "12:30:15 PM" },
  { id: "c3", sender: "ai", text: "⚠️ **CRITICAL: START CPR IMMEDIATELY.**\n\n1. Place patient flat on their back on hard ground.\n2. Place heel of one hand on center of chest, other hand on top.\n3. Push hard and fast at **100-120 compressions per minute** (follow beat below).\n4. Volunteer Marcus Chen is 2 minutes away with an AED unit.", timestamp: "12:30:18 PM", options: ["Start Audio Metronome 🎵", "Check Bleeding", "Call Ambulance Operator"] }
];

// CPR Certificates
export const DEMO_CERTIFICATES: DemoCertificate[] = [
  { id: "crt1", title: "Adult & Pediatric BLS / CPR", issuedBy: "American Heart Association & GoldenGuard", issuedDate: "2026-01-15", expiryDate: "2028-01-15", certificateId: "GG-CPR-2026-8891", badgeUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200" },
  { id: "crt2", title: "Automated External Defibrillator (AED) Master", issuedBy: "GoldenGuard Medical Safety Board", issuedDate: "2026-03-10", expiryDate: "2028-03-10", certificateId: "GG-AED-2026-4420", badgeUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200" },
  { id: "crt3", title: "Good Samaritan First Responder Level III", issuedBy: "Global Emergency Responder Network", issuedDate: "2026-05-22", expiryDate: "2028-05-22", certificateId: "GG-GSR-2026-1102", badgeUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=200" }
];

// Community Posts
export const DEMO_POSTS: DemoCommunityPost[] = [
  { id: "p1", author: "Dr. Sarah Jenkins", role: "ER Chief & Medical Advisor", timeAgo: "2 hours ago", title: "Why the First 10 Minutes ('Golden Hour') Determine Survival Rates", content: "In traumatic road accidents and cardiac arrest, cellular hypoxia starts within 4 minutes. Having GoldenGuard dispatch verified local bystanders with AEDs cuts arrival time from 12 mins to under 3 mins. That's the difference between life and brain death.", likes: 142, comments: 28, category: "Tip" },
  { id: "p2", author: "Marcus Chen", role: "Certified Volunteer (12 Lives Saved)", timeAgo: "5 hours ago", title: "Saved a Motorcyclist on Highway 101 thanks to GoldenGuard Alert!", content: "Received an immediate push alert while getting coffee. Was 400m away with my portable medical kit. Controlled severe arterial bleed with a tourniquet before the ambulance arrived. The system works seamlessly!", likes: 389, comments: 54, category: "Story" },
  { id: "p3", author: "Officer David Miller", role: "Traffic Safety Chief", timeAgo: "1 day ago", title: "Community Blackspot Reporting Reduced Accidents by 34% this Month", content: "Thanks to everyone flagging dangerous road hazards and blind intersections in the Smart Map. Our municipal crews fixed 14 high-risk spots this week alone.", likes: 215, comments: 19, category: "Alert" }
];
