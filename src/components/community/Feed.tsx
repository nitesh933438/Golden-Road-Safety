import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, AlertTriangle, ShieldCheck, MapPin, Send, Sparkles } from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

interface Post {
  id: string;
  author: string;
  role: string;
  avatarInitials: string;
  avatarColor: string;
  photoURL?: string;
  time: string;
  content: string;
  type: "tip" | "hazard" | "success" | "campaign";
  likes: number;
  comments: number;
}

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: "City Traffic Police",
    role: "Official Authority",
    avatarInitials: "TP",
    avatarColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    time: "2 hours ago",
    content: "Road Safety Campaign this weekend! Join us at Central Park to learn about blind spots and safe pedestrian crossings. Free reflective gear for the first 100 attendees.",
    type: "campaign",
    likes: 342,
    comments: 45
  },
  {
    id: "2",
    author: "Sarah Jenkins",
    role: "Golden Guardian Volunteer",
    avatarInitials: "SJ",
    avatarColor: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    time: "4 hours ago",
    content: "Just completed my 5th successful rescue. A reminder to everyone: if you see an accident, don't just record it. Ensure the scene is safe and call for help immediately. The Good Samaritan Law protects you!",
    type: "success",
    likes: 892,
    comments: 102
  },
  {
    id: "3",
    author: "Michael Chang",
    role: "Community Member",
    avatarInitials: "MC",
    avatarColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    time: "5 hours ago",
    content: "Hazard Alert: Large pothole on the right lane of Highway 42 near Exit 5. Several cars have already blown tires. Please drive carefully!",
    type: "hazard",
    likes: 156,
    comments: 23
  },
  {
    id: "4",
    author: "Dr. Ananya Sharma",
    role: "Medical Professional",
    avatarInitials: "AS",
    avatarColor: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    time: "1 day ago",
    content: "First Aid Tip of the Day: When applying pressure to a severe bleed, do NOT remove the first layer of cloth if blood soaks through. Just add another layer on top and keep pressing. Removing the cloth rips away clotting factors.",
    type: "tip",
    likes: 1205,
    comments: 89
  }
];

export function Feed() {
  const { userProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPostText, setNewPostText] = useState("");
  const [postType, setPostType] = useState<"tip" | "hazard" | "success" | "campaign">("tip");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const q = query(collection(db, "communityPosts"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const fetched: Post[] = snapshot.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              author: d.author || "Community Member",
              role: d.role || "Good Samaritan",
              avatarInitials: d.author ? d.author.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "CM",
              avatarColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
              photoURL: d.photoURL || "",
              time: "Just now",
              content: d.content || "",
              type: d.type || "tip",
              likes: d.likes || 1,
              comments: d.comments || 0
            };
          });

          setPosts((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const newFetched = fetched.filter(f => !existingIds.has(f.id));
            if (newFetched.length === 0) return prev;
            return [...newFetched, ...prev];
          });
        }
      }, (err) => console.warn("Feed snapshot notice:", err));
    } catch (e) {}

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;
    const authorName = userProfile?.name || "Good Samaritan";
    const authorRole = userProfile?.role === "admin" ? "GoldenGuard Administrator" : "Active Citizen Responder";

    const newPost: Post = {
      id: `local-${Date.now()}`,
      author: authorName,
      role: authorRole,
      avatarInitials: authorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
      avatarColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      photoURL: userProfile?.photoURL || "",
      time: "Just now",
      content: newPostText,
      type: postType,
      likes: 1,
      comments: 0
    };

    setPosts([newPost, ...posts]);
    const currentText = newPostText;
    setNewPostText("");

    try {
      await addDoc(collection(db, "communityPosts"), {
        author: authorName,
        role: authorRole,
        photoURL: userProfile?.photoURL || "",
        content: currentText,
        type: postType,
        likes: 1,
        comments: 0,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Firestore community post notice:", e);
    }
  };

  const toggleLike = (id: string) => {
    setLikedPosts(prev => {
      const isLiked = !prev[id];
      setPosts(currentPosts => currentPosts.map(p => {
        if (p.id === id) {
          return { ...p, likes: isLiked ? p.likes + 1 : p.likes - 1 };
        }
        return p;
      }));
      return { ...prev, [id]: isLiked };
    });
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "tip": return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case "hazard": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success": return <Heart className="w-4 h-4 text-red-500" />;
      case "campaign": return <MapPin className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "tip": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "hazard": return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "success": return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800";
      case "campaign": return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default: return "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      
      {/* Create Post Input */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 shadow-sm flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0">
          ME
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreatePost()}
            placeholder="Share a safety tip or report a hazard..."
            className="w-full bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <button 
                onClick={() => setPostType("hazard")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  postType === "hazard" ? "bg-amber-500 text-white" : "bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Hazard
              </button>
              <button 
                onClick={() => setPostType("tip")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  postType === "tip" ? "bg-emerald-600 text-white" : "bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Tip
              </button>
            </div>
            <button 
              onClick={handleCreatePost}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {posts.map((post) => {
          const isLiked = likedPosts[post.id];
          return (
            <div key={post.id} className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden ${post.avatarColor}`}>
                    {post.photoURL ? (
                      <img src={post.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{post.avatarInitials}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 dark:text-white leading-tight">{post.author}</h3>
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      <span>{post.role}</span>
                      <span>•</span>
                      <span>{post.time}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 capitalize ${getBadgeColor(post.type)}`}>
                  {getBadgeIcon(post.type)} {post.type}
                </div>
              </div>

              <p className="text-surface-700 dark:text-surface-300 text-sm leading-relaxed mb-4">
                {post.content}
              </p>

              <div className="flex items-center gap-6 pt-4 border-t border-surface-100 dark:border-surface-700">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors text-sm font-semibold ${
                    isLiked ? "text-red-500 font-bold" : "text-surface-500 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} /> {post.likes}
                </button>
                <button 
                  onClick={() => alert(`Comments for "${post.author}": ${post.comments} comments on community thread.`)}
                  className="flex items-center gap-2 text-surface-500 hover:text-blue-500 transition-colors text-sm font-medium"
                >
                  <MessageCircle className="w-5 h-5" /> {post.comments}
                </button>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.author, text: post.content });
                    } else {
                      navigator.clipboard.writeText(post.content);
                      alert("Post content copied to clipboard!");
                    }
                  }}
                  className="flex items-center gap-2 text-surface-500 hover:text-green-500 transition-colors text-sm font-medium ml-auto"
                >
                  <Share2 className="w-5 h-5" /> Share
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
