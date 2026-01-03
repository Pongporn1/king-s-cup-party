import { motion } from "framer-motion";
import { Gamepad2, Users, User, Settings, LogOut, Crown } from "lucide-react";
import { LoginButton } from "./LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { FriendSystem } from "./FriendSystem";
import { useState } from "react";

interface SidebarProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
}

export function Sidebar({ onNavigate, currentSection = "home" }: SidebarProps) {
  const { userId, displayName, logout } = useAuth();
  const [showFriendSystem, setShowFriendSystem] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navItems = [
    { id: "games", icon: Gamepad2, label: "Games" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "friends", icon: Users, label: "Friends" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);

    if (id === "friends") {
      setShowFriendSystem(true);
    } else if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "games") {
      const gamesSection = document.getElementById("games-section");
      gamesSection?.scrollIntoView({ behavior: "smooth" });
    } else if (id === "profile") {
      setShowProfile(true);
    } else if (id === "settings") {
      setShowSettings(true);
    } else {
      onNavigate?.(id);
    }
  };

  return (
    <>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-0 top-0 h-screen w-20 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 z-40"
      >
        {/* Logo/Brand */}
        <motion.div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/50 cursor-pointer"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setActiveSection("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          title="Home"
        >
          <Crown className="w-6 h-6 text-white" />
        </motion.div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50"
                    : "bg-white/5 hover:bg-white/10"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={item.label}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-white" : "text-white/60"
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -right-1 w-1 h-8 bg-cyan-400 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4 mt-auto">
          {userId ? (
            <>
              {/* User Avatar */}
              <motion.button
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={displayName || "User"}
              >
                {displayName?.charAt(0).toUpperCase() || "?"}
              </motion.button>

              {/* Logout */}
              <motion.button
                onClick={logout}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </motion.button>
            </>
          ) : (
            <div className="w-12">
              <LoginButton />
            </div>
          )}
        </div>
      </motion.div>

      {/* Friend System Modal */}
      {showFriendSystem && (
        <FriendSystem onClose={() => setShowFriendSystem(false)} />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowProfile(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">โปรไฟล์</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-3xl">
                  {displayName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-white font-medium text-lg">
                    {displayName || "Guest"}
                  </p>
                  <p className="text-zinc-400 text-sm">
                    {userId ? "Logged In" : "Guest User"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">การตั้งค่า</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white">ธีม</span>
                <span className="text-zinc-400">Auto</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white">ภาษา</span>
                <span className="text-zinc-400">ไทย</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white">เสียง</span>
                <span className="text-zinc-400">เปิด</span>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
